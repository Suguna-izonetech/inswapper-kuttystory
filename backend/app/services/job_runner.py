import logging
logger = logging.getLogger(__name__)
import asyncio
import os
import time
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.config import settings
from app.models import PersonalizationJob, StoryPage, GeneratedAsset, Book, StoryTemplate
from app.services.storage import storage
from app.services.pdf_composer import PDFComposerService
from app.services.ai.diffusers_provider import diffusers_provider
from app.services.ai.mock_provider import mock_provider
from app.services.ai.gemini_provider import gemini_provider
from app.services.ai.consistency_engine import CharacterConsistencyEngine
from app.services.ai.cartoon_fusion import cartoon_fusion_engine
from app.database import SessionLocal
import threading

_JOB_LOCKS: Dict[str, threading.Lock] = {}
_LOCK_MUTEX = threading.Lock()

def _get_job_lock(job_id: str) -> threading.Lock:
    with _LOCK_MUTEX:
        if job_id not in _JOB_LOCKS:
            _JOB_LOCKS[job_id] = threading.Lock()
        return _JOB_LOCKS[job_id]

class JobRunner:
    """
    Background job pipeline manager for personalizing storybooks and composing PDFs.
    """

    @staticmethod
    async def process_preview_job(job_id: str):
        """
        Asynchronously process preview generation:
        1. Select representative pages for preview (e.g. Cover, Page 3, Page 6, Page 7, Page 10)
        2. Normalize child photo with solid studio backdrop
        3. Seamlessly fuse child cartoon face into storybook artwork preserving unicorn
        4. Assemble preview PDF
        5. Mark job complete
        """
        db: Session = SessionLocal()
        try:
            job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
            if not job:
                return

            story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
            story_slug = story.slug if story else "unicorn-story"
            story_title = story.title if story else "Storybook"

            # Remove previous assets and books if re-running this job
            db.query(GeneratedAsset).filter(GeneratedAsset.job_id == job.id).delete()
            db.query(Book).filter(Book.job_id == job.id).delete()
            job.completed_pages = 0
            job.failed_pages = 0

            job.status = "analyzing"
            job.current_stage = f"Analyzing {story_title} scenes & preparing character reference"
            db.commit()

            # Normalize child reference photo
            norm_ref = CharacterConsistencyEngine.normalize_child_reference(job.photo_path)

            # Get story pages
            story_pages = db.query(StoryPage).filter(StoryPage.story_id == job.story_id).order_by(StoryPage.page_index).all()
            
            # Choose pages to personalize for preview (strictly 3 images)
            from app.models import AISettings
            ai_conf = db.query(AISettings).filter(AISettings.id == "default").first()
            limit_val = ai_conf.preview_page_limit if ai_conf and ai_conf.preview_page_limit else settings.PREVIEW_PAGE_LIMIT
            preview_limit = min(limit_val, 3, len(story_pages))
            # Pick 3 representative beats across the story (Cover/Intro, Page 3, Page 7)
            preview_page_indices = [0, 2, 6] if len(story_pages) >= 7 else list(range(preview_limit))
            preview_page_indices = preview_page_indices[:preview_limit]
            target_pages = [story_pages[i] for i in preview_page_indices if i < len(story_pages)]

            job.total_pages = len(target_pages)
            job.status = "generating"
            job.current_stage = f"Generating personalized illustrations (0/{len(target_pages)})"
            db.commit()

            generated_pages_data = []

            for idx, page in enumerate(target_pages):
                job.current_stage = f"Fusing cartoon character for Page {page.page_number} ({idx+1}/{len(target_pages)})"
                db.commit()

                # Personalized story narrative
                raw_text = page.story_text or page.extracted_text or f"Story scene for page {page.page_number}"
                personalized_text = raw_text
                for tag in ["[Name]", "{name}", "[child_name]", "{child_name}"]:
                    personalized_text = personalized_text.replace(tag, job.child_name)

                prompt = page.prompt_template or f"Children's book illustration for {story_title}, page {page.page_number}"
                expanded = await gemini_provider.expand_prompt(prompt, job.child_name)

                try:
                    if settings.ACTIVE_IMAGE_PROVIDER == "huggingface" and settings.HF_TOKEN:
                        gen_res = await diffusers_provider.generate_illustration(
                            prompt=expanded,
                            reference_image_path=norm_ref,
                            width=1024,
                            height=1024
                        )
                    else:
                        page_img = page.original_image_path or f"source_pages/{story_slug}/page_{page.page_number:02d}.png"
                        gen_res = cartoon_fusion_engine.fuse_page(
                            page_number=page.page_number,
                            child_reference_path=norm_ref,
                            story_slug=story_slug,
                            page_image_path=page_img,
                            face_outline_points=page.face_outline_points,
                            prefer_local=getattr(settings, "PREFER_LOCAL_FUSION", False),
                            job_id=str(job.id)
                        )

                    # Save generated image to MinIO
                    asset_filename = f"job_{job.id}_p{page.page_number:02d}_{int(time.time())}.{gen_res.format}"
                    asset_path = storage.save_bytes(
                        data=gen_res.image_bytes,
                        category="generated_assets",
                        custom_name=f"{job.id}/{asset_filename}"
                    )

                    # Record asset in DB
                    asset = GeneratedAsset(
                        job_id=job.id,
                        story_page_id=page.id,
                        page_number=page.page_number,
                        storage_path=asset_path,
                        provider=gen_res.provider,
                        model=gen_res.model,
                        prompt_used=personalized_text or expanded,
                        generation_status="completed",
                        review_status="approved",
                        cost_estimate=gen_res.cost_estimate_usd,
                        generation_time_sec=gen_res.generation_time_sec
                    )
                    db.add(asset)
                    job.completed_pages += 1
                    db.commit()

                    generated_pages_data.append({
                        "page_number": page.page_number,
                        "page_type": page.page_type,
                        "image_path": asset_path,
                        "story_text": personalized_text
                    })
                except Exception as e:
                    job.failed_pages += 1
                    job.error_details = str(e)
                    db.commit()

            # Assemble Preview PDF
            job.status = "assembling_preview"
            job.current_stage = "Composing deterministic preview PDF with ReportLab"
            db.commit()

            preview_filename = f"preview_{job.id}.pdf"
            pdf_path, validation = PDFComposerService.compose_storybook_pdf(
                pages_data=generated_pages_data[:3],
                output_filename=preview_filename,
                book_type="preview",
                child_name=job.child_name,
                story_title=story_title
            )

            import json
            book = Book(
                job_id=job.id,
                book_type="preview",
                pdf_storage_path=pdf_path,
                page_count=min(len(generated_pages_data), 3),
                validation_status="valid" if validation["validation_passed"] else "flagged",
                validation_details=json.dumps(validation)
            )
            db.add(book)

            job.status = "completed"
            job.current_stage = "Preview generated successfully"
            db.commit()

        except Exception as ex:
            job.status = "failed"
            job.error_details = str(ex)
            db.commit()
        finally:
            db.close()

    @staticmethod
    async def regenerate_single_page(asset_id: str) -> Optional[GeneratedAsset]:
        """
        Regenerate a single rejected or failed page asset without discarding other pages.
        """
        db: Session = SessionLocal()
        try:
            asset = db.query(GeneratedAsset).filter(GeneratedAsset.id == asset_id).first()
            if not asset:
                return None

            job = db.query(PersonalizationJob).filter(PersonalizationJob.id == asset.job_id).first()
            page = db.query(StoryPage).filter(StoryPage.id == asset.story_page_id).first()
            if not job or not page:
                return None

            story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
            story_slug = story.slug if story else "unicorn-story"
            story_title = story.title if story else "Storybook"

            raw_text = page.story_text or page.extracted_text or f"Story scene for page {page.page_number}"
            personalized_text = raw_text
            for tag in ["[Name]", "{name}", "[child_name]", "{child_name}"]:
                personalized_text = personalized_text.replace(tag, job.child_name)

            prompt = page.prompt_template or f"Children's book illustration for {story_title}, page {page.page_number}"
            expanded = await gemini_provider.expand_prompt(prompt, job.child_name)

            if settings.ACTIVE_IMAGE_PROVIDER == "huggingface" and settings.HF_TOKEN:
                gen_res = await diffusers_provider.generate_illustration(
                    prompt=expanded,
                    reference_image_path=job.photo_path,
                    width=1024,
                    height=1024
                )
            else:
                page_img = page.original_image_path
                if not page_img or not os.path.exists(page_img):
                    cand = settings.SOURCE_PAGES_DIR / story_slug / f"page_{page.page_number:02d}.png"
                    if cand.exists():
                        page_img = str(cand)
                gen_res = await cartoon_fusion_engine.fuse_page_async(
                    page_number=page.page_number,
                    child_reference_path=job.photo_path,
                    story_slug=story_slug,
                    page_image_path=page_img,
                    face_outline_points=page.face_outline_points,
                    job_id=str(job.id)
                )

            asset_filename = f"job_{job.id}_p{page.page_number:02d}_v{asset.asset_version + 1}_{int(time.time())}.{gen_res.format}"
            new_path = storage.save_bytes(
                data=gen_res.image_bytes,
                category="generated_assets",
                custom_name=f"{job.id}/{asset_filename}"
            )

            asset.storage_path = new_path
            asset.asset_version += 1
            asset.generation_status = "completed"
            asset.review_status = "pending_review"
            asset.prompt_used = personalized_text or expanded
            asset.generation_time_sec = gen_res.generation_time_sec
            asset.cost_estimate = gen_res.cost_estimate_usd
            db.commit()
            db.refresh(asset)
            return asset
        finally:
            db.close()

    @staticmethod
    def get_or_generate_full_storybook_pages(
        job_id: str,
        target_lang: str = "english"
    ) -> List[Dict[str, Any]]:
        with _get_job_lock(job_id):
            return JobRunner._locked_get_or_generate_full_storybook_pages(job_id, target_lang=target_lang)

    @staticmethod
    def _locked_get_or_generate_full_storybook_pages(
        job_id: str,
        target_lang: str = "english"
    ) -> List[Dict[str, Any]]:
        """
        Retrieves or dynamically completes ALL pages of the storybook for full print production:
        - Resolves all pages in sequence from the uploaded PDF.
        - Preserves existing preview plates that were already personalized.
        - Dynamically generates face-fused character artwork for all remaining personalizable pages.
        - Guarantees 100% completion: does NOT fall back to original target images on personalizable pages.
        - Translates narrative text if target_lang is not English.
        - Pre-composes the complete full-print PDF so customer download is instantaneous.
        - Returns complete pages_data array for all pages (e.g. 1 to 26).
        """
        import gc
        import time
        from app.services.ai.cartoon_fusion import cartoon_fusion_engine
        from app.services.ai.consistency_engine import CharacterConsistencyEngine
        from app.services.pdf_composer import PDFComposerService

        db: Session = SessionLocal()
        try:
            job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
            if not job:
                raise ValueError(f"Personalization job {job_id} not found")

            story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
            if not story:
                raise ValueError(f"Story template not found for job {job_id}")

            story_slug = story.slug or "unicorn-story"
            story_title = story.title or "Personalized Story"

            story_pages = db.query(StoryPage).filter(StoryPage.story_id == story.id).order_by(StoryPage.page_index).all()
            if not story_pages:
                raise ValueError("No story pages configured for this story template")

            # 1. Load existing valid face-swapped assets from database and MinIO
            existing_assets = {}
            for a in db.query(GeneratedAsset).filter(GeneratedAsset.job_id == job.id, GeneratedAsset.generation_status == "completed").all():
                m_lower = (a.model or "").lower()
                p_lower = (a.provider or "").lower()
                is_ai = ("inswapper" in m_lower) or ("insightface" in p_lower) or ("original-plate-preserved" in m_lower) or ("preserved base artwork" in p_lower)
                if is_ai and a.storage_path:
                    cat, fn = storage._parse_category_and_filename(a.storage_path)
                    exists = False
                    if cat and fn and storage.file_exists(cat, fn):
                        exists = True
                    else:
                        res_p = storage.resolve_path(a.storage_path)
                        if res_p and os.path.exists(res_p):
                            exists = True
                    if exists:
                        existing_assets[a.page_number] = a

            # 2. Normalize child reference photo directly from MinIO
            norm_ref = None
            if job.photo_path:
                try:
                    norm_ref = CharacterConsistencyEngine.normalize_child_reference(job.photo_path)
                except Exception as norm_err:
                    logger.error(f"Failed to normalize child photo {job.photo_path}: {norm_err}")
                    raise RuntimeError(f"Customer reference photo could not be loaded: {norm_err}")

            pages_data = []
            newly_rendered = 0
            for page in story_pages:
                page_num = page.page_number
                page_type = page.page_type or ("cover" if page_num == 1 else "story")

                raw_text = page.story_text or page.extracted_text or f"Scene for page {page_num}."
                personalized_text = raw_text
                for tag in ["[Name]", "{name}", "[child_name]", "{child_name}"]:
                    personalized_text = personalized_text.replace(tag, job.child_name)

                if target_lang.lower() not in ["english", "en"]:
                    from app.services.translation_service import translation_service
                    personalized_text = translation_service.translate_text(personalized_text, target_lang, child_name=job.child_name)

                is_page_personalizable = bool(page.personalization_required and page.face_outline_points not in ["[]", "none", "false"])
                img_path = None

                if page_num in existing_assets and is_page_personalizable:
                    # Use existing validated high-quality swap
                    img_path = existing_assets[page_num].storage_path
                elif is_page_personalizable:
                    # Dynamically generate personalized face swap with retry mechanism
                    if not norm_ref:
                        raise RuntimeError(f"Customer reference photo is required to personalize page {page_num}.")

                    page_img = None
                    if page.original_image_path:
                        cat, fn = storage._parse_category_and_filename(page.original_image_path)
                        if cat and fn and storage.file_exists(cat, fn):
                            page_img = storage.resolve_path(page.original_image_path)
                    if not page_img or not os.path.exists(page_img):
                        cand = settings.SOURCE_PAGES_DIR / story_slug / f"page_{page_num:02d}.png"
                        if cand.exists():
                            page_img = str(cand)
                        else:
                            page_img = storage.resolve_path(f"source_pages/{story_slug}/page_{page_num:02d}.png")

                    max_retries = 3
                    gen_res = None
                    last_err = None
                    for attempt in range(max_retries):
                        try:
                            gen_res = cartoon_fusion_engine.fuse_page(
                                page_number=page_num,
                                child_reference_path=norm_ref,
                                story_slug=story_slug,
                                page_image_path=page_img,
                                face_outline_points=page.face_outline_points,
                                prefer_local=False,
                                job_id=str(job.id)
                            )
                            if gen_res and "poisson" in gen_res.model.lower():
                                raise RuntimeError(f"Poisson fallback is forbidden for personalizable page {page_num}.")
                            if gen_res and gen_res.image_bytes:
                                break
                        except Exception as fuse_err:
                            last_err = fuse_err
                            logger.warning(f"Face fusion attempt {attempt+1}/{max_retries} failed on page {page_num}: {fuse_err}")
                            time.sleep(1.0)

                    if not gen_res or not gen_res.image_bytes:
                        logger.error(f"Personalized face-swapping failed for page {page_num} after {max_retries} attempts: {last_err}")
                        job.status = "failed"
                        job.error_details = f"Page {page_num} generation failed: {last_err}"
                        db.commit()
                        raise RuntimeError(f"Personalized face-swapping failed for page {page_num}: {last_err}")

                    asset_filename = f"job_{job.id}_p{page_num:02d}_{int(time.time())}.{gen_res.format}"
                    asset_path = storage.save_bytes(
                        data=gen_res.image_bytes,
                        category="generated_assets",
                        custom_name=f"{job.id}/{asset_filename}"
                    )

                    asset = GeneratedAsset(
                        job_id=job.id,
                        story_page_id=page.id,
                        page_number=page_num,
                        storage_path=asset_path,
                        provider=gen_res.provider,
                        model=gen_res.model,
                        prompt_used=personalized_text,
                        generation_status="completed",
                        review_status="approved",
                        cost_estimate=gen_res.cost_estimate_usd,
                        generation_time_sec=gen_res.generation_time_sec
                    )
                    db.add(asset)
                    existing_assets[page_num] = asset
                    img_path = asset_path

                    # Update live job progress in database
                    job.completed_pages = len(existing_assets)
                    job.total_pages = len(story_pages)
                    pct = int((len(existing_assets) / len(story_pages)) * 100)
                    job.status = f"Rendering {pct}%"
                    job.current_stage = f"Rendering HD page {page_num} of {len(story_pages)}..."
                    db.commit()

                    newly_rendered += 1
                    del gen_res
                    gc.collect()
                else:
                    # Non-personalizable decorative / title page
                    cand = settings.SOURCE_PAGES_DIR / story_slug / f"page_{page_num:02d}.png"
                    img_path = (str(cand) if cand.exists() else None) or (storage.resolve_path(page.original_image_path) if page.original_image_path else None) or page.original_image_path

                pages_data.append({
                    "page_number": page_num,
                    "page_type": page_type,
                    "image_path": img_path,
                    "story_text": personalized_text
                })

            expected_page_count = story.page_count or len(story_pages)
            if len(pages_data) != expected_page_count:
                raise RuntimeError(
                    f"Page count mismatch: expected {expected_page_count} pages but generated {len(pages_data)}"
                )

            job.status = "compiling_pdf"
            job.current_stage = f"Compiling {expected_page_count}-page archival 300 DPI PDF..."
            db.commit()

            # Pre-compose the final print PDF in background so customer download is instantaneous
            print_filename = f"final_book_{job.id}_{target_lang}_8x8_rgb.pdf"
            cat, fn = storage._parse_category_and_filename(f"final_books/{print_filename}")
            already_composed = bool(cat and fn and storage.file_exists(cat, fn) and newly_rendered == 0)
            if not already_composed:
                storage_key, validation = PDFComposerService.compose_storybook_pdf(
                    pages_data=pages_data,
                    output_filename=print_filename,
                    book_type="final",
                    child_name=job.child_name or "Little Explorer",
                    story_title=story_title,
                    page_size="8x8",
                    color_mode="rgb"
                )
                if not validation.get("validation_passed", False) or validation.get("page_count", 0) != expected_page_count:
                    raise RuntimeError(f"PDF validation failed: {validation}")

                import json
                existing_book = db.query(Book).filter(Book.job_id == job.id, Book.book_type == "final").first()
                if existing_book:
                    existing_book.pdf_storage_path = storage_key
                    existing_book.page_count = expected_page_count
                    existing_book.validation_status = "valid"
                    existing_book.validation_details = json.dumps(validation)
                else:
                    new_book = Book(
                        job_id=job.id,
                        book_type="final",
                        pdf_storage_path=storage_key,
                        page_count=expected_page_count,
                        validation_status="valid",
                        validation_details=json.dumps(validation)
                    )
                    db.add(new_book)
                logger.info(f"Pre-composed full print PDF successfully for job {job.id}: {print_filename}")
            else:
                logger.info(f"Existing pre-composed PDF is already up to date for job {job.id}: {print_filename}")

            job.total_pages = expected_page_count
            job.completed_pages = expected_page_count
            job.status = "completed"
            job.current_stage = f"Complete {expected_page_count}-page PDF ready for download"
            db.commit()

            return pages_data
        finally:
            db.close()


job_runner = JobRunner()
