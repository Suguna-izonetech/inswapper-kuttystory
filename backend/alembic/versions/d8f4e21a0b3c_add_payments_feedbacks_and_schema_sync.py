"""add_payments_feedbacks_and_schema_sync

Revision ID: d8f4e21a0b3c
Revises: 76be344cccbe
Create Date: 2026-10-23 19:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sys
from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.migration_utils import (
    safe_create_table,
    safe_create_index,
    safe_add_column,
    safe_alter_column_type,
    safe_drop_table,
    safe_drop_index
)


# revision identifiers, used by Alembic.
revision: str = 'd8f4e21a0b3c'
down_revision: Union[str, Sequence[str], None] = '76be344cccbe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema idempotently."""
    # 1. Payment transactions table
    safe_create_table(
        'payment_transactions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('order_id', sa.String(length=36), nullable=True),
        sa.Column('job_id', sa.String(length=36), nullable=True),
        sa.Column('razorpay_order_id', sa.String(length=100), nullable=True),
        sa.Column('razorpay_payment_id', sa.String(length=100), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=True),
        sa.Column('method', sa.String(length=50), nullable=True),
        sa.Column('customer_name', sa.String(length=100), nullable=True),
        sa.Column('customer_email', sa.String(length=150), nullable=True),
        sa.Column('format_type', sa.String(length=30), nullable=True),
        sa.Column('error_description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['job_id'], ['personalization_jobs.id'], ),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    safe_create_index(op.f('ix_payment_transactions_razorpay_order_id'), 'payment_transactions', ['razorpay_order_id'], unique=False)
    safe_create_index(op.f('ix_payment_transactions_razorpay_payment_id'), 'payment_transactions', ['razorpay_payment_id'], unique=False)

    # 2. Feedbacks table
    safe_create_table(
        'feedbacks',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('place', sa.String(length=100), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('review_text', sa.Text(), nullable=True),
        sa.Column('media_url', sa.String(length=500), nullable=True),
        sa.Column('media_type', sa.String(length=20), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # 3. Columns on personalization_jobs
    safe_add_column('personalization_jobs', sa.Column('is_paid', sa.Boolean(), server_default=sa.text('false'), nullable=True))
    safe_add_column('personalization_jobs', sa.Column('paid_at', sa.DateTime(), nullable=True))

    # 4. Columns on orders
    safe_add_column('orders', sa.Column('razorpay_order_id', sa.String(length=100), nullable=True))
    safe_add_column('orders', sa.Column('razorpay_payment_id', sa.String(length=100), nullable=True))

    # 5. Column lengths on generated_assets (expand from 50/100 to 255)
    safe_alter_column_type('generated_assets', 'provider', sa.String(length=255))
    safe_alter_column_type('generated_assets', 'model', sa.String(length=255))


def downgrade() -> None:
    """Downgrade schema safely."""
    safe_drop_index(op.f('ix_payment_transactions_razorpay_payment_id'), table_name='payment_transactions')
    safe_drop_index(op.f('ix_payment_transactions_razorpay_order_id'), table_name='payment_transactions')
    safe_drop_table('feedbacks')
    safe_drop_table('payment_transactions')
