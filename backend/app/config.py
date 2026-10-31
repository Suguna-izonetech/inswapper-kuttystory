import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
INSIGHTFACE_ROOT = BACKEND_DIR / "models" / "insightface" 

# Search and load .env file reliably from all likely locations
def find_and_load_env():
    candidates = [
        BASE_DIR / ".env",
        BACKEND_DIR / ".env",
        Path.cwd() / ".env",
    ]
    # Check parent directory hierarchy
    p = Path.cwd().resolve()
    for _ in range(3):
        cand = p / ".env"
        if cand not in candidates:
            candidates.append(cand)
        if p == p.parent:
            break
        p = p.parent

    primary_env = None
    for cand in candidates:
        if cand.is_file():
            load_dotenv(cand, override=True)
            if not primary_env:
                primary_env = cand

    if not primary_env:
        found = find_dotenv(usecwd=True)
        if found and Path(found).is_file():
            primary_env = Path(found)
            load_dotenv(primary_env, override=True)

    return str(primary_env) if primary_env else None

ACTIVE_ENV_FILE = find_and_load_env()


class Settings(BaseSettings):
    PROJECT_NAME: str = "Personalized Children's Storybook"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database (PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:Narmadha19%40izone@localhost:5432/kuttystory_db"
    )
    
    # Auth & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "editorial-storybook-super-secret-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SMTP Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER") or os.getenv("SMTP_USERNAME") or ""
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@kuttystory.co.in")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    
    # Storage Configuration (MinIO Object Storage)
    STORAGE_BACKEND: str = os.getenv("STORAGE_BACKEND", "minio")
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "127.0.0.1:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "kuttystory")
    MINIO_SECURE: bool = os.getenv("MINIO_SECURE", "false").lower() in ("true", "1", "yes")
    MINIO_PUBLIC_URL: Optional[str] = os.getenv("MINIO_PUBLIC_URL", None)

    # Project Paths (All assets are stored exclusively in MinIO object storage)
    BASE_DIR: Path = BASE_DIR
    BACKEND_DIR: Path = BACKEND_DIR
    STORAGE_DIR: Path = BACKEND_DIR
    INSIGHTFACE_ROOT: Path = INSIGHTFACE_ROOT

    @field_validator("INSIGHTFACE_ROOT", mode="after")
    @classmethod
    def resolve_insightface_root(cls, v: Path) -> Path:
        if not v.is_absolute():
            return (BACKEND_DIR / v).resolve()
        return v.resolve()
    
    # Image & Story Providers Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    FAL_KEY: str = os.getenv("FAL_KEY", "")
    ACTIVE_STORY_PROVIDER: str = os.getenv("ACTIVE_STORY_PROVIDER", "gemini") # gemini, rule_based
    ACTIVE_IMAGE_PROVIDER: str = os.getenv("ACTIVE_IMAGE_PROVIDER", "fal_ai") # fal_ai, huggingface, template_fusion, mock_poc
    HF_MODEL_NAME: str = os.getenv("HF_MODEL_NAME", "")

    # Dedicated Face Swap Service Configuration (InsightFace INSwapper-128)
    FACE_SWAP_PROVIDER: str = os.getenv("FACE_SWAP_PROVIDER", "insightface") # insightface, local_poisson
    INSWAPPER_MODEL_PATH: str = os.getenv("INSWAPPER_MODEL_PATH", "models/inswapper_128.onnx")
    FACE_SWAP_EXECUTION_PROVIDER: str = os.getenv("FACE_SWAP_EXECUTION_PROVIDER", "CPUExecutionProvider") # CPUExecutionProvider, CUDAExecutionProvider
    FACE_SWAP_DET_SIZE: int = int(os.getenv("FACE_SWAP_DET_SIZE", "640"))
    FACE_SWAP_ENHANCE: bool = os.getenv("FACE_SWAP_ENHANCE", "false").lower() in ("true", "1", "yes")
    HF_FACE_SWAP_SPACE: str = os.getenv("HF_FACE_SWAP_SPACE", "")
    HF_FACE_ENHANCE_SPACE: str = os.getenv("HF_FACE_ENHANCE_SPACE", "")
    HF_INSTANT_ID_SPACE: str = os.getenv("HF_INSTANT_ID_SPACE", "")
    HF_FACE_SWAP_ENHANCE: bool = os.getenv("HF_FACE_SWAP_ENHANCE", "false").lower() == "true"
    HF_FACE_SWAP_TIMEOUT: float = float(os.getenv("HF_FACE_SWAP_TIMEOUT", "25.0"))
    PREFER_LOCAL_FUSION: bool = os.getenv("PREFER_LOCAL_FUSION", "false").lower() in ("true", "1", "yes")
    
    # Budgets & Limits
    PER_BOOK_BUDGET_USD: float = 2.50
    PREVIEW_PAGE_LIMIT: int = int(os.getenv("PREVIEW_PAGE_LIMIT", "3"))  # Configurable number of pages to generate during initial preview
    MAX_GENERATION_RETRIES: int = 3
    PAID_FALLBACK_ENABLED: bool = False

    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    # Print specifications
    PRINT_TRIM_WIDTH_MM: float = 210.0
    PRINT_TRIM_HEIGHT_MM: float = 210.0
    PRINT_BLEED_MM: float = 3.0
    PRINT_SAFE_MARGIN_MM: float = 10.0
    
    # CORS Allowed Origins - Strictly retrieved only from .env
    CORS_ORIGINS: Union[List[str], str] = []
    CORS_ORIGIN_REGEX: Optional[str] = os.getenv("CORS_ORIGIN_REGEX", None)

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        raw = v if v is not None and v != "" else os.getenv("CORS_ORIGINS", "")
        if isinstance(raw, str):
            raw_str = raw.strip()
            if raw_str.startswith("[") and raw_str.endswith("]"):
                try:
                    import json
                    parsed = json.loads(raw_str)
                    if isinstance(parsed, list):
                        return [str(item).strip().strip("\"'") for item in parsed if str(item).strip()]
                except Exception:
                    pass
            return [item.strip().strip("\"'") for item in raw_str.split(",") if item.strip()]
        elif isinstance(raw, (list, tuple, set)):
            return [str(item).strip().strip("\"'") for item in raw if str(item).strip()]
        return []

    model_config = SettingsConfigDict(
        env_file=ACTIVE_ENV_FILE if ACTIVE_ENV_FILE else ".env",
        extra="allow",
        case_sensitive=False
    )


settings = Settings()

# All files are stored exclusively in MinIO object storage.
# Local filesystem directories are not required.

