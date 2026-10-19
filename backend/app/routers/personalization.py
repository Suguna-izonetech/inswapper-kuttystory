import os
import datetime
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Response, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PersonalizationJob, StoryTemplate, GeneratedAsset, ChildProfile, Book, StoryPage
from app.schemas import PersonalizationOut, GeneratedAssetOut
from app.services.storage import storage
from app.services.job_runner import job_runner
from app.services.ai.photo_validator import validate_child_photo_ai

router = APIRouter(prefix="/personalization", tags=["Personalization"])

@router.post("/validate-photo")
async def validate_photo_endpoint(
    photo: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None)
):
    """
    AI-powered Deep Learning face validator (YuNet) checking:
    1. Front-facing angle (nose between eyes, yaw symmetry, interocular distance)
    2. Uncovered face & mouth (hand/finger coverage, mouth landmark presence, lip contrast)
    3. Sunglasses & distance framing
    """
    try:
        upload = photo or file
        if not upload:
            raise HTTPException(status_code=400, detail="Photo file is required.")
        content = await upload.read()
        return validate_child_photo_ai(content)
    except Exception as e:
        return {
            "is_valid": False,
            "score": 40,
            "error": str(e),
            "summary": "Photo validation check encountered an error."
        }

def enrich_job_urls(job: PersonalizationJob) -> dict:
    created_fmt = job.created_at.strftime("%b %d, %I:%M %p") if job.created_at else "Recently"
    story_obj = getattr(job, "story", None)
    if not story_obj and getattr(job, "story_id", None):
        from app.database import SessionLocal
        with SessionLocal() as sdb:
            story_obj = sdb.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()

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
        "print_pdf_url": f"/api/v1/personalization/{job.id}/print-pdf?size=8x8&color=cmyk",
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

@router.get("/languages")
def get_supported_languages():
    from app.services.translation_service import translation_service
    return {
        "default": "english",
        "languages": translation_service.get_supported_languages()
    }

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

@router.post("/{job_id}/translate")
def translate_job_narrative(
    job_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    from app.services.translation_service import translation_service
    target_language = payload.get("target_language", "english")
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    translations = translation_service.translate_job_assets(job_id=job.id, target_lang=target_language, db=db)
    return {
        "job_id": job.id,
        "target_language": target_language,
        "translations": translations
    }

@router.post("/{job_id}/generate-full")
def trigger_full_generation(
    job_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Asynchronously trigger full-book HD AI generation in the background.
    Allows Admin to monitor live progress per page in the dashboard.
    """
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = "Rendering · 0%"
    job.current_stage = "Queued full-book HD AI rendering..."
    db.commit()

    from app.services.job_runner import job_runner

    def _worker(jid: str):
        job_runner.get_or_generate_full_storybook_pages(jid)

    background_tasks.add_task(_worker, job.id)
    return {
        "status": "queued",
        "job_id": job.id,
        "message": "Full-book HD AI generation started in background."
    }

@router.get("/{job_id}/print-pdf")
def download_full_print_pdf(
    job_id: str,
    lang: str = Query("english"),
    size: str = Query("8x8"),
    color: str = Query("cmyk"),
    db: Session = Depends(get_db)
):
    """
    Generate and download the complete, print-ready CMYK PDF containing ALL pages of the actual uploaded storybook.
    Formatted to 8x8 inches (203.2 x 203.2 mm) in DeviceCMYK color space without preview watermarks.
    """
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
    child_name = job.child_name or "Little Explorer"
    story_title = story.title if story else "Personalized Story"

    from app.services.pdf_composer import PDFComposerService
    from app.services.job_runner import job_runner

    # Retrieve or dynamically complete ALL pages of the uploaded storybook
    all_pages_data = job_runner.get_or_generate_full_storybook_pages(job.id, target_lang=lang)

    print_filename = f"print_{job.id}_{lang}_{size}_{color}.pdf"
    pdf_path, validation = PDFComposerService.compose_storybook_pdf(
        pages_data=all_pages_data,
        output_filename=print_filename,
        book_type="final",
        child_name=child_name,
        story_title=story_title,
        page_size=size,
        color_mode=color
    )

    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        safe_child = child_name.replace(" ", "_")
        safe_title = story_title.replace(" ", "_")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{safe_child}_{safe_title}_Full_{size}_{color.upper()}_Print.pdf"'
            }
        )
    raise HTTPException(status_code=500, detail="Failed to compose print PDF.")

@router.get("/{job_id}/pdf")
def download_preview_pdf(
    job_id: str,
    lang: str = Query("english"),
    mode: str = Query("preview"),
    size: str = Query("8x8"),
    color: str = Query("cmyk"),
    db: Session = Depends(get_db)
):
    # If mode is full/print/admin, generate the full 8x8 CMYK PDF with all pages!
    if mode.lower() in ["full", "print", "admin"]:
        return download_full_print_pdf(job_id=job_id, lang=lang, size=size, color=color, db=db)

    from app.services.translation_service import translation_service
    job = db.query(PersonalizationJob).filter(PersonalizationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    story = job.story or db.query(StoryTemplate).filter(StoryTemplate.id == job.story_id).first()
    child_name = job.child_name or "Little Explorer"
    story_title = story.title if story else "Personalized Story"

    # If english and pre-composed preview PDF exists, return it
    if lang.lower() in ["english", "en"]:
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

    # Check if generated assets exist and compose via PDFComposerService
    from app.services.pdf_composer import PDFComposerService
    assets = db.query(GeneratedAsset).filter(GeneratedAsset.job_id == job.id).order_by(GeneratedAsset.page_number).all()
    pages_data = []
    for a in assets:
        if a.storage_path and os.path.exists(a.storage_path):
            story_page = db.query(StoryPage).filter(StoryPage.id == a.story_page_id).first() if a.story_page_id else None
            text = (story_page.story_text or story_page.extracted_text) if story_page else f"Scene for {child_name}."
            for tag in ["[Name]", "[name]", "{name}", "[child_name]", "{child_name}"]:
                text = text.replace(tag, child_name)
            if lang.lower() not in ["english", "en"]:
                text = translation_service.translate_text(text, lang, child_name=child_name)

            pages_data.append({
                "page_number": a.page_number,
                "page_type": story_page.page_type if story_page else ("cover" if a.page_number == 1 else "story"),
                "image_path": a.storage_path,
                "story_text": text
            })

    if pages_data:
        preview_filename = f"preview_{job.id}_{lang}.pdf"
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
                    "Content-Disposition": f'inline; filename="{child_name}_{story_title}_{lang}_preview.pdf"'
                }
            )

    # Fallback: Compose with story's original page images
    if story and story.pages:
        for p in sorted(story.pages, key=lambda p: p.page_number)[:5]:
            img_p = p.original_image_path
            if img_p and os.path.exists(img_p):
                text = p.story_text or p.extracted_text or ""
                for tag in ["[Name]", "[name]", "{name}", "[child_name]", "{child_name}"]:
                    text = text.replace(tag, child_name)
                if lang.lower() not in ["english", "en"]:
                    text = translation_service.translate_text(text, lang, child_name=child_name)
                pages_data.append({
                    "page_number": p.page_number,
                    "page_type": p.page_type,
                    "image_path": img_p,
                    "story_text": text
                })
        if pages_data:
            preview_filename = f"preview_{job.id}_{lang}.pdf"
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
                        "Content-Disposition": f'inline; filename="{child_name}_{story_title}_{lang}_preview.pdf"'
                    }
                )

    # PyMuPDF fallback
    import pymupdf as fitz
    doc = fitz.open()
    p1 = doc.new_page(width=595, height=595)
    p1.draw_rect(fitz.Rect(0, 0, 595, 595), color=None, fill=(0.97, 0.95, 1.0))
    p1.insert_text((60, 90), "KUTTY STORY STUDIO", fontsize=14, color=(0.54, 0.24, 1.0))
    p1.insert_text((60, 140), f"{child_name} &", fontsize=30, color=(0.1, 0.1, 0.1))
    p1.insert_text((60, 180), story_title, fontsize=26, color=(0.54, 0.24, 1.0))
    p1.insert_text((60, 215), f"Personalized Preview Edition ({lang.title()})", fontsize=12, color=(0.4, 0.4, 0.4))

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
            "Content-Disposition": f'inline; filename="{child_name}_{story_title}_{lang}_preview.pdf"'
        }
    )

@router.post("/test-render", response_model=PersonalizationOut)
async def test_render_book(
    background_tasks: BackgroundTasks,
    story_id: str = Form(...),
    child_name: str = Form("Aarav"),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    sample_child_photo = settings.STORAGE_DIR / "child_photos" / "default_child_sample.jpg"
    if not sample_child_photo.exists():
        # Copy or create sample child photo if needed
        pass

    photo_path = str(sample_child_photo)
    if photo and photo.filename:
        photo_path = await storage.save_upload_file(photo, category="child_photos")

    # Create profile
    profile = ChildProfile(
        child_display_name=child_name.strip(),
        photo_storage_path=photo_path,
        consent_status=True,
        consent_timestamp=datetime.datetime.utcnow(),
        retention_status="active"
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    job = PersonalizationJob(
        id=str(uuid.uuid4()),
        story_id=story.id,
        child_profile_id=profile.id,
        child_name=child_name.strip(),
        photo_path=photo_path,
        status="queued",
        current_stage="Job queued for processing",
        total_pages=min(5, len(story.pages) if story.pages else 5),
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Process preview job dynamically for this exact story
    background_tasks.add_task(job_runner.process_preview_job, job.id)
    return enrich_job_urls(job)
