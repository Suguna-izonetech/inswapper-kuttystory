import os
import re
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal, get_db
from app.services.pdf_importer import PDFImporterService
from app.routers import stories, personalization, books, admin, ai_admin, storage, auth, child_stories, feedbacks


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database tables & schema migrations safely via Alembic
    try:
        from app.db_init import run_database_migrations
        run_database_migrations()
    except Exception as e:
        print(f"Notice during startup schema migration check: {e}")
        Base.metadata.create_all(bind=engine)
    
    # 2. MinIO storage sync & DB path normalization
    try:
        from app.services.storage import storage as storage_mgr
        storage_mgr.sync_local_to_minio()
        db_mig = SessionLocal()
        try:
            storage_mgr.migrate_database_to_minio_keys(db_mig)
        finally:
            db_mig.close()
    except Exception as e:
        print(f"Notice during MinIO storage initialization: {e}")

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
    description="Personalized Children's Storybook Platform Prototype API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - dynamically matches all risingsuntech.in subdomains, localhost, and env entries
origins_from_env = settings.CORS_ORIGINS
has_wildcard = "*" in origins_from_env

cors_regex = r"^https?://.*" if has_wildcard else getattr(
    settings,
    "CORS_ORIGIN_REGEX",
    r"^https?://([a-zA-Z0-9-]+\.)*(risingsuntech\.in|localhost|127\.0\.0\.1)(:\d+)?$"
)
try:
    compiled_cors_regex = re.compile(cors_regex)
except Exception:
    compiled_cors_regex = re.compile(r"^https?://([a-zA-Z0-9-]+\.)*(risingsuntech\.in|localhost|127\.0\.0\.1)(:\d+)?$")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_from_env,
    allow_origin_regex=cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def ensure_cors_headers(request: Request, call_next):
    origin = request.headers.get("origin")
    is_allowed = False
    if origin:
        clean_origin = origin.strip().rstrip("/")
        if has_wildcard or clean_origin in origins_from_env or compiled_cors_regex.match(clean_origin):
            is_allowed = True

    # Preflight OPTIONS request interception: ensure 200 OK with all required CORS headers
    if request.method == "OPTIONS" and is_allowed and origin:
        from fastapi.responses import Response
        res = Response(status_code=200)
        res.headers["Access-Control-Allow-Origin"] = origin
        res.headers["Access-Control-Allow-Credentials"] = "true"
        res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        res.headers["Access-Control-Allow-Headers"] = request.headers.get("access-control-request-headers", "*")
        res.headers["Access-Control-Max-Age"] = "86400"
        return res

    try:
        response = await call_next(request)
    except Exception as exc:
        from fastapi.responses import JSONResponse
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "error": str(exc)}
        )

    if is_allowed and origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Expose-Headers"] = "*"
    return response



# Register routers
app.include_router(stories.router, prefix=settings.API_V1_PREFIX)
app.include_router(personalization.router, prefix=settings.API_V1_PREFIX)
app.include_router(books.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(storage.router, prefix=settings.API_V1_PREFIX)
app.include_router(storage.router, prefix="")  # Expose /storage/{category}/{filename} for direct compatibility
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(child_stories.router, prefix=settings.API_V1_PREFIX)
app.include_router(feedbacks.router, prefix=settings.API_V1_PREFIX)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected",
        "storage": "minio",
        "minio_endpoint": settings.MINIO_ENDPOINT,
        "minio_bucket": settings.MINIO_BUCKET
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
        "message": "Welcome to Personalized Children's Storybook API",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_PREFIX,
        "admin_dashboard": "/admin_dashboard"
    }
