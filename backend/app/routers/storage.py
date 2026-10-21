from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
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
    Serve storage files securely directly from MinIO object storage.
    Streams media content (PNG, JPEG, WebP, PDF, MP4) with proper caching.
    Enforces authorization check for pending feedback media.
    """
    # Security check for feedback_media
    if category == "feedback_media":
        matched_feedback = db.query(Feedback).filter(
            Feedback.media_url.like(f"%{filename}%")
        ).first()
        if matched_feedback and matched_feedback.status != "approved":
            auth_header = request.headers.get("Authorization", "")
            is_admin = bool(auth_header and "Bearer" in auth_header)
            if not is_admin:
                raise HTTPException(
                    status_code=403,
                    detail="This media is awaiting admin approval before public access."
                )

    try:
        stream, media_type, content_length = storage.get_object_stream(category, filename)

        def iterfile():
            try:
                for chunk in stream.stream(32768):
                    yield chunk
            finally:
                stream.close()
                stream.release_conn()

        headers = {
            "Content-Length": str(content_length),
            "Cache-Control": "public, max-age=86400",
            "Accept-Ranges": "bytes",
        }

        return StreamingResponse(
            iterfile(),
            media_type=media_type,
            headers=headers
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File not found in storage: {str(e)}")
