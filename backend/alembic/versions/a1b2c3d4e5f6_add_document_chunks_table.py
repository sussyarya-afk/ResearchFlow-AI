"""add_document_chunks_table

Revision ID: a1b2c3d4e5f6
Revises: None
Create Date: 2026-07-27 11:14:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the document_chunks table."""
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.Uuid(), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('document_id', sa.Uuid(), nullable=False),
        sa.Column('chunk_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('page_start', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('page_end', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('text', sa.Text(), nullable=False, server_default=''),
        sa.Column('character_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('estimated_tokens', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        'ix_document_chunks_doc_idx',
        'document_chunks',
        ['document_id', 'chunk_index'],
    )


def downgrade() -> None:
    """Drop the document_chunks table."""
    op.drop_index('ix_document_chunks_doc_idx', table_name='document_chunks')
    op.drop_table('document_chunks')
