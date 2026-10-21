import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings
from app.models import Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Dynamically set sqlalchemy.url from app settings
raw_db_url = settings.DATABASE_URL
if raw_db_url.startswith("postgresql+asyncpg://"):
    raw_db_url = raw_db_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
config.set_main_option("sqlalchemy.url", raw_db_url.replace("%", "%%"))

# Target metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url") or raw_db_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section, {})
    if not configuration.get("sqlalchemy.url") or "driver://" in str(configuration.get("sqlalchemy.url")):
        configuration["sqlalchemy.url"] = raw_db_url
    else:
        current_opt = str(configuration.get("sqlalchemy.url", ""))
        if "postgresql+asyncpg://" in current_opt:
            configuration["sqlalchemy.url"] = current_opt.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
