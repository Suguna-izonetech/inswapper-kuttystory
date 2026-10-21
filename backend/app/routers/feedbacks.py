import os
import uuid
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Feedback
from app.schemas import FeedbackOut, FeedbackStatusUpdate, FeedbackUpdate
from app.services.storage import storage

router = APIRouter(tags=["Feedback"])

ALLOWED_MEDIA_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".mp4", ".webm", ".mov")
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB

@router.post("/feedbacks", response_model=FeedbackOut)
async def submit_feedback(
    name: str = Form(...),
    place: str = Form(...),
    rating: int = Form(...),
    review_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Public submission of customer review and feedback.
    Validates required fields and optional media upload.
    Written review text is optional (user can submit rating + media only).
    New submissions are strictly saved as 'pending' awaiting admin approval.
    """
    name_clean = name.strip()
    place_clean = place.strip()
    review_clean = review_text.strip() if review_text else ""

    if not name_clean:
        raise HTTPException(status_code=422, detail="Name is required")
    if not place_clean:
        raise HTTPException(status_code=422, detail="Place is required")
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5 stars")

    saved_media_url = None
    media_type = None

    if file and file.filename:
        suffix = Path(file.filename).suffix.lower()
        if suffix not in ALLOWED_MEDIA_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{suffix}'. Allowed formats: PNG, JPG, JPEG, WEBP, MP4, WEBM, MOV."
            )

        # Check file size
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Uploaded file exceeds the maximum allowed size of 15MB (File size: {size / (1024*1024):.1f}MB)."
            )

        media_type = "video" if suffix in (".mp4", ".webm", ".mov") else "image"

        try:
            stored_path = await storage.save_upload_file(
                upload_file=file,
                category="feedback_media",
                allowed_extensions=ALLOWED_MEDIA_EXTENSIONS
            )
            saved_media_url = storage.get_public_url(stored_path)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process media upload: {str(e)}")

    feedback = Feedback(
        id=str(uuid.uuid4()),
        name=name_clean,
        place=place_clean,
        rating=rating,
        review_text=review_clean,
        media_url=saved_media_url,
        media_type=media_type,
        status="pending",  # Saved as Pending by default
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/feedbacks/approved", response_model=List[FeedbackOut])
def get_approved_feedbacks(db: Session = Depends(get_db)):
    """
    Publicly visible reviews approved by an admin.
    Excludes private contact details and unapproved submissions.
    """
    return (
        db.query(Feedback)
        .filter(Feedback.status == "approved")
        .order_by(Feedback.created_at.desc())
        .all()
    )


@router.get("/admin/feedbacks", response_model=List[FeedbackOut])
def list_admin_feedbacks(
    status: Optional[str] = Query("all", description="Filter by status: all, pending, approved, rejected"),
    search: Optional[str] = Query(None, description="Search by name, place, or review text"),
    db: Session = Depends(get_db)
):
    """
    Admin listing of all feedback submissions with filtering and search.
    """
    query = db.query(Feedback)

    if status and status.lower() != "all":
        query = query.filter(Feedback.status == status.lower())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Feedback.name.ilike(term),
                Feedback.place.ilike(term),
                Feedback.review_text.ilike(term)
            )
        )

    return query.order_by(Feedback.created_at.desc()).all()


@router.patch("/admin/feedbacks/{feedback_id}/status", response_model=FeedbackOut)
def update_feedback_status(
    feedback_id: str,
    payload: FeedbackStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Approve, publish, reject, or unpublish feedback submissions.
    """
    target_status = payload.status.lower()
    if target_status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be pending, approved, or rejected.")

    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback submission not found")

    feedback.status = target_status
    feedback.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(feedback)
    return feedback


@router.patch("/admin/feedbacks/{feedback_id}", response_model=FeedbackOut)
def edit_feedback(
    feedback_id: str,
    payload: FeedbackUpdate,
    db: Session = Depends(get_db)
):
    """
    Edit feedback text, author name, place, rating, or status.
    """
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback submission not found")

    if payload.name is not None:
        feedback.name = payload.name.strip()
    if payload.place is not None:
        feedback.place = payload.place.strip()
    if payload.rating is not None:
        if payload.rating < 1 or payload.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        feedback.rating = payload.rating
    if payload.review_text is not None:
        feedback.review_text = payload.review_text.strip()
    if payload.status is not None:
        target_status = payload.status.lower()
        if target_status in ["pending", "approved", "rejected"]:
            feedback.status = target_status

    feedback.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(feedback)
    return feedback


@router.delete("/admin/feedbacks/{feedback_id}")
def delete_feedback(
    feedback_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a feedback submission and remove attached media.
    """
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback submission not found")

    # Clean up media file if present
    if feedback.media_url and "/storage/feedback_media/" in feedback.media_url:
        try:
            filename = feedback.media_url.split("/storage/feedback_media/")[-1]
            filepath = StorageManager.get_category_dir("feedback_media") / filename
            if filepath.exists():
                filepath.unlink()
        except Exception:
            pass

    db.delete(feedback)
    db.commit()
    return {"status": "success", "message": "Feedback deleted successfully"}
