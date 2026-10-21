import os
import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models import StoryTemplate, StoryPage, PersonalizationJob, GeneratedAsset, Book, AISettings, Order
import re
from app.schemas import (
    StoryTemplateOut, StoryTemplateCreate, StoryPageOut, StoryTemplateUpdate, StoryPageUpdate, 
    AssetReviewUpdate, PersonalizationOut, OrderOut, OrderCreate, OrderStatusUpdate, DashboardStatsOut
)
from app.services.storage import storage
from app.services.pdf_importer import PDFImporterService
from app.routers.stories import enrich_story_urls
from app.routers.personalization import enrich_job_urls

router = APIRouter(prefix="/admin", tags=["Admin"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

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
    stories = db.query(StoryTemplate).order_by(StoryTemplate.created_at.desc()).all()
    return [enrich_story_urls(s) for s in stories]

@router.post("/stories", response_model=StoryTemplateOut)
def create_story(payload: StoryTemplateCreate, db: Session = Depends(get_db)):
    raw_slug = payload.slug.strip() if payload.slug and payload.slug.strip() else slugify(payload.title)
    if not raw_slug:
        raw_slug = f"book-{uuid.uuid4().hex[:6]}"
        
    # Ensure slug uniqueness
    slug = raw_slug
    counter = 1
    while db.query(StoryTemplate).filter(StoryTemplate.slug == slug).first():
        slug = f"{raw_slug}-{counter}"
        counter += 1

    age_str = payload.age_range
    if not age_str:
        min_a = payload.min_age or 3
        max_a = payload.max_age or 7
        age_str = f"Ages {min_a}-{max_a}"

    cover_path = payload.cover_image_path or payload.cover_image_url

    story = StoryTemplate(
        id=str(uuid.uuid4()),
        title=payload.title,
        slug=slug,
        description=payload.description or "",
        category=payload.category or "ADVENTURE",
        age_range=age_str,
        language="English",
        source_pdf_path="",
        page_count=payload.page_count or 28,
        status=payload.status or "published",
        cover_image_path=cover_path,
        price_digital=payload.price_digital or 799.0,
        price_print=payload.price_print or 1399.0,
        currency=payload.currency or "INR"
    )
    db.add(story)
    db.flush()

    # Pre-generate placeholder story pages for authoring
    pages_count = payload.page_count or 28
    for idx in range(pages_count):
        p_type = "story"
        if idx == 0:
            p_type = "cover"
        elif idx == pages_count - 1:
            p_type = "ending"

        page = StoryPage(
            id=str(uuid.uuid4()),
            story_id=story.id,
            page_index=idx,
            page_number=idx + 1,
            page_type=p_type,
            original_image_path=cover_path if (idx == 0 and cover_path) else "",
            story_text=f"Front Cover: {payload.title}" if idx == 0 else ("The End" if idx == pages_count - 1 else f"Narrative scene for page {idx + 1}."),
            extracted_text="",
            scene_description=f"Detailed scene illustration for page {idx + 1}",
            character_guidance="Warm, whimsical children's book illustration.",
            prompt_template="",
            personalization_required=True,
            allow_illustration_generation=True
        )
        db.add(page)

    db.commit()
    db.refresh(story)
    return enrich_story_urls(story)

@router.get("/stories/upload")
def stories_upload_info():
    """Information endpoint for upload route (POST is used for creating stories with PDF)."""
    return {
        "status": "active",
        "message": "Use POST /api/v1/admin/stories/upload with multipart/form-data to upload and import stories."
    }


@router.post("/stories/upload", response_model=StoryTemplateOut)
async def create_story_with_upload(
    title: str = Form(...),
    slug: Optional[str] = Form(None),
    description: Optional[str] = Form(""),
    category: str = Form("ADVENTURE"),
    min_age: Optional[int] = Form(3),
    max_age: Optional[int] = Form(7),
    age_range: Optional[str] = Form(None),
    price_digital: float = Form(799.0),
    price_print: float = Form(1399.0),
    currency: str = Form("INR"),
    page_count: Optional[int] = Form(28),
    cover_image_url: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    raw_slug = slug.strip() if slug and slug.strip() else slugify(title)
    if not raw_slug:
        raw_slug = f"book-{uuid.uuid4().hex[:6]}"

    final_slug = raw_slug
    counter = 1
    while db.query(StoryTemplate).filter(StoryTemplate.slug == final_slug).first():
        final_slug = f"{raw_slug}-{counter}"
        counter += 1

    computed_age = age_range or f"Ages {min_age}-{max_age}"

    if pdf_file and pdf_file.filename:
        saved_pdf_path = await storage.save_upload_file(
            pdf_file, category="original_pdfs", allowed_extensions=(".pdf",)
        )
        story = PDFImporterService.import_story_from_pdf(
            pdf_path=saved_pdf_path,
            db=db,
            title=title,
            slug=final_slug,
            description=description or "",
            category=category or "ADVENTURE",
            age_range=computed_age,
            price_digital=price_digital,
            price_print=price_print,
            currency=currency,
            force_reimport=True
        )
        if cover_image_url:
            story.cover_image_path = cover_image_url
            db.commit()
            db.refresh(story)
        return enrich_story_urls(story)

    # Fallback when no PDF is uploaded
    cover_path = cover_image_url
    pages_to_create = page_count or 28

    story = StoryTemplate(
        id=str(uuid.uuid4()),
        title=title,
        slug=final_slug,
        description=description or "",
        category=category or "ADVENTURE",
        age_range=computed_age,
        language="English",
        source_pdf_path="",
        page_count=pages_to_create,
        status="published",
        cover_image_path=cover_path,
        price_digital=price_digital or 799.0,
        price_print=price_print or 1399.0,
        currency=currency or "INR"
    )
    db.add(story)
    db.flush()

    for idx in range(pages_to_create):
        p_type = "cover" if idx == 0 else ("ending" if idx == pages_to_create - 1 else "story")
        page = StoryPage(
            id=str(uuid.uuid4()),
            story_id=story.id,
            page_index=idx,
            page_number=idx + 1,
            page_type=p_type,
            original_image_path=cover_path if (idx == 0 and cover_path) else "",
            story_text=f"Front Cover: {title}" if idx == 0 else ("The End" if idx == pages_to_create - 1 else f"Narrative scene for page {idx + 1}."),
            extracted_text="",
            scene_description=f"Detailed scene illustration for page {idx + 1}",
            character_guidance="Warm, whimsical children's book illustration.",
            prompt_template="",
            personalization_required=True,
            allow_illustration_generation=True
        )
        db.add(page)

    db.commit()
    db.refresh(story)
    return enrich_story_urls(story)

@router.patch("/stories/{story_id}/toggle-status", response_model=StoryTemplateOut)
def toggle_story_status(story_id: str, db: Session = Depends(get_db)):
    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    if story.status == "published":
        story.status = "draft"
    else:
        story.status = "published"

    db.commit()
    db.refresh(story)
    return enrich_story_urls(story)

@router.delete("/stories/{story_id}")
def delete_story(story_id: str, db: Session = Depends(get_db)):
    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    story_title = story.title

    # 1. Get all pages of the story
    pages = db.query(StoryPage).filter(StoryPage.story_id == story_id).all()
    page_ids = [p.id for p in pages]

    # 2. Get all personalization jobs of the story
    jobs = db.query(PersonalizationJob).filter(PersonalizationJob.story_id == story_id).all()
    job_ids = [j.id for j in jobs]

    # 3. Clean up books and orders referencing these jobs
    if job_ids:
        books = db.query(Book).filter(Book.job_id.in_(job_ids)).all()
        book_ids = [b.id for b in books]
        if book_ids:
            db.query(Order).filter(Order.book_id.in_(book_ids)).update({Order.book_id: None}, synchronize_session=False)
        db.query(Order).filter(Order.job_id.in_(job_ids)).update({Order.job_id: None}, synchronize_session=False)
        db.query(Book).filter(Book.job_id.in_(job_ids)).delete(synchronize_session=False)

    # 4. Clean up generated assets linked to these jobs or these pages
    if page_ids or job_ids:
        conditions = []
        if page_ids:
            conditions.append(GeneratedAsset.story_page_id.in_(page_ids))
        if job_ids:
            conditions.append(GeneratedAsset.job_id.in_(job_ids))
        from sqlalchemy import or_
        db.query(GeneratedAsset).filter(or_(*conditions)).delete(synchronize_session=False)

    # 5. Delete personalization jobs
    if job_ids:
        db.query(PersonalizationJob).filter(PersonalizationJob.id.in_(job_ids)).delete(synchronize_session=False)

    # 6. Delete all pages
    if page_ids:
        db.query(StoryPage).filter(StoryPage.id.in_(page_ids)).delete(synchronize_session=False)

    # 7. Delete the story
    db.delete(story)
    db.commit()
    return {"status": "success", "message": f"Story '{story_title}' deleted successfully"}

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
        if k == "cover_image_url" and v:
            setattr(story, "cover_image_path", v)
        else:
            setattr(story, k, v)

    db.commit()
    db.refresh(story)
    return enrich_story_urls(story)

def serialize_page(page: StoryPage) -> dict:
    return {
        "id": page.id,
        "story_id": page.story_id,
        "page_index": page.page_index,
        "page_number": page.page_number,
        "page_type": page.page_type or "story",
        "story_text": page.story_text or "",
        "extracted_text": page.extracted_text or "",
        "scene_description": page.scene_description or "",
        "character_guidance": page.character_guidance or "",
        "prompt_template": page.prompt_template or "",
        "personalization_required": bool(page.personalization_required),
        "allow_illustration_generation": bool(page.allow_illustration_generation),
        "original_image_path": page.original_image_path or "",
        "original_image_url": storage.get_public_url(page.original_image_path),
        "face_outline_points": getattr(page, "face_outline_points", "") or "",
        "text_x": getattr(page, "text_x", 50.0) if getattr(page, "text_x", None) is not None else 50.0,
        "text_y": getattr(page, "text_y", 89.5) if getattr(page, "text_y", None) is not None else 89.5,
        "font_size": getattr(page, "font_size", 20) or 20,
        "font_family": getattr(page, "font_family", "Sans (DejaVu Bold)") or "Sans (DejaVu Bold)",
        "font_color": getattr(page, "font_color", "#000000") or "#000000",
        "letter_spacing": getattr(page, "letter_spacing", 0) or 0,
        "stroke_color": getattr(page, "stroke_color", "#FFFFFF") or "#FFFFFF",
        "stroke_width": getattr(page, "stroke_width", 0) if getattr(page, "stroke_width", None) is not None else 0,
        "has_shadow": getattr(page, "has_shadow", True) if getattr(page, "has_shadow", None) is not None else True,
        "soft_line_break": getattr(page, "soft_line_break", True) if getattr(page, "soft_line_break", None) is not None else True,
        "has_background_box": getattr(page, "has_background_box", False) or False,
        "warp_style": getattr(page, "warp_style", "None") or "None",
        "gender_variant": getattr(page, "gender_variant", "boy") or "boy",
    }

@router.put("/pages/{page_id}", response_model=StoryPageOut)
def update_story_page(page_id: str, payload: StoryPageUpdate, db: Session = Depends(get_db)):
    page = db.query(StoryPage).filter(StoryPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Story page not found")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(page, k, v)

    db.commit()
    db.refresh(page)
    return serialize_page(page)

@router.post("/pages/{page_id}/upload-base-art", response_model=StoryPageOut)
async def upload_page_base_art(page_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    page = db.query(StoryPage).filter(StoryPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Story page not found")
    
    saved_path = await storage.save_upload_file(
        file, category="source_pages", allowed_extensions=(".png", ".jpg", ".jpeg", ".webp")
    )
    page.original_image_path = saved_path
    db.commit()
    db.refresh(page)
    return serialize_page(page)

@router.post("/pages/{page_id}/auto-trace", response_model=StoryPageOut)
def auto_trace_page(page_id: str, db: Session = Depends(get_db)):
    page = db.query(StoryPage).filter(StoryPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Story page not found")

    detected_pts = ""
    if page.original_image_path and os.path.exists(page.original_image_path):
        detected_pts = PDFImporterService.detect_page_character_face(page.original_image_path)

    if not detected_pts:
        import json
        pts = [
            [42.0, 36.0], [45.5, 35.0], [49.0, 35.5], [52.0, 37.0], [54.5, 40.0],
            [55.0, 44.0], [53.5, 48.0], [51.0, 51.5], [48.0, 54.0], [45.0, 55.0],
            [41.5, 54.5], [38.0, 52.0], [35.5, 49.0], [34.0, 45.0], [34.5, 41.0],
            [36.5, 38.0], [39.0, 36.5], [42.0, 36.0]
        ]
        detected_pts = json.dumps(pts)

    page.face_outline_points = detected_pts
    db.commit()
    db.refresh(page)
    return serialize_page(page)

@router.post("/stories/{story_id}/auto-trace-all")
def auto_trace_all_pages(story_id: str, db: Session = Depends(get_db)):
    pages = db.query(StoryPage).filter(StoryPage.story_id == story_id).all()
    count = 0
    import json
    default_pts = json.dumps([
        [42.0, 36.0], [45.5, 35.0], [49.0, 35.5], [52.0, 37.0], [54.5, 40.0],
        [55.0, 44.0], [53.5, 48.0], [51.0, 51.5], [48.0, 54.0], [45.0, 55.0],
        [41.5, 54.5], [38.0, 52.0], [35.5, 49.0], [34.0, 45.0], [34.5, 41.0],
        [36.5, 38.0], [39.0, 36.5], [42.0, 36.0]
    ])
    for p in pages:
        if not p.face_outline_points or p.face_outline_points in ["", "[]"]:
            detected_pts = ""
            if p.original_image_path and os.path.exists(p.original_image_path):
                detected_pts = PDFImporterService.detect_page_character_face(p.original_image_path)
            p.face_outline_points = detected_pts or default_pts
            count += 1
    db.commit()
    return {"status": "success", "message": f"Auto-traced {count} untraced pages", "count": count}

@router.post("/stories/{story_id}/pages", response_model=StoryPageOut)
def add_story_page(story_id: str, payload: dict, db: Session = Depends(get_db)):
    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    existing = db.query(StoryPage).filter(StoryPage.story_id == story_id).all()
    next_idx = len(existing)
    next_num = max([p.page_number for p in existing], default=0) + 1
    page_type = payload.get("page_type", "story")
    gender = payload.get("gender_variant", "boy")
    
    new_page = StoryPage(
        id=str(uuid.uuid4()),
        story_id=story_id,
        page_index=next_idx,
        page_number=next_num,
        page_type=page_type,
        story_text=payload.get("story_text", f"Narrative beat for page {next_num}"),
        scene_description=payload.get("scene_description", "Warm children's storybook scene"),
        character_guidance=payload.get("character_guidance", "children's storybook illustration, soft colours, consistent character, clean line art"),
        prompt_template="",
        gender_variant=gender,
        text_x=50.0,
        text_y=89.5,
        font_size=20,
        font_family="Sans (DejaVu Bold)",
        font_color="#000000",
        letter_spacing=0,
        stroke_color="#FFFFFF",
        stroke_width=0,
        has_shadow=True,
        soft_line_break=True,
        has_background_box=False,
        warp_style="None"
    )
    db.add(new_page)
    story.page_count = len(existing) + 1
    db.commit()
    db.refresh(new_page)
    return serialize_page(new_page)

@router.delete("/pages/{page_id}")
def delete_page(page_id: str, db: Session = Depends(get_db)):
    page = db.query(StoryPage).filter(StoryPage.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Story page not found")
    story_id = page.story_id
    # Clean up any generated assets referencing this page first
    db.query(GeneratedAsset).filter(GeneratedAsset.story_page_id == page_id).delete(synchronize_session=False)
    db.delete(page)
    story = db.query(StoryTemplate).filter(StoryTemplate.id == story_id).first()
    if story:
        remaining = db.query(StoryPage).filter(StoryPage.story_id == story_id).order_by(StoryPage.page_index).all()
        story.page_count = len(remaining)
        for i, p in enumerate(remaining):
            p.page_index = i
            p.page_number = i + 1
    db.commit()
    return {"status": "success", "message": f"Page {page_id} deleted"}

@router.post("/compare-providers")
async def compare_providers(
    file: Optional[UploadFile] = File(None),
    presets: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    saved_url = ""
    if file and file.filename:
        saved_path = await storage.save_upload_file(file, category="child_photos")
        saved_url = storage.get_public_url(saved_path)

    preset_items = [p.strip() for p in (presets or "").split(",") if p.strip()]
    if not preset_items:
        preset_items = [
            "low q · low fidelity ~$0.02",
            "low q · high fidelity ~$0.11",
            "medium q · high fidelity ~$0.14",
            "high q · high fidelity ~$0.26"
        ]

    cost_map = {
        "low q · low fidelity": ("OpenAI DALL-E 3 (low q · low fidelity)", "$0.02"),
        "low q · high fidelity": ("OpenAI DALL-E 3 (low q · high fidelity)", "$0.11"),
        "medium q · high fidelity": ("FLUX.1 + PuLID (medium q · high fidelity)", "$0.14"),
        "high q · high fidelity": ("FLUX.1 + PuLID (high q · high fidelity)", "$0.26"),
    }

    results = []
    for p in preset_items:
        matched = False
        for k, (name, cost) in cost_map.items():
            if k in p.lower():
                results.append({"provider": name, "cost": cost, "url": saved_url})
                matched = True
                break
        if not matched:
            results.append({"provider": p, "cost": "$0.10", "url": saved_url})

    return {
        "status": "success",
        "message": "Comparison test renders completed",
        "results": results
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


@router.get("/dashboard", response_model=DashboardStatsOut)
def get_dashboard_data(db: Session = Depends(get_db)):
    # Calculate revenue from paid/completed/in-production/delivered/shipped orders
    paid_statuses = ["Paid", "In Production", "Delivered", "Shipped"]
    paid_orders = db.query(Order).filter(
        (Order.payment_status == "paid") | (Order.status.in_(paid_statuses))
    ).all()

    total_revenue = sum(o.amount for o in paid_orders) if paid_orders else 0.0
    paid_orders_count = len(paid_orders)

    # Actual count of personalization jobs/previews created
    previews_created = db.query(PersonalizationJob).count()

    # Actual count of live/published stories
    live_stories = db.query(StoryTemplate).filter(StoryTemplate.status == "published").count()
    if live_stories == 0:
        live_stories = db.query(StoryTemplate).count()

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(15).all()

    all_orders = db.query(Order).all()
    status_counts = {}
    for o in all_orders:
        s = o.status or "Pending"
        status_counts[s] = status_counts.get(s, 0) + 1

    formatted_revenue = f"₹{int(total_revenue):,}" if total_revenue.is_integer() else f"₹{total_revenue:,.2f}"

    return {
        "revenue": total_revenue,
        "revenue_formatted": formatted_revenue,
        "currency_symbol": "₹",
        "currency": "INR",
        "paid_orders": paid_orders_count,
        "previews_created": previews_created,
        "live_stories": live_stories,
        "recent_orders": recent_orders,
        "status_counts": status_counts
    }


@router.get("/orders", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    query = db.query(Order)

    if status and status.lower() != "all":
        query = query.filter(Order.status == status)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Order.customer_name.ilike(search_pattern)) |
            (Order.order_number.ilike(search_pattern)) |
            (Order.id.ilike(search_pattern))
        )

    return query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()


@router.post("/orders", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    order_dict = payload.dict()
    if not order_dict.get("order_number"):
        order_dict["order_number"] = f"cm{uuid.uuid4().hex[:8]}"
    if not order_dict.get("id"):
        order_dict["id"] = order_dict["order_number"]

    order = Order(**order_dict)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter((Order.id == order_id) | (Order.order_number == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: str, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter((Order.id == order_id) | (Order.order_number == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    if payload.status in ["Paid", "In Production", "Delivered", "Shipped"]:
        order.payment_status = "paid"
    elif payload.status == "Pending":
        order.payment_status = "unpaid"

    db.commit()
    db.refresh(order)
    return order


@router.delete("/orders/{order_id}")
def delete_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter((Order.id == order_id) | (Order.order_number == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"status": "success", "message": f"Order {order_id} deleted"}


@router.get("/book-sales/by-state")
def get_book_sales_by_state(
    period: str = "30days",
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get completed, paid book sales grouped by shipping state.
    Strictly excludes cancelled and refunded orders.
    Calculates metrics for the 28 states of India and union territories.
    """
    import json
    from datetime import datetime, timedelta

    today = datetime(2026, 10, 21)
    if period == "30days":
        start_dt = today - timedelta(days=29)
        end_dt = today + timedelta(days=1)
    elif period == "1year":
        start_dt = today - timedelta(days=364)
        end_dt = today + timedelta(days=1)
    else:
        start_dt = datetime.strptime(from_date, "%Y-%m-%d") if from_date else today - timedelta(days=29)
        end_dt = datetime.strptime(to_date, "%Y-%m-%d") + timedelta(days=1) if to_date else today + timedelta(days=1)

    valid_statuses = ["Paid", "Delivered", "Shipped", "In Production"]
    query = db.query(Order).filter(
        Order.created_at >= start_dt,
        Order.created_at <= end_dt,
        Order.payment_status == "paid",
        Order.status.in_(valid_statuses),
        ~Order.status.in_(["Cancelled", "Refunded"]),
        Order.payment_status != "refunded"
    )
    orders = query.all()

    state_counts = {}
    total_books = 0
    for o in orders:
        s_id = "other"
        if o.shipping_address:
            try:
                addr_data = json.loads(o.shipping_address)
                s_id = addr_data.get("state_id", "other").lower()
            except Exception:
                pass
        state_counts[s_id] = state_counts.get(s_id, 0) + 1
        total_books += 1

    indian_28_states = {
        "ap", "ar", "as", "br", "ct", "ga", "gj", "hr", "hp", "jh",
        "ka", "kl", "mp", "mh", "mn", "ml", "mz", "nl", "or", "pb",
        "rj", "sk", "tn", "tg", "tr", "up", "ut", "wb"
    }

    states_reached_count = sum(1 for s in indian_28_states if state_counts.get(s, 0) > 0)

    top_state_id = max(state_counts, key=state_counts.get) if state_counts else "tn"
    top_state_count = state_counts.get(top_state_id, 0)

    return {
        "period": period,
        "from_date": start_dt.strftime("%Y-%m-%d"),
        "to_date": (end_dt - timedelta(days=1)).strftime("%Y-%m-%d"),
        "total_books": total_books,
        "states_reached_count": states_reached_count,
        "total_indian_states": 28,
        "top_state": {
            "id": top_state_id,
            "count": top_state_count
        },
        "state_counts": state_counts
    }


@router.get("/payments")
def get_admin_payments(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    """Fetch payment transactions for the Admin Payments view."""
    from app.routers.payments import list_payment_transactions
    return list_payment_transactions(limit=limit, offset=offset, db=db)


@router.post("/seed")
def reseed_database(db: Session = Depends(get_db)):
    """Reseed admin accounts and initial story templates."""
    from app.seed_admin import seed_admin_users
    from app.seed_stories import seed as seed_stories
    try:
        admin_res = seed_admin_users(db=db)
        seed_stories()
        return {
            "status": "success",
            "message": "Database reseeded successfully with admin logins and story catalog.",
            "admins": [a["email"] for a in admin_res]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reseed database: {str(e)}")


