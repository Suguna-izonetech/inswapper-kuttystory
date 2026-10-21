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
        """Ensure the MinIO bucket exists; create it and configure public read policy if missing."""
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

            # Ensure bucket has public-read policy so images can be fetched directly from MinIO
            try:
                import json
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": ["*"]},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{self.bucket}/*"]
                        }
                    ]
                }
                self._client.set_bucket_policy(self.bucket, json.dumps(policy))
            except Exception as pe:
                print(f"[MinIO] Notice configuring bucket policy: {pe}")

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

        try:
            stat = self.client.stat_object(self.bucket, object_key)
            obj = self.client.get_object(self.bucket, object_key)
            return obj, stat.content_type or self._get_content_type(object_key), stat.size
        except Exception as e:
            # If not in MinIO, check if we need to sync from sample-assets or local storage
            cand_path = self._find_legacy_file(category, filename)
            if cand_path and cand_path.exists():
                self.save_file(cand_path, category=category, object_name=filename)
                stat = self.client.stat_object(self.bucket, object_key)
                obj = self.client.get_object(self.bucket, object_key)
                return obj, stat.content_type or self._get_content_type(object_key), stat.size
            raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO storage: {e}")

    def get_bytes(self, object_key_or_path: str) -> bytes:
        """Fetch raw bytes of an object directly from MinIO."""
        category, filename = self._parse_category_and_filename(object_key_or_path)
        if not category or not filename:
            raise HTTPException(status_code=404, detail=f"Invalid storage path or key: {object_key_or_path}")
        stream, _, _ = self.get_object_stream(category, filename)
        try:
            return stream.read()
        finally:
            stream.close()
            stream.release_conn()

    def get_file_path(self, category: str, filename: str) -> Path:
        """
        For operations where libraries require a local filesystem Path (e.g. ReportLab or OpenCV),
        fetches the object from MinIO and caches it in a temporary cache directory.
        Returns the local Path.
        """
        object_key = self._normalize_object_key(category, filename)
        cache_dest = self._temp_cache_dir / object_key
        cache_dest.parent.mkdir(parents=True, exist_ok=True)

        if not cache_dest.exists() or cache_dest.stat().st_size == 0:
            self._ensure_bucket()
            try:
                self.client.fget_object(self.bucket, object_key, str(cache_dest))
            except Exception as e:
                # One-time sync from local if object was missing in MinIO
                legacy = self._find_legacy_file(category, filename)
                if legacy and legacy.exists():
                    self.save_file(legacy, category=category, object_name=filename)
                    self.client.fget_object(self.bucket, object_key, str(cache_dest))
                else:
                    raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO storage: {e}")

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

    @property
    def dynamic_minio_base_url(self) -> str:
        """
        Dynamically generate the MinIO base URL strictly from MINIO_ENDPOINT, MINIO_BUCKET, and MINIO_SECURE from .env.
        Supports both raw hostnames (e.g. minio.risingsuntech.in or 127.0.0.1:9000)
        and full URLs (e.g. https://minio.risingsuntech.in).
        """
        if settings.MINIO_PUBLIC_URL:
            return settings.MINIO_PUBLIC_URL.rstrip("/")

        raw_endpoint = (settings.MINIO_ENDPOINT or "127.0.0.1:9000").strip()
        protocol = "https" if settings.MINIO_SECURE else "http"

        if raw_endpoint.startswith("https://"):
            protocol = "https"
            endpoint = raw_endpoint.replace("https://", "", 1).rstrip("/")
        elif raw_endpoint.startswith("http://"):
            protocol = "http"
            endpoint = raw_endpoint.replace("http://", "", 1).rstrip("/")
        else:
            endpoint = raw_endpoint.rstrip("/")

        bucket = (settings.MINIO_BUCKET or "kuttystory").strip("/")
        return f"{protocol}://{endpoint}/{bucket}"

    def get_public_url(self, abs_path_or_key: Optional[str]) -> Optional[str]:
        """
        Generate public web-accessible URL for an asset.
        Dynamically constructs the link using MINIO_ENDPOINT and MINIO_BUCKET from .env.
        Example: http://127.0.0.1:9000/kuttystory/source_pages/unicorn-story/page_01.png
        """
        if not abs_path_or_key:
            return None

        # Data and blob URLs are returned as-is
        if abs_path_or_key.startswith("data:") or abs_path_or_key.startswith("blob:"):
            return abs_path_or_key

        base = self.dynamic_minio_base_url

        # If it's already a direct MinIO URL matching our base URL, return as-is
        if abs_path_or_key.startswith(f"{base}/"):
            return abs_path_or_key

        category, filename = self._parse_category_and_filename(abs_path_or_key)
        if not category or not filename:
            # If unable to parse category but it is already a full external URL, return as-is
            if abs_path_or_key.startswith("http://") or abs_path_or_key.startswith("https://"):
                return abs_path_or_key
            return abs_path_or_key

        return f"{base}/{category}/{filename}"

    def resolve_path(self, path_str: Optional[str]) -> Optional[str]:
        """
        Resolves a MinIO object key or legacy path to a local temporary cached file path.
        MinIO is strictly the source of truth for all storage.
        """
        if not path_str:
            return None

        # If already a cached file, return it
        try:
            p_obj = Path(path_str)
            if str(self._temp_cache_dir) in str(p_obj) and p_obj.exists() and p_obj.stat().st_size > 0:
                return str(p_obj)
        except Exception:
            pass

        # Try resolving from MinIO by category/filename
        category, filename = self._parse_category_and_filename(path_str)
        if category and filename:
            try:
                local_path = self.get_file_path(category, filename)
                return str(local_path)
            except Exception:
                pass

        # If outside of legacy storage (e.g. system font or temporary file), return as is if exists
        if os.path.exists(path_str) and "storage" not in str(path_str).lower():
            return path_str

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
        """Check if file exists in legacy storage directory on disk or sample-assets."""
        legacy_dir = settings.STORAGE_DIR / category
        cand = (legacy_dir / filename).resolve()
        if cand.exists():
            return cand

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

    def migrate_database_to_minio_keys(self, db):
        """
        Normalize all database image/file paths to clean MinIO object keys (e.g. 'source_pages/...').
        Eliminates all local file paths from the database.
        """
        try:
            from app.models import StoryTemplate, StoryPage, GeneratedAsset, ChildProfile, PersonalizationJob, Book

            def normalize_to_key(val: Optional[str]) -> Optional[str]:
                if not val:
                    return val
                cat, fn = self._parse_category_and_filename(val)
                if cat and fn:
                    return f"{cat}/{fn}"
                return val

            updated = 0
            # 1. StoryTemplate
            for story in db.query(StoryTemplate).all():
                new_cover = normalize_to_key(story.cover_image_path)
                new_pdf = normalize_to_key(story.source_pdf_path)
                if new_cover != story.cover_image_path or new_pdf != story.source_pdf_path:
                    story.cover_image_path = new_cover
                    story.source_pdf_path = new_pdf
                    updated += 1

            # 2. StoryPage
            for page in db.query(StoryPage).all():
                new_img = normalize_to_key(page.original_image_path)
                if new_img != page.original_image_path:
                    page.original_image_path = new_img
                    updated += 1

            # 3. GeneratedAsset
            for asset in db.query(GeneratedAsset).all():
                new_storage = normalize_to_key(asset.storage_path)
                if new_storage != asset.storage_path:
                    asset.storage_path = new_storage
                    updated += 1

            # 4. ChildProfile
            for cp in db.query(ChildProfile).all():
                new_photo = normalize_to_key(cp.photo_storage_path)
                if new_photo != cp.photo_storage_path:
                    cp.photo_storage_path = new_photo
                    updated += 1

            # 5. PersonalizationJob
            for job in db.query(PersonalizationJob).all():
                new_photo = normalize_to_key(job.photo_path)
                if new_photo != job.photo_path:
                    job.photo_path = new_photo
                    updated += 1

            # 6. Book
            for book in db.query(Book).all():
                new_pdf = normalize_to_key(book.pdf_storage_path)
                if new_pdf != book.pdf_storage_path:
                    book.pdf_storage_path = new_pdf
                    updated += 1

            if updated > 0:
                db.commit()
                print(f"[MinIO] Normalized {updated} database records to pure MinIO object keys.")
        except Exception as e:
            print(f"[MinIO] Notice during database key migration: {e}")


storage = StorageManager()
