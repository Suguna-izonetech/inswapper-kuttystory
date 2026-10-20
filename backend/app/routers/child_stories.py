from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import datetime

from app.database import get_db
from app.models import ChildWrittenStory

router = APIRouter(prefix="/child-stories", tags=["Child Stories"])

class ChildStoryCreate(BaseModel):
    child_name: str
    standard: str
    place: str
    title: str
    story_text: str
    category: Optional[str] = "Adventure"
    cover_color: Optional[str] = "#C98A84"
    parent_email: Optional[str] = None

class ChildStoryUpdate(BaseModel):
    title: Optional[str] = None
    story_text: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None  # approved, pending, featured, rejected
    cover_color: Optional[str] = None

@router.get("")
def get_published_child_stories(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Public API: Fetch approved and featured stories written by children.
    """
    query = db.query(ChildWrittenStory).filter(
        ChildWrittenStory.status.in_(["approved", "featured"])
    )
    if category and category.lower() not in ["all", "all stories"]:
        query = query.filter(ChildWrittenStory.category.ilike(f"%{category}%"))
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (ChildWrittenStory.title.ilike(s)) |
            (ChildWrittenStory.child_name.ilike(s)) |
            (ChildWrittenStory.place.ilike(s)) |
            (ChildWrittenStory.story_text.ilike(s))
        )

    # Featured first, then newest
    stories = query.order_by(
        (ChildWrittenStory.status == "featured").desc(),
        ChildWrittenStory.created_at.desc()
    ).all()

    return [
        {
            "id": s.id,
            "child_name": s.child_name,
            "standard": s.standard,
            "place": s.place,
            "title": s.title,
            "story_text": s.story_text,
            "category": s.category,
            "cover_color": s.cover_color,
            "status": s.status,
            "likes_count": s.likes_count,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in stories
    ]

@router.post("")
def submit_child_story(
    payload: ChildStoryCreate,
    db: Session = Depends(get_db)
):
    """
    Public API: Submit a story written by a child.
    """
    if not payload.child_name.strip():
        raise HTTPException(status_code=400, detail="Child's name is required")
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Story title is required")
    if not payload.story_text.strip() or len(payload.story_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please write at least a few sentences for the story.")

    palette = ["#C98A84", "#8B3DFF", "#2E7D32", "#0288D1", "#E65100", "#795548"]
    import random
    color = payload.cover_color or random.choice(palette)

    new_story = ChildWrittenStory(
        child_name=payload.child_name.strip(),
        standard=payload.standard.strip() if payload.standard else "Young Author",
        place=payload.place.strip() if payload.place else "India",
        title=payload.title.strip(),
        story_text=payload.story_text.strip(),
        category=payload.category or "Adventure",
        cover_color=color,
        parent_email=payload.parent_email.strip() if payload.parent_email else None,
        status="pending", # Awaiting admin review and publishing
        likes_count=0
    )
    db.add(new_story)
    db.commit()
    db.refresh(new_story)

    return {
        "status": "success",
        "message": f"Congratulations {new_story.child_name}! Your story '{new_story.title}' has been received!",
        "story": {
            "id": new_story.id,
            "child_name": new_story.child_name,
            "standard": new_story.standard,
            "place": new_story.place,
            "title": new_story.title,
            "category": new_story.category,
            "status": new_story.status
        }
    }

@router.post("/{story_id}/like")
def like_child_story(
    story_id: str,
    db: Session = Depends(get_db)
):
    """
    Public API: Increment like counter for a child's story.
    """
    story = db.query(ChildWrittenStory).filter(ChildWrittenStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    story.likes_count = (story.likes_count or 0) + 1
    db.commit()
    return {"status": "liked", "likes_count": story.likes_count}

@router.get("/admin/all")
def get_all_child_stories_admin(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Admin API: List all submissions including pending, approved, featured, rejected.
    """
    query = db.query(ChildWrittenStory)
    if status and status.lower() != "all":
        query = query.filter(ChildWrittenStory.status == status.lower())

    stories = query.order_by(ChildWrittenStory.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "child_name": s.child_name,
            "standard": s.standard,
            "place": s.place,
            "title": s.title,
            "story_text": s.story_text,
            "category": s.category,
            "cover_color": s.cover_color,
            "parent_email": s.parent_email,
            "status": s.status,
            "likes_count": s.likes_count,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        }
        for s in stories
    ]

@router.patch("/admin/{story_id}")
def update_child_story_admin(
    story_id: str,
    payload: ChildStoryUpdate,
    db: Session = Depends(get_db)
):
    """
    Admin API: Update status (approved, pending, featured, rejected) or text.
    """
    story = db.query(ChildWrittenStory).filter(ChildWrittenStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    if payload.status is not None:
        story.status = payload.status
    if payload.title is not None:
        story.title = payload.title
    if payload.story_text is not None:
        story.story_text = payload.story_text
    if payload.category is not None:
        story.category = payload.category
    if payload.cover_color is not None:
        story.cover_color = payload.cover_color

    story.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(story)
    return {"status": "success", "story_id": story.id, "current_status": story.status}

@router.delete("/admin/{story_id}")
def delete_child_story_admin(
    story_id: str,
    db: Session = Depends(get_db)
):
    """
    Admin API: Delete a story submission.
    """
    story = db.query(ChildWrittenStory).filter(ChildWrittenStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    db.delete(story)
    db.commit()
    return {"status": "deleted", "story_id": story_id}
