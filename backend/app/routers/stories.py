from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import StoryTemplate, StoryPage
from app.schemas import StoryTemplateOut, StoryPageOut
from app.services.storage import storage

router = APIRouter(prefix="/stories", tags=["Stories"])

def enrich_story_urls(story: StoryTemplate) -> dict:
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
        "cover_image_url": storage.get_public_url(story.cover_image_path),
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
            "original_image_url": storage.get_public_url(page.original_image_path)
        })
    return data

@router.get("", response_model=List[StoryTemplateOut])
def list_stories(db: Session = Depends(get_db)):
    stories = db.query(StoryTemplate).filter(StoryTemplate.status == "published").all()
    return [enrich_story_urls(s) for s in stories]

@router.get("/{slug_or_id}", response_model=StoryTemplateOut)
def get_story(slug_or_id: str, db: Session = Depends(get_db)):
    story = db.query(StoryTemplate).filter(
        (StoryTemplate.slug == slug_or_id) | (StoryTemplate.id == slug_or_id)
    ).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return enrich_story_urls(story)
