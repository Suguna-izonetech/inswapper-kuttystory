"""add_child_written_stories

Revision ID: 76be344cccbe
Revises: 861e39d159c4
Create Date: 2026-10-20 14:48:26.494108

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sys
from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.migration_utils import safe_create_table, safe_drop_table


# revision identifiers, used by Alembic.
revision: str = '76be344cccbe'
down_revision: Union[str, Sequence[str], None] = '861e39d159c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema idempotently."""
    safe_create_table(
        'child_written_stories',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('child_name', sa.String(length=100), nullable=False),
        sa.Column('standard', sa.String(length=50), nullable=False),
        sa.Column('place', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('story_text', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('cover_color', sa.String(length=30), nullable=True),
        sa.Column('parent_email', sa.String(length=150), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=True),
        sa.Column('likes_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema safely."""
    safe_drop_table('child_written_stories')
