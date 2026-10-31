"""
MinIO Object Storage Service for Kutty Story Application.

All uploaded PDFs, extracted story pages, images, and generated assets
are stored exclusively in MinIO object storage. Local filesystem storage
and /tmp/kuttystory_cache fallback logic have been completely removed.
"""

import io
import os
import json
import mimetypes
import uuid
from pathlib import Path
from typing import Optional, Tuple, Any
from fastapi import UploadFile, HTTPException
from PIL import Image
import numpy as np
import cv2
from minio import Minio
from minio.error import S3Error

from app.config import settings


class StorageManager:
    """
    MinIO Object Storage Manager.
    All files are stored exclusively in the configured MinIO bucket.
    """

    CATEGORIES = {
        "original_pdfs",
        "source_pages",
        "child_photos",
        "generated_assets",
        "raw_generated",
        "generated_originals",
        "previews",
        "final_books",
        "feedback_media",
        "cache_cmyk",
    }

    def __init__(self):
        self.bucket = settings.MINIO_BUCKET or "kuttystory"
        self._client: Optional[Minio] = None
        self._bucket_initialized = False

    def _init_minio_client(self):
        """Initialize MinIO client from application settings."""
        raw_endpoint = (settings.MINIO_ENDPOINT or "127.0.0.1:9000").strip()
        secure = settings.MINIO_SECURE

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
        except Exception as e:
            print(f"[MinIO] Error initializing client for endpoint '{endpoint}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to MinIO object storage: {str(e)}"
            )

    @property
    def client(self) -> Minio:
        """Returns active MinIO client, initializing if necessary."""
        if self._client is None:
            self._init_minio_client()
        return self._client

    def _ensure_bucket(self):
        """Ensure the MinIO bucket exists and set public read policy for GET."""
        if self._bucket_initialized:
            return

        client = self.client
        try:
            if not client.bucket_exists(self.bucket):
                client.make_bucket(self.bucket)
                print(f"[MinIO] Bucket '{self.bucket}' created successfully.")
            else:
                print(f"[MinIO] Bucket '{self.bucket}' verified.")

            # Configure public read policy so browser can load assets directly
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
            try:
                client.set_bucket_policy(self.bucket, json.dumps(policy))
            except Exception as pe:
                print(f"[MinIO] Notice configuring bucket policy: {pe}")

            self._bucket_initialized = True
        except S3Error as e:
            print(f"[MinIO] S3 error ensuring bucket '{self.bucket}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO bucket error for '{self.bucket}': {str(e)}"
            )
        except Exception as e:
            print(f"[MinIO] Error ensuring bucket '{self.bucket}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO storage error: {str(e)}"
            )

    @staticmethod
    def _normalize_object_key(category: str, filename: str) -> str:
        """Construct normalized object key: e.g. 'source_pages/unicorn-story/page_01.png'."""
        clean_cat = category.strip("/\\")
        clean_fn = filename.strip("/\\").replace("\\", "/")
        if clean_fn.startswith(f"{clean_cat}/"):
            return clean_fn
        return f"{clean_cat}/{clean_fn}"

    @staticmethod
    def _get_content_type(filename_or_ext: str) -> str:
        """Detect accurate MIME content type for storage objects."""
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
    # Core MinIO Storage Operations (Exclusively MinIO, No Local Storage Writes)
    # --------------------------------------------------------------------------

    async def save_upload_file(
        self,
        upload_file: UploadFile,
        category: str,
        allowed_extensions: Tuple[str, ...] = (".png", ".jpg", ".jpeg", ".pdf", ".webp", ".mp4", ".webm", ".mov")
    ) -> str:
        """
        Store an uploaded file directly into MinIO object storage.
        Validates extension and image integrity in-memory before storing.
        Returns normalized MinIO object key (e.g. 'child_photos/abc1234.jpg').
        """
        ext = Path(upload_file.filename or "file.tmp").suffix.lower()
        if allowed_extensions and ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension {ext}. Allowed: {allowed_extensions}"
            )

        data = await upload_file.read()

        # Validate image data integrity in memory
        if ext in (".png", ".jpg", ".jpeg", ".webp"):
            try:
                with Image.open(io.BytesIO(data)) as img:
                    img.verify()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Corrupted image file: {str(e)}")

        file_id = f"{uuid.uuid4().hex}{ext}"
        object_key = self._normalize_object_key(category, file_id)

        try:
            self._ensure_bucket()
            content_type = self._get_content_type(ext)
            self.client.put_object(
                bucket_name=self.bucket,
                object_name=object_key,
                data=io.BytesIO(data),
                length=len(data),
                content_type=content_type,
            )
            return object_key
        except HTTPException:
            raise
        except S3Error as e:
            print(f"[MinIO] S3 error putting object '{object_key}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO storage error uploading '{object_key}': {str(e)}"
            )
        except Exception as e:
            print(f"[MinIO] Failed to upload '{object_key}' to MinIO: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO upload error for '{object_key}': {str(e)}"
            )

    def save_raw_original(
        self,
        data: Any,
        custom_name: str,
        extension: str = ".png",
        save_local: bool = False
    ) -> Tuple[str, Optional[Path]]:
        """
        Store pristine original AI-generated image or base illustration BEFORE face swapping
        or image enhancement directly into MinIO ('raw_generated' category).
        No local filesystem storage is used.
        
        Returns:
            Tuple[str, Optional[Path]]: (minio_object_key, None)
        """
        raw_bytes: bytes
        if isinstance(data, (bytes, bytearray)):
            raw_bytes = bytes(data)
        elif isinstance(data, Image.Image):
            buf = io.BytesIO()
            ext_fmt = "PNG" if extension.lower() in (".png", "png") else "JPEG"
            data.save(buf, format=ext_fmt)
            raw_bytes = buf.getvalue()
        elif isinstance(data, np.ndarray):
            import cv2
            ext = extension if extension.startswith(".") else f".{extension}"
            success, enc = cv2.imencode(ext, data)
            if not success:
                raise ValueError(f"Could not encode numpy array to {ext}")
            raw_bytes = enc.tobytes()
        else:
            raise TypeError(f"Unsupported data type for save_raw_original: {type(data)}")

        clean_name = custom_name.replace("\\", "/").lstrip("/")
        minio_key = self.save_bytes(
            data=raw_bytes,
            category="raw_generated",
            extension=extension,
            custom_name=clean_name
        )

        return minio_key, None

    def save_bytes(
        self,
        data: bytes,
        category: str,
        extension: str = ".png",
        custom_name: Optional[str] = None
    ) -> str:
        """
        Store raw bytes directly into MinIO object storage.
        Returns normalized MinIO object key (e.g. 'source_pages/unicorn-story/page_01.png').
        """
        ext = extension if extension.startswith(".") else f".{extension}"
        name = custom_name or f"{uuid.uuid4().hex}{ext}"
        object_key = self._normalize_object_key(category, name)

        try:
            self._ensure_bucket()
            content_type = self._get_content_type(object_key)
            self.client.put_object(
                bucket_name=self.bucket,
                object_name=object_key,
                data=io.BytesIO(data),
                length=len(data),
                content_type=content_type,
            )
            return object_key
        except HTTPException:
            raise
        except S3Error as e:
            print(f"[MinIO] S3 error saving bytes to '{object_key}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO storage error saving bytes to '{object_key}': {str(e)}"
            )
        except Exception as e:
            print(f"[MinIO] Failed to put bytes for '{object_key}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO storage error for '{object_key}': {str(e)}"
            )

    def save_file(
        self,
        local_path: str | Path,
        category: str,
        object_name: Optional[str] = None
    ) -> str:
        """
        Upload a file directly into MinIO object storage.
        Returns the normalized MinIO object key.
        """
        path_obj = Path(local_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"Source file not found to upload: {local_path}")

        name = object_name or path_obj.name
        object_key = self._normalize_object_key(category, name)

        try:
            self._ensure_bucket()
            content_type = self._get_content_type(object_key)
            self.client.fput_object(
                bucket_name=self.bucket,
                object_name=object_key,
                file_path=str(path_obj),
                content_type=content_type,
            )
            return object_key
        except HTTPException:
            raise
        except S3Error as e:
            print(f"[MinIO] S3 error saving file '{object_key}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO storage error saving file '{object_key}': {str(e)}"
            )
        except Exception as e:
            print(f"[MinIO] Failed to save file '{object_key}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"MinIO error uploading file '{object_key}': {str(e)}"
            )

    def get_object_stream(self, category: str, filename: str) -> Tuple[Any, str, int]:
        """
        Retrieve an object stream directly from MinIO.
        Returns (stream_response, content_type, content_length).
        """
        object_key = self._normalize_object_key(category, filename)

        try:
            self._ensure_bucket()
            stat = self.client.stat_object(self.bucket, object_key)
            obj = self.client.get_object(self.bucket, object_key)
            content_type = stat.content_type or self._get_content_type(object_key)
            return obj, content_type, stat.size
        except S3Error as e:
            if e.code in ("NoSuchKey", "NoSuchBucket"):
                raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO storage.")
            raise HTTPException(status_code=500, detail=f"MinIO storage error for '{object_key}': {str(e)}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO storage: {str(e)}")

    def get_bytes(self, object_key_or_path: str) -> bytes:
        """Fetch raw bytes of an object directly from MinIO."""
        category, filename = self._parse_category_and_filename(object_key_or_path)
        if category and filename:
            object_key = self._normalize_object_key(category, filename)
        else:
            object_key = object_key_or_path.replace("\\", "/").strip("/")

        try:
            self._ensure_bucket()
            resp = self.client.get_object(self.bucket, object_key)
            try:
                return resp.read()
            finally:
                resp.close()
                resp.release_conn()
        except S3Error as e:
            if e.code in ("NoSuchKey", "NoSuchBucket"):
                raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO storage.")
            raise HTTPException(status_code=500, detail=f"MinIO storage error for '{object_key}': {str(e)}")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO storage: {str(e)}")

    def get_file_path(self, category: str, filename: str) -> Path:
        """Returns normalized Path for object key reference."""
        object_key = self._normalize_object_key(category, filename)
        return Path(object_key)

    def delete_file(self, category: str, filename: str) -> bool:
        """Delete an object directly from MinIO."""
        object_key = self._normalize_object_key(category, filename)
        try:
            self._ensure_bucket()
            self.client.remove_object(self.bucket, object_key)
            return True
        except Exception as e:
            print(f"[MinIO] Failed to remove object '{object_key}': {e}")
            return False

    def file_exists(self, category: str, filename: str) -> bool:
        """Check if an object exists in MinIO."""
        object_key = self._normalize_object_key(category, filename)
        try:
            self._ensure_bucket()
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
        Dynamically generate the MinIO base URL strictly from MINIO_ENDPOINT, MINIO_BUCKET, and MINIO_SECURE from settings.
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
        Generate public web-accessible URL for an asset stored in MinIO.
        Returns the MinIO public URL or direct MinIO bucket URL.
        """
        if not abs_path_or_key:
            return None

        # Data and blob URLs are returned as-is
        if abs_path_or_key.startswith("data:") or abs_path_or_key.startswith("blob:"):
            return abs_path_or_key

        if abs_path_or_key.startswith("http://") or abs_path_or_key.startswith("https://"):
            return abs_path_or_key

        category, filename = self._parse_category_and_filename(abs_path_or_key)
        if not category or not filename:
            clean_key = abs_path_or_key.replace("\\", "/").strip("/")
            base = settings.MINIO_PUBLIC_URL.rstrip("/") if settings.MINIO_PUBLIC_URL else self.dynamic_minio_base_url
            return f"{base}/{clean_key}"

        object_key = self._normalize_object_key(category, filename)
        if settings.MINIO_PUBLIC_URL:
            return f"{settings.MINIO_PUBLIC_URL.rstrip('/')}/{object_key}"

        base = self.dynamic_minio_base_url
        return f"{base}/{object_key}"

    def resolve_path(self, path_str: Optional[str]) -> Optional[str]:
        """
        Returns path_str directly (either existing file path on disk or MinIO object key).
        """
        if not path_str:
            return None

        try:
            p_obj = Path(path_str)
            if p_obj.exists() and p_obj.is_file():
                return str(p_obj)
        except Exception:
            pass

        return path_str

    def _parse_category_and_filename(self, path_or_key: str) -> Tuple[Optional[str], Optional[str]]:
        """Extract category and relative filename from a path or object key."""
        clean = path_or_key.replace("\\", "/").strip("/")
        parts = clean.split("/")

        for cat in self.CATEGORIES:
            if cat in parts:
                idx = parts.index(cat)
                subparts = parts[idx + 1:]
                if subparts:
                    return cat, "/".join(subparts)

        if len(parts) >= 2:
            return parts[0], "/".join(parts[1:])
        return None, None

    def sync_local_to_minio(self):
        """
        Ensure MinIO bucket exists and is properly initialized.
        Local filesystem storage is not used.
        """
        try:
            self._ensure_bucket()
        except Exception as e:
            print(f"[Storage] Notice: MinIO not available during initialization check ({e}).")

    def migrate_database_to_minio_keys(self, db):
        """
        Normalize all database image/file paths to clean category/filename keys.
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
            for story in db.query(StoryTemplate).all():
                new_cover = normalize_to_key(story.cover_image_path)
                new_pdf = normalize_to_key(story.source_pdf_path)
                if new_cover != story.cover_image_path or new_pdf != story.source_pdf_path:
                    story.cover_image_path = new_cover
                    story.source_pdf_path = new_pdf
                    updated += 1

            for page in db.query(StoryPage).all():
                new_img = normalize_to_key(page.original_image_path)
                if new_img != page.original_image_path:
                    page.original_image_path = new_img
                    updated += 1

            for asset in db.query(GeneratedAsset).all():
                new_storage = normalize_to_key(asset.storage_path)
                if new_storage != asset.storage_path:
                    asset.storage_path = new_storage
                    updated += 1

            for cp in db.query(ChildProfile).all():
                new_photo = normalize_to_key(cp.photo_storage_path)
                if new_photo != cp.photo_storage_path:
                    cp.photo_storage_path = new_photo
                    updated += 1

            for job in db.query(PersonalizationJob).all():
                new_photo = normalize_to_key(job.photo_path)
                if new_photo != job.photo_path:
                    job.photo_path = new_photo
                    updated += 1

            for book in db.query(Book).all():
                new_pdf = normalize_to_key(book.pdf_storage_path)
                if new_pdf != book.pdf_storage_path:
                    book.pdf_storage_path = new_pdf
                    updated += 1

            if updated > 0:
                db.commit()
                print(f"[Storage] Normalized {updated} database records to clean object keys.")
        except Exception as e:
            print(f"[Storage] Notice during database key migration: {e}")


storage = StorageManager()
