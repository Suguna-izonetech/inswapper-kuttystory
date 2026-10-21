from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

def get_sync_database_url(url: str) -> str:
    """
    Ensure the database URL uses a synchronous driver for SQLAlchemy's synchronous engine / SessionLocal.
    If the URL starts with postgresql+asyncpg://, adapt it to postgresql+psycopg2:// (or postgresql+pg8000://).
    """
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
    return url

def get_async_database_url(url: str) -> str:
    """
    Ensure the database URL uses an async driver for SQLAlchemy's async engine / AsyncSession.
    If the URL uses a synchronous driver, convert it to postgresql+asyncpg://.
    """
    if url.startswith("postgresql+psycopg2://"):
        return url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql+pg8000://"):
        return url.replace("postgresql+pg8000://", "postgresql+asyncpg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

SYNC_DATABASE_URL = get_sync_database_url(settings.DATABASE_URL)
ASYNC_DATABASE_URL = get_async_database_url(settings.DATABASE_URL)

# If sqlite, use connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if "sqlite" in SYNC_DATABASE_URL else {}

# Primary synchronous engine used by SessionLocal and Depends(get_db)
engine = create_engine(
    SYNC_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Optional asynchronous engine & session for asyncpg workflows
async_engine = None
AsyncSessionLocal = None
if "postgresql" in settings.DATABASE_URL or "sqlite" in settings.DATABASE_URL:
    try:
        async_engine = create_async_engine(
            ASYNC_DATABASE_URL,
            pool_pre_ping=True,
            echo=False
        )
        AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)
    except Exception:
        pass

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    if AsyncSessionLocal is None:
        raise RuntimeError("Async database session is not configured.")
    async with AsyncSessionLocal() as session:
        yield session
