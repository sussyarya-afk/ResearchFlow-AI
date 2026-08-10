import logging
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from app.models.document_chunk import DocumentChunk

logger = logging.getLogger(__name__)

class PostgresEmbeddingStore:
    """
    Storage implementation for embeddings using Postgres JSON column.
    This provides a modular way to swap out embedding storage (e.g., to ChromaDB) later.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_embeddings(self, chunk_ids: list[UUID], embeddings: list[list[float]]):
        """Save a list of embeddings corresponding to a list of chunk IDs."""
        if len(chunk_ids) != len(embeddings):
            raise ValueError("Mismatched length between chunk_ids and embeddings")

        logger.info(f"Saving {len(chunk_ids)} embeddings to PostgreSQL...")
        
        # We can update them sequentially or via a bulk update statement.
        # Since chunk amounts per document might be small/moderate (10-100), 
        # a loop or simple execute is acceptable. For larger scale, bulk update mappings are better.
        for chunk_id, emb in zip(chunk_ids, embeddings):
            stmt = (
                update(DocumentChunk)
                .where(DocumentChunk.id == chunk_id)
                .values(embedding=emb)
            )
            await self.db.execute(stmt)
        
        await self.db.commit()
        logger.info(f"Successfully saved {len(chunk_ids)} embeddings.")

