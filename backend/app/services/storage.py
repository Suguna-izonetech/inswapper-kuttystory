"""
MinIO Object Storage Service for Kutty Story Application.

Replaces local folder storage with MinIO object storage:
- Stores all assets (PDFs, page artwork, child photos, generated assets, previews, books) in MinIO.
- Automatically initializes and creates the MinIO bucket.
- Provides streaming file access, presigned URLs, and temporary cache resolution for ReportLab/OpenCV.
- Includes automatic sync utility for existing assets.
"""

import io
import os
import mimetypes
import tempfile
import uuid
from pathlib import Path
from typing import Optional, Tuple, Any
from fastapi import UploadFile, HTTPException
from PIL import Image
from minio import Minio
from minio.error import S3Error

from app.config import settings


class StorageManager:
    """
    MinIO S3-compatible Object Storage Manager.
    All files are persistently stored in MinIO object storage instead of local disk folders.
    """

    CATEGORIES = {
        "original_pdfs",
        "source_pages",
        "child_photos",
        "generated_assets",
        "previews",
        "final_books",
        "feedback_media",
        "cache_cmyk",
    }

    def __init__(self):
        self.bucket = settings.MINIO_BUCKET or "kuttystory"
        self._client: Optional[Minio] = None
        self._temp_cache_dir = Path(tempfile.gettempdir()) / "kuttystory_cache"
        self._temp_cache_dir.mkdir(parents=True, exist_ok=True)
        self._bucket_initialized = False

    @property
    def client(self) -> Minio:
        if self._client is None:
            self._init_minio_client()
        return self._client

    def _init_minio_client(self):
        """Initialize MinIO client and ensure bucket exists."""
        raw_endpoint = (settings.MINIO_ENDPOINT or "127.0.0.1:9000").strip()
        secure = settings.MINIO_SECURE

        # Strip protocol if user specified http:// or https:// in MINIO_ENDPOINT
        if raw_endpoint.startswith("https://"):
            raw_endpoint = raw_endpoint.replace("https://", "", 1)
            secure = True
        elif raw_endpoint.startswith("http://"):
            raw_endpoint = raw_endpoint.replace("http://", "", 1)
            secure = False

        endpoint = raw_endpoint.rstrip("/")
        access_key = settings.MINIO_ACCESS_KEY or "minioadmin"
        secret_key = settings.MINIO_SECRET_KEY or "minioadmin"

        try:
            self._client = Minio(
                endpoint,
                access_key=access_key,
                secret_key=secret_key,
                secure=secure,
            )
            self._ensure_bucket()
        except Exception as e:
            print(f"[MinIO] Notice during client initialization ({endpoint}): {e}")

    def _ensure_bucket(self):
        """Ensure the MinIO bucket exists; create it if missing."""
        if self._bucket_initialized:
            return
        if self._client is None:
            return
        try:
            if not self._client.bucket_exists(self.bucket):
                self._client.make_bucket(self.bucket)
                print(f"[MinIO] Bucket '{self.bucket}' created successfully.")
            else:
                print(f"[MinIO] Bucket '{self.bucket}' verified.")
            self._bucket_initialized = True
        except Exception as e:
            print(f"[MinIO] Notice while checking bucket '{self.bucket}': {e}")

    @staticmethod
    def _normalize_object_key(category: str, filename: str) -> str:
        """Construct normalized MinIO object key: e.g. 'source_pages/unicorn-story/page_01.png'."""
        clean_cat = category.strip("/\\")
        clean_fn = filename.strip("/\\").replace("\\", "/")
        if clean_fn.startswith(f"{clean_cat}/"):
            return clean_fn
        return f"{clean_cat}/{clean_fn}"

    @staticmethod
    def _get_content_type(filename_or_ext: str) -> str:
        guess, _ = mimetypes.guess_type(filename_or_ext)
        if guess:
            return guess
        suffix = Path(filename_or_ext).suffix.lower()
        mapping = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".pdf": "application/pdf",
            ".mp4": "video/mp4",
            ".webm": "video/webm",
            ".mov": "video/quicktime",
        }
        return mapping.get(suffix, "application/octet-stream")

    # --------------------------------------------------------------------------
    # Core MinIO Storage Operations
    # --------------------------------------------------------------------------

    async def save_upload_file(
        self,
        upload_file: UploadFile,
        category: str,
        allowed_extensions: Tuple[str, ...] = (".png", ".jpg", ".jpeg", ".pdf", ".webp", ".mp4", ".webm", ".mov")
    ) -> str:
        """
        Stream an uploaded file directly into MinIO object storage.
        Validates extension and image integrity before storing.
        Returns the MinIO object key (e.g. 'child_photos/abc1234.jpg').
        """
        ext = Path(upload_file.filename or "file.tmp").suffix.lower()
        if allowed_extensions and ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension {ext}. Allowed: {allowed_extensions}"
            )

        data = await upload_file.read()

        # Validate image integrity if it's an image
        if ext in (".png", ".jpg", ".jpeg", ".webp"):
            try:
                with Image.open(io.BytesIO(data)) as img:
                    img.verify()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Corrupted image file: {str(e)}")

        file_id = f"{uuid.uuid4().hex}{ext}"
        object_key = self._normalize_object_key(category, file_id)
        content_type = self._get_content_type(ext)

        self._ensure_bucket()
        self.client.put_object(
            bucket_name=self.bucket,
            object_name=object_key,
            data=io.BytesIO(data),
            length=len(data),
            content_type=content_type,
        )

        return object_key

    def save_bytes(
        self,
        data: bytes,
        category: str,
        extension: str = ".png",
        custom_name: Optional[str] = None
    ) -> str:
        """
        Store raw bytes (rendered illustration, preview image, CMYK plate) directly in MinIO.
        Returns the MinIO object key (e.g. 'source_pages/unicorn-story/page_01.png').
        """
        ext = extension if extension.startswith(".") else f".{extension}"
        name = custom_name or f"{uuid.uuid4().hex}{ext}"
        object_key = self._normalize_object_key(category, name)
        content_type = self._get_content_type(object_key)

        self._ensure_bucket()
        self.client.put_object(
            bucket_name=self.bucket,
            object_name=object_key,
            data=io.BytesIO(data),
            length=len(data),
            content_type=content_type,
        )

        return object_key

    def save_file(
        self,
        local_path: str | Path,
        category: str,
        object_name: Optional[str] = None
    ) -> str:
        """
        Upload an existing local file (e.g. ReportLab generated PDF) directly into MinIO.
        Returns the MinIO object key.
        """
        path_obj = Path(local_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"Local file not found to upload to MinIO: {local_path}")

        name = object_name or path_obj.name
        object_key = self._normalize_object_key(category, name)
        content_type = self._get_content_type(object_key)

        self._ensure_bucket()
        self.client.fput_object(
            bucket_name=self.bucket,
            object_name=object_key,
            file_path=str(path_obj),
            content_type=content_type,
        )

        return object_key

    def get_object_stream(self, category: str, filename: str) -> Tuple[Any, str, int]:
        """
        Retrieve an object stream directly from MinIO.
        Returns (stream_response, content_type, content_length).
        """
        object_key = self._normalize_object_key(category, filename)
        self._ensure_bucket()

        # Check MinIO existence
        try:
            stat = self.client.stat_object(self.bucket, object_key)
            obj = self.client.get_object(self.bucket, object_key)
            return obj, stat.content_type or self._get_content_type(object_key), stat.size
        except Exception:
            pass

        # Backwards compatibility check: if file exists on disk in legacy storage folder,
        # upload it to MinIO automatically on the fly and stream it!
        cand_path = self._find_legacy_file(category, filename)
        if cand_path and cand_path.exists():
            self.save_file(cand_path, category=category, object_name=filename)
            stat = self.client.stat_object(self.bucket, object_key)
            obj = self.client.get_object(self.bucket, object_key)
            return obj, stat.content_type or self._get_content_type(object_key), stat.size

        raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO storage")

    def get_bytes(self, object_key_or_path: str) -> bytes:
        """Fetch raw bytes of an object from MinIO."""
        category, filename = self._parse_category_and_filename(object_key_or_path)
        stream, _, _ = self.get_object_stream(category, filename)
        try:
            return stream.read()
        finally:
            stream.close()
            stream.release_conn()

    def get_file_path(self, category: str, filename: str) -> Path:
        """
        For operations where libraries require a local filesystem Path (e.g. ReportLab or OpenCV),
        fetches the object from MinIO and caches it in a temporary directory.
        Returns the local Path.
        """
        object_key = self._normalize_object_key(category, filename)
        cache_dest = self._temp_cache_dir / object_key
        cache_dest.parent.mkdir(parents=True, exist_ok=True)

        if not cache_dest.exists() or cache_dest.stat().st_size == 0:
            try:
                self._ensure_bucket()
                self.client.fget_object(self.bucket, object_key, str(cache_dest))
            except Exception:
                # Check legacy disk fallback
                legacy = self._find_legacy_file(category, filename)
                if legacy and legacy.exists():
                    self.save_file(legacy, category=category, object_name=filename)
                    return legacy
                raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in storage")

        return cache_dest

    def delete_file(self, category: str, filename: str) -> bool:
        """Delete an object from MinIO."""
        object_key = self._normalize_object_key(category, filename)
        try:
            self._ensure_bucket()
            self.client.remove_object(self.bucket, object_key)
            return True
        except Exception as e:
            print(f"[MinIO] Notice on remove_object '{object_key}': {e}")
            return False

    def file_exists(self, category: str, filename: str) -> bool:
        """Check if an object exists in MinIO."""
        object_key = self._normalize_object_key(category, filename)
        try:
            self.client.stat_object(self.bucket, object_key)
            return True
        except Exception:
            return False

    # --------------------------------------------------------------------------
    # URL & Path Helpers
    # --------------------------------------------------------------------------

    def get_public_url(self, abs_path_or_key: Optional[str]) -> Optional[str]:
        """
        Generate public web-accessible URL for an asset.
        Directs through backend streaming endpoint `/api/v1/storage/{category}/{filename}`
        or through `MINIO_PUBLIC_URL` if configured.
        """
        if not abs_path_or_key:
            return None
        if (
            abs_path_or_key.startswith("http://")
            or abs_path_or_key.startswith("https://")
            or abs_path_or_key.startswith("data:")
        ):
            return abs_path_or_key

        category, filename = self._parse_category_and_filename(abs_path_or_key)
        if not category or not filename:
            return abs_path_or_key

        if settings.MINIO_PUBLIC_URL:
            base = settings.MINIO_PUBLIC_URL.rstrip("/")
            return f"{base}/{category}/{filename}"

        return f"{settings.API_V1_PREFIX}/storage/{category}/{filename}"

    def resolve_path(self, path_str: Optional[str]) -> Optional[str]:
        """
        Resolves a path or MinIO key to a local file path (downloading to temp cache if needed)
        so that libraries requiring local files can access it.
        """
        if not path_str:
            return None
        if os.path.exists(path_str):
            return path_str

        category, filename = self._parse_category_and_filename(path_str)
        if category and filename:
            try:
                local_path = self.get_file_path(category, filename)
                return str(local_path)
            except Exception:
                pass
        return path_str

    def _parse_category_and_filename(self, path_or_key: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract category and relative filename from a path or object key."""
        clean = path_or_key.replace("\\", "/").strip("/")
        parts = clean.split("/")

        # Check for known category in parts
        for cat in self.CATEGORIES:
            if cat in parts:
                idx = parts.index(cat)
                subparts = parts[idx + 1:]
                if subparts:
                    return cat, "/".join(subparts)

        if len(parts) >= 2:
            return parts[0], "/".join(parts[1:])
        return None, None

    def _find_legacy_file(self, category: str, filename: str) -> Optional[Path]:
        """Check if file exists in legacy storage directory on disk."""
        legacy_dir = settings.STORAGE_DIR / category
        cand = (legacy_dir / filename).resolve()
        if cand.exists():
            return cand

        # Also check sample-assets
        sample_assets = settings.STORAGE_DIR.parent.parent / "sample-assets"
        sample_cand = sample_assets / filename
        if sample_cand.exists():
            return sample_cand

        return None

    def sync_local_to_minio(self):
        """
        Syncs any existing legacy files from `backend/storage/` and `sample-assets/`
        into the MinIO bucket.
        """
        self._ensure_bucket()
        storage_dir = settings.STORAGE_DIR
        if not storage_dir.exists():
            return

        synced = 0
        for cat in self.CATEGORIES:
            cat_dir = storage_dir / cat
            if not cat_dir.exists():
                continue
            for file_path in cat_dir.rglob("*"):
                if file_path.is_file():
                    rel = file_path.relative_to(cat_dir)
                    clean_rel = str(rel).replace("\\", "/")
                    object_key = f"{cat}/{clean_rel}"
                    try:
                        self.client.stat_object(self.bucket, object_key)
                    except Exception:
                        content_type = self._get_content_type(str(file_path))
                        self.client.fput_object(
                            self.bucket,
                            object_key,
                            str(file_path),
                            content_type=content_type
                        )
                        synced += 1

        if synced > 0:
            print(f"[MinIO] Successfully synced {synced} legacy files into MinIO bucket '{self.bucket}'.")


storage = StorageManager()
