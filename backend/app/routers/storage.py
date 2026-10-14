from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from app.services.storage import storage

router = APIRouter(prefix="/storage", tags=["Storage"])

@router.get("/{category}/{filename:path}")
async def serve_file(category: str, filename: str):
    """
    Serve private storage files securely (images, PDFs).
    """
    try:
        file_path = storage.get_file_path(category, filename)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        media_type = "application/octet-stream"
        suffix = file_path.suffix.lower()
        if suffix == ".png":
            media_type = "image/png"
        elif suffix in [".jpg", ".jpeg"]:
            media_type = "image/jpeg"
        elif suffix == ".pdf":
            media_type = "application/pdf"
            
        return FileResponse(file_path, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
