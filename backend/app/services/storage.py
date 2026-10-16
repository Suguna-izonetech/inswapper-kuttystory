import os
import shutil
import uuid
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image
from app.config import settings

class StorageManager:
    """
    Private local storage adapter ensuring private files, normalized paths,
    and secure access.
    """
    
    @staticmethod
    def get_category_dir(category: str) -> Path:
        categories = {
            "original_pdfs": settings.ORIGINAL_PDFS_DIR,
            "source_pages": settings.SOURCE_PAGES_DIR,
            "child_photos": settings.CHILD_PHOTOS_DIR,
            "generated_assets": settings.GENERATED_ASSETS_DIR,
            "previews": settings.PREVIEWS_DIR,
            "final_books": settings.FINAL_BOOKS_DIR,
        }
        if category not in categories:
            raise ValueError(f"Invalid storage category: {category}")
        target_dir = categories[category]
        target_dir.mkdir(parents=True, exist_ok=True)
        return target_dir

    @staticmethod
    async def save_upload_file(upload_file: UploadFile, category: str, allowed_extensions: Tuple[str, ...] = (".png", ".jpg", ".jpeg", ".pdf")) -> str:
        ext = Path(upload_file.filename).suffix.lower()
        if ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Invalid file extension {ext}. Allowed: {allowed_extensions}")
        
        target_dir = StorageManager.get_category_dir(category)
        file_id = f"{uuid.uuid4().hex}{ext}"
        destination = target_dir / file_id
        
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        # If it's an image, validate integrity with PIL
        if ext in (".png", ".jpg", ".jpeg"):
            try:
                with Image.open(destination) as img:
                    img.verify()
            except Exception as e:
                if destination.exists():
                    destination.unlink()
                raise HTTPException(status_code=400, detail=f"Corrupted image file: {str(e)}")
                
        return str(destination)

    @staticmethod
    def save_bytes(data: bytes, category: str, extension: str = ".png", custom_name: Optional[str] = None) -> str:
        target_dir = StorageManager.get_category_dir(category)
        name = custom_name or f"{uuid.uuid4().hex}{extension}"
        destination = target_dir / name
        with open(destination, "wb") as f:
            f.write(data)
        return str(destination)

    @staticmethod
    def get_public_url(abs_path: Optional[str]) -> Optional[str]:
        if not abs_path:
            return None
        if abs_path.startswith("http://") or abs_path.startswith("https://") or abs_path.startswith("/") or abs_path.startswith("data:"):
            return abs_path
        path_obj = Path(abs_path)
        try:
            rel = path_obj.relative_to(settings.STORAGE_DIR)
            parts = rel.parts
            if len(parts) >= 2:
                category = parts[0]
                filename = "/".join(parts[1:])
                return f"{settings.API_V1_PREFIX}/storage/{category}/{filename}"
        except Exception:
            pass
        return None

    @staticmethod
    def get_file_path(category: str, filename: str) -> Path:
        target_dir = StorageManager.get_category_dir(category).resolve()
        # Resolve target path and ensure it stays within target_dir
        target_path = (target_dir / filename).resolve()
        try:
            target_path.relative_to(target_dir)
        except ValueError:
            raise HTTPException(status_code=403, detail="Access denied")
        if not target_path.exists():
            raise HTTPException(status_code=404, detail="Requested file not found")
        return target_path

storage = StorageManager()
