import asyncio
import os
import time
from typing import List, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.models import PersonalizationJob, StoryPage, GeneratedAsset, Book
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

            job.status = "analyzing"
            job.current_stage = "Analyzing story scenes & preparing character reference"
            db.commit()

            # Normalize child reference photo
            norm_ref = CharacterConsistencyEngine.normalize_child_reference(job.photo_path)

            # Get story pages
            story_pages = db.query(StoryPage).filter(StoryPage.story_id == job.story_id).order_by(StoryPage.page_index).all()
            
            # Choose pages to personalize for preview
            preview_limit = min(settings.PREVIEW_PAGE_LIMIT, len(story_pages))
            # Pick representative beats with prominent character presence: 1 (cover), 3 (garden walk), 7 (unicorn portrait), 10 (meadow run), 13 (bird rescue)
            preview_page_indices = [0, 2, 6, 9, 12] if len(story_pages) >= 13 else list(range(preview_limit))
            target_pages = [story_pages[i] for i in preview_page_indices if i < len(story_pages)]

            job.total_pages = len(target_pages)
            job.status = "generating"
            job.current_stage = f"Generating personalized illustrations (0/{len(target_pages)})"
            db.commit()

            generated_pages_data = []

            for idx, page in enumerate(target_pages):
                job.current_stage = f"Fusing cartoon character for Page {page.page_number} ({idx+1}/{len(target_pages)})"
                db.commit()

                prompt = page.prompt_template or f"Children's book illustration for page {page.page_number}"
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
                        gen_res = cartoon_fusion_engine.fuse_page(
                            page_number=page.page_number,
                            child_reference_path=norm_ref,
                            story_slug="unicorn-story"
                        )

                    # Save generated image
                    asset_filename = f"job_{job.id}_p{page.page_number:02d}_{int(time.time())}.{gen_res.format}"
                    asset_dir = settings.GENERATED_ASSETS_DIR / job.id
                    asset_dir.mkdir(parents=True, exist_ok=True)
                    asset_path = str(asset_dir / asset_filename)
                    with open(asset_path, "wb") as f:
                        f.write(gen_res.image_bytes)

                    # Record asset in DB
                    asset = GeneratedAsset(
                        job_id=job.id,
                        story_page_id=page.id,
                        page_number=page.page_number,
                        storage_path=asset_path,
                        provider=gen_res.provider,
                        model=gen_res.model,
                        prompt_used=expanded,
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
                        "story_text": page.story_text
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
                pages_data=generated_pages_data,
                output_filename=preview_filename,
                book_type="preview",
                child_name=job.child_name
            )

            import json
            book = Book(
                job_id=job.id,
                book_type="preview",
                pdf_storage_path=pdf_path,
                page_count=len(generated_pages_data),
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

            prompt = page.prompt_template or f"Illustration for page {page.page_number}"
            expanded = await gemini_provider.expand_prompt(prompt, job.child_name)

            if settings.ACTIVE_IMAGE_PROVIDER == "huggingface" and settings.HF_TOKEN:
                gen_res = await diffusers_provider.generate_illustration(
                    prompt=expanded,
                    reference_image_path=job.photo_path,
                    width=1024,
                    height=1024
                )
            else:
                gen_res = cartoon_fusion_engine.fuse_page(
                    page_number=page.page_number,
                    child_reference_path=job.photo_path,
                    story_slug="unicorn-story"
                )

            asset_filename = f"job_{job.id}_p{page.page_number:02d}_v{asset.asset_version + 1}_{int(time.time())}.{gen_res.format}"
            asset_dir = settings.GENERATED_ASSETS_DIR / job.id
            asset_dir.mkdir(parents=True, exist_ok=True)
            new_path = str(asset_dir / asset_filename)
            with open(new_path, "wb") as f:
                f.write(gen_res.image_bytes)

            asset.storage_path = new_path
            asset.asset_version += 1
            asset.generation_status = "completed"
            asset.review_status = "pending_review"
            asset.generation_time_sec = gen_res.generation_time_sec
            asset.cost_estimate = gen_res.cost_estimate_usd
            db.commit()
            db.refresh(asset)
            return asset
        finally:
            db.close()

job_runner = JobRunner()
