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

            # Prepare clean child reference (removes forehead bindis/blemishes so they don't warp onto eyebrows)
            norm_ref = cartoon_fusion_engine.prepare_clean_child_reference(job.photo_path)

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
                    if not page.personalization_required:
                        # Page is scenery / animal / dinosaur scene without character face - preserve authentic artwork
                        page_img = page.original_image_path or f"source_pages/{story_slug}/page_{page.page_number:02d}.png"
                        resolved_path = storage.resolve_path(page_img) if not os.path.exists(page_img) else page_img
                        img_bytes = b""
                        if os.path.exists(resolved_path):
                            with open(resolved_path, "rb") as f:
                                img_bytes = f.read()
                        gen_res = GenerationResult(
                            image_bytes=img_bytes,
                            format="png",
                            provider="Original Storybook Illustration",
                            model="authentic-scene",
                            prompt=f"Preserved {story_title} Page {page.page_number} scenery",
                            generation_time_sec=0.01,
                            cost_estimate_usd=0.00
                        )
                    elif settings.ACTIVE_IMAGE_PROVIDER == "huggingface" and settings.HF_TOKEN:
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
                            face_outline_points=page.face_outline_points
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
                        provider=(gen_res.provider or "huggingface")[:250],
                        model=(gen_res.model or "default")[:250],
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
                    db.rollback()
                    try:
                        job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
                        if job:
                            job.failed_pages += 1
                            job.error_details = str(e)[:500]
                            db.commit()
                    except Exception:
                        db.rollback()

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
            db.rollback()
            try:
                job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
                if job:
                    job.status = "failed"
                    job.error_details = str(ex)[:500]
                    db.commit()
            except Exception:
                db.rollback()
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
                gen_res = cartoon_fusion_engine.fuse_page(
                    page_number=page.page_number,
                    child_reference_path=job.photo_path,
                    story_slug=story_slug,
                    page_image_path=page_img,
                    face_outline_points=page.face_outline_points
                )

            asset_filename = f"job_{job.id}_p{page.page_number:02d}_v{asset.asset_version + 1}_{int(time.time())}.{gen_res.format}"
            new_path = storage.save_bytes(
                data=gen_res.image_bytes,
                category="generated_assets",
                custom_name=f"{job.id}/{asset_filename}"
            )

            asset.storage_path = new_path
            asset.asset_version += 1
            asset.provider = (gen_res.provider or "huggingface")[:250]
            asset.model = (gen_res.model or "default")[:250]
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
        """
        Retrieves or dynamically completes ALL pages of the storybook for full print production:
        - Resolves all pages in sequence from the uploaded PDF.
        - Preserves existing preview plates that were already personalized.
        - Dynamically generates face-fused character artwork for all remaining personalizable pages.
        - Translates narrative text if target_lang is not English.
        - Returns complete pages_data array for all pages (e.g. 1 to 26).
        """
        db: Session = SessionLocal()
        try:
            job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
            if not job:
                raise ValueError("Personalization job not found")

            story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
            if not story:
                raise ValueError("Story template not found")

            story_slug = story.slug or "unicorn-story"
            story_title = story.title or "Personalized Story"

            story_pages = db.query(StoryPage).filter(StoryPage.story_id == story.id).order_by(StoryPage.page_index).all()
            if not story_pages:
                raise ValueError("No story pages configured for this story template")

            existing_assets = {
                a.page_number: a
                for a in db.query(GeneratedAsset).filter(GeneratedAsset.job_id == job.id).all()
                if a.storage_path and os.path.exists(a.storage_path)
            }

            norm_ref = job.photo_path if job.photo_path else None

            pages_data = []
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

                img_path = None
                if page_num in existing_assets:
                    img_path = existing_assets[page_num].storage_path
                elif page.personalization_required and norm_ref:
                    page_img = page.original_image_path
                    if not page_img or not os.path.exists(page_img):
                        cand = settings.SOURCE_PAGES_DIR / story_slug / f"page_{page_num:02d}.png"
                        if cand.exists():
                            page_img = str(cand)

                    try:
                        gen_res = cartoon_fusion_engine.fuse_page(
                            page_number=page_num,
                            child_reference_path=norm_ref,
                            story_slug=story_slug,
                            page_image_path=page_img,
                            face_outline_points=page.face_outline_points,
                            prefer_local=False
                        )
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
                            provider=(gen_res.provider or "huggingface")[:250],
                            model=(gen_res.model or "default")[:250],
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
                        job.status = f"Rendering · {pct}%"
                        job.current_stage = f"Rendering HD page {page_num} of {len(story_pages)}..."
                        db.commit()
                    except Exception as fuse_err:
                        db.rollback()
                        print(f"Notice: Face fusion fallback on full render page {page_num}: {fuse_err}")
                        img_path = page.original_image_path or str(settings.SOURCE_PAGES_DIR / story_slug / f"page_{page_num:02d}.png")
                else:
                    img_path = page.original_image_path
                    if not img_path or not os.path.exists(img_path):
                        cand = settings.SOURCE_PAGES_DIR / story_slug / f"page_{page_num:02d}.png"
                        if cand.exists():
                            img_path = str(cand)

                pages_data.append({
                    "page_number": page_num,
                    "page_type": page_type,
                    "image_path": img_path,
                    "story_text": personalized_text
                })

            job.total_pages = len(pages_data)
            job.completed_pages = len(pages_data)
            job.status = "completed"
            job.current_stage = "All HD pages generated successfully"
            db.commit()

            return pages_data
        finally:
            db.close()

job_runner = JobRunner()

