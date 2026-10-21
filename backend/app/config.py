import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
STORAGE_BASE = BACKEND_DIR / "storage"

# Ensure environment variables from .env are loaded into os.environ
load_dotenv(BACKEND_DIR / ".env", override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personalized AI Children's Storybook"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database (PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+pg8000://postgres:Narmadha19%40izone@localhost:5432/kuttystory_db"
    )
    
    # Auth & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "editorial-storybook-super-secret-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SMTP Email Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@kuttystory.co.in")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    
    # Storage directories (Private local storage adapter)
    STORAGE_DIR: Path = STORAGE_BASE
    ORIGINAL_PDFS_DIR: Path = STORAGE_BASE / "original_pdfs"
    SOURCE_PAGES_DIR: Path = STORAGE_BASE / "source_pages"
    CHILD_PHOTOS_DIR: Path = STORAGE_BASE / "child_photos"
    GENERATED_ASSETS_DIR: Path = STORAGE_BASE / "generated_assets"
    PREVIEWS_DIR: Path = STORAGE_BASE / "previews"
    FINAL_BOOKS_DIR: Path = STORAGE_BASE / "final_books"
    
    # AI Providers Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    HF_TOKEN: str = os.getenv("HF_TOKEN", "")
    FAL_KEY: str = os.getenv("FAL_KEY", "")
    ACTIVE_STORY_PROVIDER: str = os.getenv("ACTIVE_STORY_PROVIDER", "gemini") # gemini, rule_based
    ACTIVE_IMAGE_PROVIDER: str = os.getenv("ACTIVE_IMAGE_PROVIDER", "fal_ai") # fal_ai, huggingface, template_fusion, mock_poc
    HF_MODEL_NAME: str = os.getenv("HF_MODEL_NAME", "stabilityai/stable-diffusion-xl-base-1.0")
    HF_FACE_SWAP_SPACE: str = os.getenv("HF_FACE_SWAP_SPACE", "ovi054/face-swap-pro")
    HF_FACE_SWAP_ENHANCE: bool = os.getenv("HF_FACE_SWAP_ENHANCE", "true").lower() == "true"
    
    # Budgets & Limits
    PER_BOOK_BUDGET_USD: float = 2.50
    PREVIEW_PAGE_LIMIT: int = 5  # Configurable number of pages to generate during initial preview
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
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
for folder in [
    settings.STORAGE_DIR,
    settings.ORIGINAL_PDFS_DIR,
    settings.SOURCE_PAGES_DIR,
    settings.CHILD_PHOTOS_DIR,
    settings.GENERATED_ASSETS_DIR,
    settings.PREVIEWS_DIR,
    settings.FINAL_BOOKS_DIR,
]:
    folder.mkdir(parents=True, exist_ok=True)
