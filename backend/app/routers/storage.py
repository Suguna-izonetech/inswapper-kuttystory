from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from pathlib import Path
from sqlalchemy.orm import Session
from app.services.storage import storage
from app.database import get_db
from app.models import Feedback

router = APIRouter(prefix="/storage", tags=["Storage"])

@router.get("/{category}/{filename:path}")
async def serve_file(
    category: str,
    filename: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Serve storage files securely (images, videos, PDFs).
    Makes feedback media public only after the related review is approved.
    """
    try:
        file_path = storage.get_file_path(category, filename)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Security check for feedback_media
        if category == "feedback_media":
            # Check if media belongs to an approved review
            matched_feedback = db.query(Feedback).filter(
                Feedback.media_url.like(f"%{filename}%")
            ).first()
            if matched_feedback and matched_feedback.status != "approved":
                # Check for admin authorization
                auth_header = request.headers.get("Authorization", "")
                is_admin = bool(auth_header and "Bearer" in auth_header)
                if not is_admin:
                    raise HTTPException(
                        status_code=403,
                        detail="This media is awaiting admin approval before public access."
                    )

        media_type = "application/octet-stream"
        suffix = file_path.suffix.lower()
        if suffix == ".png":
            media_type = "image/png"
        elif suffix in [".jpg", ".jpeg"]:
            media_type = "image/jpeg"
        elif suffix == ".webp":
            media_type = "image/webp"
        elif suffix == ".mp4":
            media_type = "video/mp4"
        elif suffix == ".webm":
            media_type = "video/webm"
        elif suffix in [".mov", ".quicktime"]:
            media_type = "video/quicktime"
        elif suffix == ".pdf":
            media_type = "application/pdf"

        return FileResponse(file_path, media_type=media_type)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

