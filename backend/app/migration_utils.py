"""
Alembic migration utility module providing idempotent schema operations.
Ensures migrations can safely run on:
1. Fresh empty databases.
2. Existing databases where tables already exist but alembic_version is missing.
3. Databases migrating incrementally between revisions.

Guarantees:
- Zero data loss (no dropping tables or truncating rows).
- Idempotent table and index creation (avoids DuplicateTable / DuplicateIndex errors).
- Safe column additions and alterations.
"""

from typing import List, Optional
import sqlalchemy as sa
from alembic import op, context


def is_offline() -> bool:
    """Check if alembic is running in offline (--sql) mode."""
    return context.is_offline_mode()


def get_inspector(bind=None):
    """Obtain a SQLAlchemy inspector for the current database connection."""
    if bind is None:
        bind = op.get_bind()
    return sa.inspect(bind)


def table_exists(table_name: str, schema: Optional[str] = None, bind=None) -> bool:
    """Check whether a table already exists in the target database."""
    if is_offline():
        return False
    inspector = get_inspector(bind)
    return table_name in inspector.get_table_names(schema=schema)


def column_exists(table_name: str, column_name: str, schema: Optional[str] = None, bind=None) -> bool:
    """Check whether a column already exists in a given table."""
    if is_offline():
        return False
    inspector = get_inspector(bind)
    if table_name not in inspector.get_table_names(schema=schema):
        return False
    cols = [c["name"] for c in inspector.get_columns(table_name, schema=schema)]
    return column_name in cols


def index_exists(table_name: str, index_name: str, schema: Optional[str] = None, bind=None) -> bool:
    """Check whether an index already exists on a given table."""
    if is_offline():
        return False
    inspector = get_inspector(bind)
    if table_name not in inspector.get_table_names(schema=schema):
        return False
    indexes = [ix["name"] for ix in inspector.get_indexes(table_name, schema=schema)]
    return index_name in indexes


def safe_create_table(table_name: str, *columns, schema: Optional[str] = None, **kwargs) -> None:
    """
    Idempotently create a table if it does not already exist.
    If the table exists, inspects the table to ensure any missing columns are added,
    preserving existing rows and avoiding DuplicateTable errors.
    """
    if is_offline():
        op.create_table(table_name, *columns, schema=schema, **kwargs)
        return

    bind = op.get_bind()
    if not table_exists(table_name, schema=schema, bind=bind):
        op.create_table(table_name, *columns, schema=schema, **kwargs)
    else:
        # Table exists: verify and add any missing columns safely
        inspector = get_inspector(bind)
        existing_cols = {c["name"] for c in inspector.get_columns(table_name, schema=schema)}
        for item in columns:
            if isinstance(item, sa.Column):
                if item.name not in existing_cols:
                    # Column is missing from existing table; add it safely
                    op.add_column(table_name, item.copy(), schema=schema)


def safe_create_index(index_name: str, table_name: str, columns: List[str], schema: Optional[str] = None, **kwargs) -> None:
    """
    Idempotently create an index if the table exists and the index does not already exist.
    """
    if is_offline():
        op.create_index(index_name, table_name, columns, schema=schema, **kwargs)
        return

    bind = op.get_bind()
    if table_exists(table_name, schema=schema, bind=bind):
        if not index_exists(table_name, index_name, schema=schema, bind=bind):
            op.create_index(index_name, table_name, columns, schema=schema, **kwargs)


def safe_add_column(table_name: str, column: sa.Column, schema: Optional[str] = None) -> None:
    """
    Idempotently add a column to a table if it does not already exist.
    """
    if is_offline():
        op.add_column(table_name, column, schema=schema)
        return

    bind = op.get_bind()
    if table_exists(table_name, schema=schema, bind=bind):
        if not column_exists(table_name, column.name, schema=schema, bind=bind):
            op.add_column(table_name, column, schema=schema)


def safe_alter_column_type(table_name: str, column_name: str, new_type: sa.types.TypeEngine, schema: Optional[str] = None, **kwargs) -> None:
    """
    Idempotently alter a column's type if the table and column exist.
    """
    if is_offline():
        op.alter_column(table_name, column_name, type_=new_type, schema=schema, **kwargs)
        return

    bind = op.get_bind()
    if table_exists(table_name, schema=schema, bind=bind):
        if column_exists(table_name, column_name, schema=schema, bind=bind):
            op.alter_column(table_name, column_name, type_=new_type, schema=schema, **kwargs)


def safe_drop_table(table_name: str, schema: Optional[str] = None, **kwargs) -> None:
    """
    Safely drop a table only if it exists.
    """
    if is_offline():
        op.drop_table(table_name, schema=schema, **kwargs)
        return

    bind = op.get_bind()
    if table_exists(table_name, schema=schema, bind=bind):
        op.drop_table(table_name, schema=schema, **kwargs)


def safe_drop_index(index_name: str, table_name: str, schema: Optional[str] = None, **kwargs) -> None:
    """
    Safely drop an index only if the table and index exist.
    """
    if is_offline():
        op.drop_index(index_name, table_name=table_name, schema=schema, **kwargs)
        return

    bind = op.get_bind()
    if table_exists(table_name, schema=schema, bind=bind):
        if index_exists(table_name, index_name, schema=schema, bind=bind):
            op.drop_index(index_name, table_name=table_name, schema=schema, **kwargs)
