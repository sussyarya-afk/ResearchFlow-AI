"""add_embedding_to_chunks

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-27 11:46:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add embedding column to document_chunks."""
    op.add_column('document_chunks', sa.Column('embedding', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Drop embedding column from document_chunks."""
    op.drop_column('document_chunks', 'embedding')
