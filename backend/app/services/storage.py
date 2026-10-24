"""
MinIO Object Storage & Local Filesystem Storage Service for Kutty Story Application.

Features:
- Primary support for MinIO object storage when available.
- Seamless automatic fallback to local disk storage (backend/storage/) when MinIO is offline.
- Provides streaming file access, presigned/direct URLs, and local path resolution.
- Dynamic socket check prevents connection hangs or crashes during local development.
"""

import io
import os
import mimetypes
import tempfile
import uuid
import shutil
import socket
from pathlib import Path
from typing import Optional, Tuple, Any
from fastapi import UploadFile, HTTPException
from PIL import Image
from minio import Minio
from minio.error import S3Error

from app.config import settings


class LocalFileStream:
    """
    File stream wrapper compatible with MinIO's HTTPResponse object.
    Provides stream(), read(), close(), and release_conn() methods.
    """
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._f = open(file_path, "rb")

    def stream(self, amt: int = 32768):
        try:
            while True:
                chunk = self._f.read(amt)
                if not chunk:
                    break
                yield chunk
        finally:
            self.close()

    def read(self, amt: int = -1) -> bytes:
        return self._f.read(amt)

    def close(self):
        try:
            if not self._f.closed:
                self._f.close()
        except Exception:
            pass

    def release_conn(self):
        self.close()


class StorageManager:
    """
    Object Storage Manager with dual support:
    - MinIO S3-compatible Object Storage when MinIO service is active.
    - Automatic local disk storage fallback (backend/storage/) when MinIO is offline.
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
        self._minio_available: Optional[bool] = None

        # Safely ensure local storage directories exist without crashing on restricted permissions
        for cat in self.CATEGORIES:
            try:
                (settings.STORAGE_DIR / cat).mkdir(parents=True, exist_ok=True)
            except Exception as e:
                print(f"[Storage] Notice: Could not create folder '{cat}' in storage dir ({e}). Will use fallback cache when needed.")

    def _is_minio_reachable(self) -> bool:
        """Fast check to determine if MinIO server is listening on the configured endpoint."""
        if getattr(settings, "STORAGE_BACKEND", "minio") == "local":
            return False
        if self._minio_available is not None:
            return self._minio_available

        raw_endpoint = (settings.MINIO_ENDPOINT or "127.0.0.1:9000").strip()
        host_port = raw_endpoint.replace("https://", "").replace("http://", "").split("/")[0]
        if ":" in host_port:
            host, port_str = host_port.split(":", 1)
            try:
                port = int(port_str)
            except ValueError:
                port = 9000
        else:
            host = host_port
            port = 443 if settings.MINIO_SECURE else 80

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)
        try:
            sock.connect((host, port))
            sock.close()
            self._minio_available = True
            print(f"[Storage] MinIO server connected at {host}:{port}.")
            return True
        except Exception as e:
            self._minio_available = False
            print(f"[Storage] MinIO not reachable at {host}:{port} ({e}). Serving assets from local disk ({settings.STORAGE_DIR}).")
            return False

    @property
    def client(self) -> Optional[Minio]:
        if not self._is_minio_reachable():
            return None
        if self._client is None:
            self._init_minio_client()
        return self._client

    def _init_minio_client(self):
        """Initialize MinIO client and ensure bucket exists."""
        if not self._is_minio_reachable():
            return
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
            self._ensure_bucket()
        except Exception as e:
            print(f"[MinIO] Notice during client initialization ({endpoint}): {e}")

    def _ensure_bucket(self):
        """Ensure the MinIO bucket exists; create it and configure public read policy if missing."""
        if self._bucket_initialized or not self._is_minio_reachable() or self._client is None:
            return
        try:
            if not self._client.bucket_exists(self.bucket):
                self._client.make_bucket(self.bucket)
                print(f"[MinIO] Bucket '{self.bucket}' created successfully.")
            else:
                print(f"[MinIO] Bucket '{self.bucket}' verified.")

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
        """Construct normalized object key: e.g. 'source_pages/unicorn-story/page_01.png'."""
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
    # Core Storage Operations
    # --------------------------------------------------------------------------

    async def save_upload_file(
        self,
        upload_file: UploadFile,
        category: str,
        allowed_extensions: Tuple[str, ...] = (".png", ".jpg", ".jpeg", ".pdf", ".webp", ".mp4", ".webm", ".mov")
    ) -> str:
        """
        Store an uploaded file into storage (local disk and MinIO if available).
        Validates extension and image integrity before storing.
        Returns normalized object key (e.g. 'child_photos/abc1234.jpg').
        """
        ext = Path(upload_file.filename or "file.tmp").suffix.lower()
        if allowed_extensions and ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension {ext}. Allowed: {allowed_extensions}"
            )

        data = await upload_file.read()

        if ext in (".png", ".jpg", ".jpeg", ".webp"):
            try:
                with Image.open(io.BytesIO(data)) as img:
                    img.verify()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Corrupted image file: {str(e)}")

        file_id = f"{uuid.uuid4().hex}{ext}"
        object_key = self._normalize_object_key(category, file_id)

        # 1. Save to local storage
        local_dest = settings.STORAGE_DIR / object_key
        try:
            local_dest.parent.mkdir(parents=True, exist_ok=True)
            local_dest.write_bytes(data)
        except Exception as e:
            fallback = self._temp_cache_dir / object_key
            fallback.parent.mkdir(parents=True, exist_ok=True)
            fallback.write_bytes(data)
            print(f"[Storage] Notice: Could not write {object_key} to storage dir ({e}), saved to cache.")

        # 2. Upload to MinIO if available
        if self._is_minio_reachable() and self.client:
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
            except Exception as e:
                print(f"[Storage] Warning: Failed to put {object_key} to MinIO ({e}). Saved locally.")

        return object_key

    def save_bytes(
        self,
        data: bytes,
        category: str,
        extension: str = ".png",
        custom_name: Optional[str] = None
    ) -> str:
        """
        Store raw bytes into storage (local disk and MinIO if available).
        Returns normalized object key (e.g. 'source_pages/unicorn-story/page_01.png').
        """
        ext = extension if extension.startswith(".") else f".{extension}"
        name = custom_name or f"{uuid.uuid4().hex}{ext}"
        object_key = self._normalize_object_key(category, name)

        # 1. Save to local storage
        local_dest = settings.STORAGE_DIR / object_key
        try:
            local_dest.parent.mkdir(parents=True, exist_ok=True)
            local_dest.write_bytes(data)
        except Exception as e:
            fallback = self._temp_cache_dir / object_key
            fallback.parent.mkdir(parents=True, exist_ok=True)
            fallback.write_bytes(data)
            print(f"[Storage] Notice: Could not write bytes {object_key} to storage dir ({e}), saved to cache.")

        # 2. Upload to MinIO if available
        if self._is_minio_reachable() and self.client:
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
            except Exception as e:
                print(f"[Storage] Warning: Failed to put bytes {object_key} to MinIO ({e}). Saved locally.")

        return object_key

    def save_file(
        self,
        local_path: str | Path,
        category: str,
        object_name: Optional[str] = None
    ) -> str:
        """
        Save an existing file into storage (local disk and MinIO if available).
        Returns the normalized object key.
        """
        path_obj = Path(local_path)
        if not path_obj.exists():
            raise FileNotFoundError(f"Local file not found to upload: {local_path}")

        name = object_name or path_obj.name
        object_key = self._normalize_object_key(category, name)

        # 1. Save to local storage directory
        local_dest = settings.STORAGE_DIR / object_key
        try:
            if local_dest.resolve() != path_obj.resolve():
                local_dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path_obj, local_dest)
        except Exception as e:
            fallback = self._temp_cache_dir / object_key
            fallback.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path_obj, fallback)
            print(f"[Storage] Notice: Could not copy {object_key} to storage dir ({e}), copied to cache.")

        # 2. Upload to MinIO if available
        if self._is_minio_reachable() and self.client:
            try:
                self._ensure_bucket()
                content_type = self._get_content_type(object_key)
                self.client.fput_object(
                    bucket_name=self.bucket,
                    object_name=object_key,
                    file_path=str(path_obj),
                    content_type=content_type,
                )
            except Exception as e:
                print(f"[Storage] Warning: Failed to put file {object_key} to MinIO ({e}). Saved locally.")

        return object_key

    def get_object_stream(self, category: str, filename: str) -> Tuple[Any, str, int]:
        """
        Retrieve an object stream directly from MinIO or fallback to local disk.
        Returns (stream_response, content_type, content_length).
        """
        object_key = self._normalize_object_key(category, filename)

        # 1. Try MinIO if available
        if self._is_minio_reachable() and self.client:
            try:
                self._ensure_bucket()
                stat = self.client.stat_object(self.bucket, object_key)
                obj = self.client.get_object(self.bucket, object_key)
                return obj, stat.content_type or self._get_content_type(object_key), stat.size
            except Exception:
                pass

        # 2. Try local storage file
        local_dest = settings.STORAGE_DIR / object_key
        if local_dest.exists() and local_dest.is_file():
            content_type = self._get_content_type(str(local_dest))
            return LocalFileStream(local_dest), content_type, local_dest.stat().st_size

        # 3. Check legacy or sample assets
        cand_path = self._find_legacy_file(category, filename)
        if cand_path and cand_path.exists() and cand_path.is_file():
            content_type = self._get_content_type(str(cand_path))
            return LocalFileStream(cand_path), content_type, cand_path.stat().st_size

        # 4. Check cache dir
        cache_dest = self._temp_cache_dir / object_key
        if cache_dest.exists() and cache_dest.is_file():
            content_type = self._get_content_type(str(cache_dest))
            return LocalFileStream(cache_dest), content_type, cache_dest.stat().st_size

        raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in storage.")

    def get_bytes(self, object_key_or_path: str) -> bytes:
        """Fetch raw bytes of an object directly from local disk or MinIO."""
        category, filename = self._parse_category_and_filename(object_key_or_path)
        if not category or not filename:
            p = Path(object_key_or_path)
            if p.exists() and p.is_file():
                return p.read_bytes()
            raise HTTPException(status_code=404, detail=f"Invalid storage path or key: {object_key_or_path}")

        object_key = self._normalize_object_key(category, filename)

        # 1. Check local disk first (fastest)
        local_dest = settings.STORAGE_DIR / object_key
        if local_dest.exists() and local_dest.is_file():
            return local_dest.read_bytes()

        cand = self._find_legacy_file(category, filename)
        if cand and cand.exists() and cand.is_file():
            return cand.read_bytes()

        # 2. Try MinIO if available
        if self._is_minio_reachable() and self.client:
            try:
                stream, _, _ = self.get_object_stream(category, filename)
                try:
                    return stream.read()
                finally:
                    stream.close()
                    stream.release_conn()
            except Exception:
                pass

        raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in storage.")

    def get_file_path(self, category: str, filename: str) -> Path:
        """
        Returns a local filesystem Path (for libraries like ReportLab or OpenCV).
        """
        object_key = self._normalize_object_key(category, filename)

        # 1. Local storage dir
        local_dest = settings.STORAGE_DIR / object_key
        if local_dest.exists() and local_dest.is_file():
            return local_dest

        # 2. Legacy / sample assets
        legacy = self._find_legacy_file(category, filename)
        if legacy and legacy.exists() and legacy.is_file():
            return legacy

        # 3. Cache directory
        cache_dest = self._temp_cache_dir / object_key
        if cache_dest.exists() and cache_dest.is_file() and cache_dest.stat().st_size > 0:
            return cache_dest

        # 4. If MinIO reachable, download to cache
        if self._is_minio_reachable() and self.client:
            cache_dest.parent.mkdir(parents=True, exist_ok=True)
            try:
                self._ensure_bucket()
                self.client.fget_object(self.bucket, object_key, str(cache_dest))
                return cache_dest
            except Exception as e:
                raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in MinIO: {e}")

        raise HTTPException(status_code=404, detail=f"File '{object_key}' not found in storage.")

    def delete_file(self, category: str, filename: str) -> bool:
        """Delete an object from local disk and MinIO."""
        object_key = self._normalize_object_key(category, filename)
        deleted = False

        local_dest = settings.STORAGE_DIR / object_key
        if local_dest.exists():
            try:
                local_dest.unlink()
                deleted = True
            except Exception:
                pass

        if self._is_minio_reachable() and self.client:
            try:
                self._ensure_bucket()
                self.client.remove_object(self.bucket, object_key)
                deleted = True
            except Exception as e:
                print(f"[MinIO] Notice on remove_object '{object_key}': {e}")

        return deleted

    def file_exists(self, category: str, filename: str) -> bool:
        """Check if an object exists in storage."""
        object_key = self._normalize_object_key(category, filename)
        local_dest = settings.STORAGE_DIR / object_key
        if local_dest.exists() and local_dest.is_file():
            return True

        legacy = self._find_legacy_file(category, filename)
        if legacy and legacy.exists():
            return True

        if self._is_minio_reachable() and self.client:
            try:
                self.client.stat_object(self.bucket, object_key)
                return True
            except Exception:
                pass

        return False

    # --------------------------------------------------------------------------
    # URL & Path Helpers
    # --------------------------------------------------------------------------

    @property
    def dynamic_minio_base_url(self) -> str:
        """
        Dynamically generate the MinIO base URL strictly from MINIO_ENDPOINT, MINIO_BUCKET, and MINIO_SECURE from .env.
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
        - When MinIO is online, returns MinIO public URL.
        - When MinIO is offline, returns FastAPI storage URL (/storage/{category}/{filename})
          which is resolved to http://127.0.0.1:8000/storage/... by frontend.
        """
        if not abs_path_or_key:
            return None

        # Data and blob URLs are returned as-is
        if abs_path_or_key.startswith("data:") or abs_path_or_key.startswith("blob:"):
            return abs_path_or_key

        category, filename = self._parse_category_and_filename(abs_path_or_key)
        if not category or not filename:
            if abs_path_or_key.startswith("http://") or abs_path_or_key.startswith("https://"):
                return abs_path_or_key
            return abs_path_or_key

        # If MinIO is reachable, return the MinIO URL
        if self._is_minio_reachable():
            if settings.MINIO_PUBLIC_URL:
                return f"{settings.MINIO_PUBLIC_URL.rstrip('/')}/{category}/{filename}"
            base = self.dynamic_minio_base_url
            if abs_path_or_key.startswith(f"{base}/"):
                return abs_path_or_key
            return f"{base}/{category}/{filename}"

        # Otherwise, return local FastAPI storage proxy URL
        return f"/storage/{category}/{filename}"

    def resolve_path(self, path_str: Optional[str]) -> Optional[str]:
        """
        Resolves an object key or path to a local temporary or permanent cached file path.
        """
        if not path_str:
            return None

        # If already a cached or existing file, return it
        try:
            p_obj = Path(path_str)
            if p_obj.exists() and p_obj.stat().st_size > 0:
                return str(p_obj)
        except Exception:
            pass

        # Try resolving by category/filename
        category, filename = self._parse_category_and_filename(path_str)
        if category and filename:
            try:
                local_path = self.get_file_path(category, filename)
                return str(local_path)
            except Exception:
                pass

        if os.path.exists(path_str) and "storage" not in str(path_str).lower():
            return path_str

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

    def _find_legacy_file(self, category: str, filename: str) -> Optional[Path]:
        """Check if file exists in legacy storage directory on disk or sample-assets."""
        legacy_dir = settings.STORAGE_DIR / category
        cand = (legacy_dir / filename).resolve()
        if cand.exists() and cand.is_file():
            return cand

        sample_assets = settings.STORAGE_DIR.parent.parent / "sample-assets"
        sample_cand = sample_assets / filename
        if sample_cand.exists() and sample_cand.is_file():
            return sample_cand

        return None

    def sync_local_to_minio(self):
        """
        Syncs any existing legacy files from `backend/storage/` and `sample-assets/`
        into the MinIO bucket when MinIO is available.
        """
        if not self._is_minio_reachable() or self.client is None:
            print("[Storage] MinIO service is offline or disabled; serving assets from local storage.")
            return

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
                        try:
                            content_type = self._get_content_type(str(file_path))
                            self.client.fput_object(
                                self.bucket,
                                object_key,
                                str(file_path),
                                content_type=content_type
                            )
                            synced += 1
                        except Exception as fe:
                            print(f"[MinIO] Failed to sync {file_path}: {fe}")

        if synced > 0:
            print(f"[MinIO] Successfully synced {synced} legacy files into MinIO bucket '{self.bucket}'.")

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
