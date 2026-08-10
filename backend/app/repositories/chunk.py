from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from app.models.document_chunk import DocumentChunk
from app.schemas.chunk import DocumentChunkCreate


class ChunkRepository:
    @staticmethod
    async def create_bulk(session: AsyncSession, chunks_in: List[DocumentChunkCreate]) -> List[DocumentChunk]:
        """Bulk insert document chunks in a single commit."""
        db_chunks = []
        for chunk_in in chunks_in:
            db_chunk = DocumentChunk(
                document_id=chunk_in.document_id,
                chunk_index=chunk_in.chunk_index,
                page_start=chunk_in.page_start,
                page_end=chunk_in.page_end,
                text=chunk_in.text,
                character_count=chunk_in.character_count,
                estimated_tokens=chunk_in.estimated_tokens,
            )
            session.add(db_chunk)
            db_chunks.append(db_chunk)

        await session.commit()
        for db_chunk in db_chunks:
            await session.refresh(db_chunk)
        return db_chunks

    @staticmethod
    async def get_by_document(session: AsyncSession, document_id: UUID) -> List[DocumentChunk]:
        """Retrieve all chunks for a document, ordered by chunk_index."""
        result = await session.execute(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index)
        )
        return list(result.scalars().all())

    @staticmethod
    async def delete_by_document(session: AsyncSession, document_id: UUID) -> int:
        """Delete all chunks for a document. Returns count of deleted rows."""
        result = await session.execute(
            delete(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
        )
        await session.commit()
        return result.rowcount

    @staticmethod
    async def count_by_document(session: AsyncSession, document_id: UUID) -> int:
        """Return the number of chunks for a document."""
        result = await session.execute(
            select(func.count(DocumentChunk.id))
            .where(DocumentChunk.document_id == document_id)
        )
        return result.scalar() or 0
