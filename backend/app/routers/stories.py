from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import StoryTemplate, StoryPage
from app.schemas import StoryTemplateOut, StoryPageOut
from app.services.storage import storage

router = APIRouter(prefix="/stories", tags=["Stories"])

def enrich_story_urls(story: StoryTemplate) -> dict:
    cover_url = storage.get_public_url(story.cover_image_path)
    if not cover_url and story.pages:
        for page in sorted(story.pages, key=lambda p: p.page_index):
            if page.original_image_path:
                cand = storage.get_public_url(page.original_image_path)
                if cand:
                    cover_url = cand
                    break

    data = {
        "id": story.id,
        "slug": story.slug,
        "title": story.title,
        "description": story.description,
        "category": story.category,
        "age_range": story.age_range,
        "language": story.language,
        "price_digital": story.price_digital,
        "price_print": story.price_print,
        "currency": story.currency,
        "status": story.status,
        "page_count": story.page_count,
        "cover_image_path": story.cover_image_path,
        "cover_image_url": cover_url,
        "target_gender": getattr(story, "target_gender", "both") or "both",
        "min_age": getattr(story, "min_age", 2) or 2,
        "max_age": getattr(story, "max_age", 13) or 13,
        "created_at": story.created_at,
        "updated_at": story.updated_at,
        "pages": []
    }
    for page in sorted(story.pages, key=lambda p: p.page_index):
        data["pages"].append({
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
        })
    return data

@router.get("", response_model=List[StoryTemplateOut])
def list_stories(db: Session = Depends(get_db)):
    stories = (
        db.query(StoryTemplate)
        .filter(StoryTemplate.status == "published")
        .order_by(StoryTemplate.created_at.desc())
        .all()
    )
    return [enrich_story_urls(s) for s in stories]

@router.get("/{slug_or_id}", response_model=StoryTemplateOut)
def get_story(slug_or_id: str, db: Session = Depends(get_db)):
    story = db.query(StoryTemplate).filter(
        (StoryTemplate.slug == slug_or_id) | (StoryTemplate.id == slug_or_id)
    ).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return enrich_story_urls(story)
