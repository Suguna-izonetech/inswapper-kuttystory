import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import StoryTemplate, StoryPage, PersonalizationJob, GeneratedAsset, Book, AISettings
from app.schemas import StoryTemplateOut, StoryPageOut, StoryTemplateUpdate, StoryPageUpdate, AssetReviewUpdate, PersonalizationOut
from app.services.storage import storage
from app.services.pdf_importer import PDFImporterService
from app.routers.stories import enrich_story_urls
from app.routers.personalization import enrich_job_urls

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_stories = db.query(StoryTemplate).count()
    published_stories = db.query(StoryTemplate).filter(StoryTemplate.status == "published").count()
    draft_stories = db.query(StoryTemplate).filter(StoryTemplate.status == "draft").count()
    
    total_jobs = db.query(PersonalizationJob).count()
    generating_jobs = db.query(PersonalizationJob).filter(PersonalizationJob.status.in_(["analyzing", "generating", "assembling_preview"])).count()
    completed_jobs = db.query(PersonalizationJob).filter(PersonalizationJob.status == "completed").count()
    failed_jobs = db.query(PersonalizationJob).filter(PersonalizationJob.status == "failed").count()
    total_books = db.query(Book).count()

    return {
        "total_stories": total_stories,
        "published_stories": published_stories,
        "draft_stories": draft_stories,
        "total_jobs": total_jobs,
        "generating_jobs": generating_jobs,
        "completed_jobs": completed_jobs,
        "failed_jobs": failed_jobs,
        "total_books": total_books
    }

@router.get("/stories", response_model=List[StoryTemplateOut])
def get_all_stories(db: Session = Depends(get_db)):
    stories = db.query(StoryTemplate).all()
    return [enrich_story_urls(s) for s in stories]

@router.post("/stories/import-pdf", response_model=StoryTemplateOut)
async def import_pdf_story(
    title: str = Form(...),
    slug: str = Form(...),
    description: str = Form(...),
    category: str = Form("Fairytale & Adventure"),
    age_range: str = Form("3-8 years"),
    pdf: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    saved_pdf_path = await storage.save_upload_file(pdf, category="original_pdfs", allowed_extensions=(".pdf",))
    story = PDFImporterService.import_story_from_pdf(
        pdf_path=saved_pdf_path,
        db=db,
        title=title,
        slug=slug,
        description=description,
        category=category,
        age_range=age_range,
        force_reimport=True
    )
    return enrich_story_urls(story)

@router.put("/stories/{story_id}", response_model=StoryTemplateOut)
def update_story(story_id: str, payload: StoryTemplateUpdate, db: Session = Depends(get_db)):
    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(story, k, v)

    db.commit()
    db.refresh(story)
    return enrich_story_urls(story)

@router.put("/pages/{page_id}", response_model=StoryPageOut)
def update_story_page(page_id: str, payload: StoryPageUpdate, db: Session = Depends(get_db)):
    page = db.query(StoryPage).filter(StoryPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Story page not found")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(page, k, v)

    db.commit()
    db.refresh(page)
    return {
        "id": page.id,
        "story_id": page.story_id,
        "page_index": page.page_index,
        "page_number": page.page_number,
        "page_type": page.page_type,
        "story_text": page.story_text,
        "extracted_text": page.extracted_text,
        "scene_description": page.scene_description,
        "character_guidance": page.character_guidance,
        "prompt_template": page.prompt_template,
        "personalization_required": page.personalization_required,
        "allow_illustration_generation": page.allow_illustration_generation,
        "original_image_path": page.original_image_path,
        "original_image_url": storage.get_public_url(page.original_image_path)
    }

@router.post("/assets/{asset_id}/review")
def review_asset(asset_id: str, payload: AssetReviewUpdate, db: Session = Depends(get_db)):
    asset = db.query(GeneratedAsset).filter(GeneratedAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset.review_status = payload.review_status
    db.commit()
    db.refresh(asset)
    return {"status": "success", "asset_id": asset.id, "review_status": asset.review_status}

@router.get("/jobs", response_model=List[PersonalizationOut])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(PersonalizationJob).order_by(PersonalizationJob.created_at.desc()).all()
    return [enrich_job_urls(j) for j in jobs]
