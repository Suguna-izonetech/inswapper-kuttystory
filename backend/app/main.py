import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal, get_db
from app.services.pdf_importer import PDFImporterService
from app.routers import stories, personalization, books, admin, ai_admin, storage, auth, child_stories, feedbacks


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database tables & schema migrations
    Base.metadata.create_all(bind=engine)
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE personalization_jobs ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE personalization_jobs ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;"))
            conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);"))
            conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);"))
            conn.commit()
    except Exception as e:
        print(f"Notice during startup schema migration check: {e}")
    
    # 2. MinIO storage sync: Ensure bucket and sync any existing assets
    try:
        storage.sync_local_to_minio()
    except Exception as e:
        print(f"Notice during MinIO storage sync: {e}")

    # 3. Idempotent import of the Unicorn Story PDF from sample-assets
    sample_pdf = settings.STORAGE_DIR.parent.parent / "sample-assets" / "unicorn Story.pdf"
    if sample_pdf.exists():
        db = SessionLocal()
        try:
            print(f"Checking sample story PDF at: {sample_pdf}")
            PDFImporterService.import_story_from_pdf(
                pdf_path=str(sample_pdf),
                db=db,
                title="The Girl and the Magical Unicorn",
                slug="unicorn-story",
                description="Join an enchanting personalized adventure with a gentle white unicorn, exploring secret meadows, helping a fledgling bird, and discovering the courage of true friendship.",
                category="Fairytale & Adventure",
                age_range="3-8 years",
                force_reimport=False
            )
        except Exception as e:
            print(f"Notice during startup PDF import: {e}")
        finally:
            db.close()
    else:
        print(f"Warning: sample PDF not found at {sample_pdf}")

    # 3. Idempotently seed default admin logins
    try:
        from app.seed_admin import seed_admin_users
        seed_admin_users()
    except Exception as e:
        print(f"Notice during startup admin seed: {e}")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Personalized AI Children's Storybook Platform Prototype API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - strictly driven by .env (settings.CORS_ORIGINS)
origins_from_env = settings.CORS_ORIGINS
has_wildcard = "*" in origins_from_env

if has_wildcard:
    # When wildcard '*' is configured in .env, permit any origin dynamically while allowing credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    # Strictly enforce the explicit list of allowed origins from .env
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins_from_env,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )



# Register routers
app.include_router(stories.router, prefix=settings.API_V1_PREFIX)
app.include_router(personalization.router, prefix=settings.API_V1_PREFIX)
app.include_router(books.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(storage.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(child_stories.router, prefix=settings.API_V1_PREFIX)
app.include_router(feedbacks.router, prefix=settings.API_V1_PREFIX)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected",
        "storage": str(settings.STORAGE_DIR)
    }

@app.get("/admin_dashboard")
@app.get("/api/v1/admin_dashboard")
def admin_dashboard_alias(db = Depends(get_db)):
    return admin.get_dashboard_data(db)

@app.get("/api/v1/book-sales/by-state")
def public_book_sales_by_state(
    period: str = "30days",
    from_date: str = None,
    to_date: str = None,
    db = Depends(get_db)
):
    return admin.get_book_sales_by_state(period=period, from_date=from_date, to_date=to_date, db=db)


@app.get("/")
def root():
    return {
        "message": "Welcome to Personalized AI Children's Storybook API",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_PREFIX,
        "admin_dashboard": "/admin_dashboard"
    }
