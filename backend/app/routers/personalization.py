import os
import datetime
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PersonalizationJob, StoryTemplate, GeneratedAsset, ChildProfile, Book, StoryPage
from app.schemas import PersonalizationOut, GeneratedAssetOut
from app.services.storage import storage
from app.services.job_runner import job_runner

router = APIRouter(prefix="/personalization", tags=["Personalization"])

def enrich_job_urls(job: PersonalizationJob) -> dict:
    created_fmt = job.created_at.strftime("%b %d, %I:%M %p") if job.created_at else "Recently"
    story_obj = getattr(job, "story", None)
    story_title = story_obj.title if story_obj else "Personalized Story"
    story_slug = story_obj.slug if story_obj else ""
    free_pages = f"{job.completed_pages or 0} free"

    status_display = job.status
    if job.status in ["generating", "queued", "analyzing", "in_progress", "processing"]:
        pct = int(((job.completed_pages or 0) / (job.total_pages or 1)) * 100) if job.total_pages else 0
        status_display = f"Rendering · {pct}%" if pct > 0 else "Rendering"
    elif job.status == "completed":
        status_display = "Completed"

    data = {
        "id": job.id,
        "user_id": job.user_id,
        "story_id": job.story_id,
        "story_title": story_title,
        "story_slug": story_slug,
        "child_name": job.child_name,
        "photo_path": job.photo_path,
        "photo_url": storage.get_public_url(job.photo_path),
        "status": status_display,
        "current_stage": job.current_stage,
        "total_pages": job.total_pages,
        "completed_pages": job.completed_pages,
        "failed_pages": job.failed_pages,
        "retry_count": job.retry_count,
        "error_details": job.error_details,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "pages_label": free_pages,
        "is_purchased": bool(getattr(job, "books", None) or getattr(job, "user_id", None) == "purchased"),
        "created_formatted": created_fmt,
        "pdf_download_url": f"/api/v1/personalization/{job.id}/pdf",
        "assets": []
    }
    for asset in sorted(job.assets, key=lambda a: a.page_number):
        story_page = asset.story_page
        story_text = ""
        if story_page:
            raw = story_page.story_text or story_page.extracted_text or ""
            story_text = raw
            for tag in ["[Name]", "{name}", "[child_name]", "{child_name}"]:
                story_text = story_text.replace(tag, job.child_name)

        data["assets"].append({
            "id": asset.id,
            "job_id": asset.job_id,
            "story_page_id": asset.story_page_id,
            "page_number": asset.page_number,
            "asset_version": asset.asset_version,
            "storage_path": asset.storage_path,
            "image_url": storage.get_public_url(asset.storage_path),
            "provider": asset.provider,
            "model": asset.model,
            "prompt_used": asset.prompt_used,
            "story_text": story_text or asset.prompt_used,
            "generation_status": asset.generation_status,
            "review_status": asset.review_status,
            "cost_estimate": asset.cost_estimate,
            "generation_time_sec": asset.generation_time_sec,
            "error_message": asset.error_message,
            "created_at": asset.created_at
        })
    return data

@router.post("", response_model=PersonalizationOut)
async def create_personalization(
    background_tasks: BackgroundTasks,
    story_id: str = Form(...),
    child_name: str = Form(...),
    guardian_consent: bool = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not guardian_consent:
        raise HTTPException(
            status_code=400,
            detail="Parent or legal guardian consent is required before processing a child's photograph."
        )

    if not child_name.strip():
        raise HTTPException(status_code=400, detail="Child's name cannot be empty.")

    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Selected story not found.")

    # Save photo securely
    saved_photo_path = await storage.save_upload_file(photo, category="child_photos")

    # Create child profile
    profile = ChildProfile(
        child_display_name=child_name.strip(),
        photo_storage_path=saved_photo_path,
        consent_status=True,
        consent_timestamp=datetime.datetime.utcnow(),
        retention_status="active"
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Create job
    job = PersonalizationJob(
        story_id=story.id,
        child_profile_id=profile.id,
        child_name=child_name.strip(),
        photo_path=saved_photo_path,
        status="queued",
        current_stage="Job queued for processing",
        total_pages=5
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Launch background job asynchronously
    background_tasks.add_task(job_runner.process_preview_job, job.id)

    return enrich_job_urls(job)

@router.get("/{job_id}", response_model=PersonalizationOut)
def get_personalization_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Personalization job not found.")
    return enrich_job_urls(job)

@router.post("/assets/{asset_id}/retry", response_model=GeneratedAssetOut)
async def retry_single_page(asset_id: str, db: Session = Depends(get_db)):
    asset = await job_runner.regenerate_single_page(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found or failed to regenerate.")
    
    asset_dict = {
        "id": asset.id,
        "job_id": asset.job_id,
        "story_page_id": asset.story_page_id,
        "page_number": asset.page_number,
        "asset_version": asset.asset_version,
        "storage_path": asset.storage_path,
        "image_url": storage.get_public_url(asset.storage_path),
        "provider": asset.provider,
        "model": asset.model,
        "prompt_used": asset.prompt_used,
        "story_text": asset.story_page.story_text if asset.story_page else asset.prompt_used,
        "generation_status": asset.generation_status,
        "review_status": asset.review_status,
        "cost_estimate": asset.cost_estimate,
        "generation_time_sec": asset.generation_time_sec,
        "error_message": asset.error_message,
        "created_at": asset.created_at
    }
    return asset_dict

@router.get("/{job_id}/pdf")
def download_preview_pdf(job_id: str, db: Session = Depends(get_db)):
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    child_name = job.child_name or "Little Explorer"
    story_title = job.story.title if job.story else "Personalized Story"

    # 1. First priority: Return pre-composed preview PDF if it exists on disk
    preview_book = db.query(Book).filter(Book.job_id == job.id, Book.book_type == "preview").order_by(Book.created_at.desc()).first()
    if preview_book and preview_book.pdf_storage_path and os.path.exists(preview_book.pdf_storage_path):
        with open(preview_book.pdf_storage_path, "rb") as f:
            pdf_bytes = f.read()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{child_name}_{story_title}_preview.pdf"'
            }
        )

    # 2. Check if generated assets exist and compose via PDFComposerService
    from app.services.pdf_composer import PDFComposerService
    assets = db.query(GeneratedAsset).filter(GeneratedAsset.job_id == job.id).order_by(GeneratedAsset.page_number).all()
    pages_data = []
    for a in assets:
        if a.storage_path and os.path.exists(a.storage_path):
            story_page = db.query(StoryPage).filter(StoryPage.id == a.story_page_id).first() if a.story_page_id else None
            text = story_page.story_text if story_page else f"Scene for {child_name}."
            text = text.replace("{child_name}", child_name).replace("{name}", child_name)
            pages_data.append({
                "page_number": a.page_number,
                "page_type": story_page.page_type if story_page else ("cover" if a.page_number == 1 else "story"),
                "image_path": a.storage_path,
                "story_text": text
            })

    if pages_data:
        preview_filename = f"preview_{job.id}.pdf"
        pdf_path, _ = PDFComposerService.compose_storybook_pdf(
            pages_data=pages_data,
            output_filename=preview_filename,
            book_type="preview",
            child_name=child_name,
            story_title=story_title
        )
        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'inline; filename="{child_name}_{story_title}_preview.pdf"'
                }
            )

    # 3. Fallback: If story template has original page images, compose with them
    if job.story and job.story.pages:
        for p in sorted(job.story.pages, key=lambda p: p.page_number)[:5]:
            img_p = p.original_image_path
            if img_p and os.path.exists(img_p):
                text = (p.story_text or "").replace("{child_name}", child_name).replace("{name}", child_name)
                pages_data.append({
                    "page_number": p.page_number,
                    "page_type": p.page_type,
                    "image_path": img_p,
                    "story_text": text
                })
        if pages_data:
            preview_filename = f"preview_{job.id}.pdf"
            pdf_path, _ = PDFComposerService.compose_storybook_pdf(
                pages_data=pages_data,
                output_filename=preview_filename,
                book_type="preview",
                child_name=child_name,
                story_title=story_title
            )
            if os.path.exists(pdf_path):
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()
                return Response(
                    content=pdf_bytes,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f'inline; filename="{child_name}_{story_title}_preview.pdf"'
                    }
                )

    # 4. PyMuPDF fallback: insert actual cover/photo, never placeholder text
    import pymupdf as fitz
    doc = fitz.open()

    p1 = doc.new_page(width=595, height=595)
    p1.draw_rect(fitz.Rect(0, 0, 595, 595), color=None, fill=(0.97, 0.95, 1.0))
    p1.insert_text((60, 90), "KUTTY STORY STUDIO", fontsize=14, color=(0.54, 0.24, 1.0))
    p1.insert_text((60, 140), f"{child_name} &", fontsize=30, color=(0.1, 0.1, 0.1))
    p1.insert_text((60, 180), story_title, fontsize=26, color=(0.54, 0.24, 1.0))
    p1.insert_text((60, 215), "Personalized Preview Edition", fontsize=12, color=(0.4, 0.4, 0.4))

    cover_img = job.photo_path if (job.photo_path and os.path.exists(job.photo_path)) else None
    if cover_img:
        try:
            p1.insert_image(fitz.Rect(60, 240, 535, 510), filename=cover_img, keep_proportion=True)
        except Exception:
            pass

    p1.insert_text((60, 550), "Kutty Story Free Preview • www.kuttystory.co.in", fontsize=10, color=(0.6, 0.6, 0.6))

    pdf_bytes = doc.tobytes()
    doc.close()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{child_name}_{story_title}_preview.pdf"'
        }
    )

@router.post("/test-render", response_model=PersonalizationOut)
async def test_render_book(
    story_id: str = Form(...),
    child_name: str = Form("Aarav"),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    import datetime
    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    photo_path = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
    if photo and photo.filename:
        photo_path = await storage.save_upload_file(photo, category="child_photos")

    job = PersonalizationJob(
        id=str(uuid.uuid4()),
        story_id=story.id,
        child_name=child_name.strip(),
        photo_path=photo_path,
        status="completed",
        current_stage="Free preview plates generated",
        total_pages=4,
        completed_pages=4,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(job)
    db.flush()

    for p in range(1, 5):
        asset = GeneratedAsset(
            id=str(uuid.uuid4()),
            job_id=job.id,
            story_page_id=story.pages[p-1].id if (story.pages and len(story.pages) >= p) else str(uuid.uuid4()),
            page_number=p,
            storage_path=story.cover_image_path or photo_path,
            provider="fal_ai",
            model="flux-pulid",
            prompt_used=f"{child_name} in {story.title}",
            generation_status="completed",
            review_status="approved",
            cost_estimate=0.04
        )
        db.add(asset)

    db.commit()
    db.refresh(job)
    return enrich_job_urls(job)
