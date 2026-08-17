"""
ChunkService — Paragraph-aware sliding-window text chunking.

Algorithm:
  1. Receive per-page cleaned text as list[(page_number, text)].
  2. Build a flat list of (paragraph_text, page_number) tuples.
  3. Greedily accumulate paragraphs into chunks up to chunk_size.
  4. When a chunk is sealed, the next chunk starts with `overlap` chars
     from the end of the previous chunk for context continuity.
  5. Single paragraphs exceeding chunk_size are hard-split.
  6. Each chunk records which pages contributed to it.
"""

import asyncio
import logging
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.chunk import DocumentChunkCreate, DocumentChunkResponse, ChunkSummaryResponse
from app.repositories.chunk import ChunkRepository
from app.services.text_cleaner import clean_text, is_content_empty

logger = logging.getLogger(__name__)

DEFAULT_CHUNK_SIZE = 800
DEFAULT_OVERLAP = 120


def _build_paragraphs(pages_text: List[Tuple[int, str]]) -> List[Tuple[str, int]]:
    """
    Split per-page text into paragraphs, each tagged with its source page number.
    Returns list of (paragraph_text, page_number).
    """
    paragraphs: List[Tuple[str, int]] = []
    for page_num, text in pages_text:
        cleaned = clean_text(text)
        if not cleaned:
            continue
        # Split on double-newline (paragraph break)
        for para in cleaned.split("\n\n"):
            para = para.strip()
            if para:
                paragraphs.append((para, page_num))
    return paragraphs


def _hard_split(text: str, chunk_size: int) -> List[str]:
    """Split a single long text into pieces of at most chunk_size characters."""
    pieces = []
    for i in range(0, len(text), chunk_size):
        pieces.append(text[i:i + chunk_size])
    return pieces


def chunk_text(
    pages_text: List[Tuple[int, str]],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> List[dict]:
    """
    Core chunking algorithm. Returns a list of chunk dicts with:
      - text, chunk_index, page_start, page_end, character_count, estimated_tokens

    This is a pure function for testability.
    """
    paragraphs = _build_paragraphs(pages_text)

    if not paragraphs:
        return []

    chunks: List[dict] = []
    current_text = ""
    current_pages: List[int] = []
    chunk_index = 0

    def _seal_chunk(text: str, pages: List[int]) -> None:
        nonlocal chunk_index
        text = text.strip()
        if not text:
            return
        char_count = len(text)
        chunks.append({
            "chunk_index": chunk_index,
            "page_start": min(pages),
            "page_end": max(pages),
            "text": text,
            "character_count": char_count,
            "estimated_tokens": char_count // 4,
        })
        chunk_index += 1

    for para_text, page_num in paragraphs:
        # Handle paragraphs that are themselves larger than chunk_size
        if len(para_text) > chunk_size:
            # First, seal whatever we've accumulated
            if current_text:
                _seal_chunk(current_text, current_pages)
                overlap_text = current_text[-overlap:] if len(current_text) > overlap else current_text
                current_text = overlap_text
                current_pages = [page_num]

            # Hard-split the oversized paragraph
            pieces = _hard_split(para_text, chunk_size)
            for i, piece in enumerate(pieces):
                if i == len(pieces) - 1:
                    # Last piece — keep accumulating
                    current_text = (current_text + "\n\n" + piece).strip() if current_text else piece
                    if page_num not in current_pages:
                        current_pages.append(page_num)
                else:
                    combined = (current_text + "\n\n" + piece).strip() if current_text else piece
                    _seal_chunk(combined, current_pages if current_pages else [page_num])
                    # Start next with overlap
                    current_text = piece[-overlap:] if len(piece) > overlap else piece
                    current_pages = [page_num]
            continue

        # Check if adding this paragraph would exceed chunk_size
        separator = "\n\n" if current_text else ""
        candidate = current_text + separator + para_text

        if len(candidate) > chunk_size and current_text:
            # Seal the current chunk
            _seal_chunk(current_text, current_pages)
            # Start new chunk with overlap from the sealed chunk
            overlap_text = current_text[-overlap:] if len(current_text) > overlap else current_text
            current_text = overlap_text + "\n\n" + para_text
            current_pages = [page_num]
        else:
            current_text = candidate
            if page_num not in current_pages:
                current_pages.append(page_num)

    # Seal the final chunk
    if current_text:
        _seal_chunk(current_text, current_pages)

    return chunks


class ChunkService:
    @staticmethod
    async def create_chunks_for_document(
        session: AsyncSession,
        document_id: UUID,
        pages_text: List[Tuple[int, str]],
        chunk_size: int = DEFAULT_CHUNK_SIZE,
        overlap: int = DEFAULT_OVERLAP,
        project_id: Optional[str] = None,
        document_name: Optional[str] = None,
    ) -> int:
        """
        Create text chunks for a document. Deletes any existing chunks first.
        Generates embeddings and upserts them into ChromaDB for retrieval.
        Returns the number of chunks created.
        """
        import time
        from app.services.event_manager import event_bus, EventType, create_timeline_event

        if project_id:
            await event_bus.publish(
                project_id,
                create_timeline_event(
                    event_type=EventType.CHUNKING_STARTED,
                    status="running",
                    metadata={"document_id": str(document_id)},
                    project_id=project_id
                )
            )

        # Check if all text is empty/scanned
        all_text = " ".join(text for _, text in pages_text)
        if is_content_empty(all_text):
            logger.info(f"Document {document_id}: no meaningful text content (scanned/empty PDF). Skipping chunking.")
            return 0

        start_chunking = time.time()
        # Delete any existing chunks (idempotent re-chunking)
        await ChunkRepository.delete_by_document(session, document_id)

        # Also remove stale ChromaDB vectors for this document so we don't keep orphaned data
        await ChunkService._delete_chroma_vectors_for_document(str(document_id), project_id)

        # Run the chunking algorithm
        raw_chunks = chunk_text(pages_text, chunk_size, overlap)
        chunking_duration = int((time.time() - start_chunking) * 1000)

        if not raw_chunks:
            logger.info(f"Document {document_id}: chunking produced 0 chunks.")
            return 0

        if project_id:
            await event_bus.publish(
                project_id,
                create_timeline_event(
                    event_type=EventType.CHUNKING_COMPLETED,
                    status="done",
                    duration_ms=chunking_duration,
                    metadata={"chunk_count": len(raw_chunks)},
                    project_id=project_id
                )
            )

        # Build DTOs
        chunk_dtos = [
            DocumentChunkCreate(
                document_id=document_id,
                chunk_index=c["chunk_index"],
                page_start=c["page_start"],
                page_end=c["page_end"],
                text=c["text"],
                character_count=c["character_count"],
                estimated_tokens=c["estimated_tokens"],
            )
            for c in raw_chunks
        ]

        db_chunks = await ChunkRepository.create_bulk(session, chunk_dtos)
        logger.info(f"Document {document_id}: created {len(db_chunks)} chunks in PostgreSQL.")

        if db_chunks:
            await ChunkService._embed_and_index(
                db_chunks=db_chunks,
                document_id=document_id,
                document_name=document_name or str(document_id),
                project_id=project_id,
            )

        return len(db_chunks)

    @staticmethod
    async def _delete_chroma_vectors_for_document(document_id: str, project_id: Optional[str]) -> None:
        """Remove all ChromaDB vectors for a document (called before re-chunking)."""
        try:
            from app.repositories.embedding_store import chroma_embedding_store

            def _delete_sync():
                if not chroma_embedding_store._healthy or chroma_embedding_store._collection is None:
                    return
                # Query by document_id metadata filter to find IDs, then delete
                try:
                    results = chroma_embedding_store._collection.get(
                        where={"document_id": document_id},
                        include=[],
                    )
                    ids_to_delete = results.get("ids", [])
                    if ids_to_delete:
                        chroma_embedding_store._collection.delete(ids=ids_to_delete)
                        logger.info(
                            "Deleted %d stale ChromaDB vectors for document %s.",
                            len(ids_to_delete),
                            document_id,
                        )
                except Exception as exc:
                    # Non-fatal — log and continue
                    logger.warning("Could not delete stale ChromaDB vectors: %s", exc)

            await asyncio.to_thread(_delete_sync)
        except Exception as exc:
            logger.warning("ChromaDB cleanup skipped: %s", exc)

    @staticmethod
    async def _embed_and_index(
        db_chunks,
        document_id: UUID,
        document_name: str,
        project_id: Optional[str],
    ) -> None:
        """
        Generate embeddings for db_chunks and upsert into ChromaDB.
        Errors are logged and re-raised so callers can surface them properly.
        """
        import time
        from app.services.embedding import embedding_service
        from app.repositories.embedding_store import chroma_embedding_store
        from app.services.event_manager import event_bus, EventType, create_timeline_event

        texts = [c.text for c in db_chunks]
        chunk_ids = [c.id for c in db_chunks]

        # ── Embedding ──────────────────────────────────────────────────────────
        if project_id:
            await event_bus.publish(
                project_id,
                create_timeline_event(
                    event_type=EventType.EMBEDDING_STARTED,
                    status="running",
                    metadata={"chunk_count": len(texts)},
                    project_id=project_id
                )
            )

        start_embed = time.time()
        try:
            embeddings = await asyncio.to_thread(embedding_service.generate_embeddings, texts)
        except Exception as exc:
            err_msg = f"Embedding generation failed for document {document_id}: {exc}"
            logger.error(err_msg, exc_info=True)
            if project_id:
                await event_bus.publish(
                    project_id,
                    create_timeline_event(
                        event_type=EventType.EMBEDDING_STARTED,
                        status="error",
                        metadata={"error": str(exc)},
                        project_id=project_id
                    )
                )
            raise RuntimeError(err_msg) from exc

        embed_duration = int((time.time() - start_embed) * 1000)

        if project_id:
            await event_bus.publish(
                project_id,
                create_timeline_event(
                    event_type=EventType.EMBEDDING_COMPLETED,
                    status="done",
                    duration_ms=embed_duration,
                    metadata={"embedding_count": len(embeddings)},
                    project_id=project_id
                )
            )

        # ── ChromaDB Upsert ────────────────────────────────────────────────────
        if project_id:
            await event_bus.publish(
                project_id,
                create_timeline_event(
                    event_type=EventType.VECTOR_INDEXING_STARTED,
                    status="running",
                    metadata={"item_count": len(chunk_ids)},
                    project_id=project_id
                )
            )

        # Build metadata dicts required by RetrievalService
        metadatas = [
            {
                "chunk_id": str(chunk_ids[i]),
                "document_id": str(document_id),
                "project_id": project_id or "",
                "page_start": db_chunks[i].page_start,
                "page_end": db_chunks[i].page_end,
                "document_name": document_name,
            }
            for i in range(len(chunk_ids))
        ]

        start_index = time.time()
        try:
            indexed = await asyncio.to_thread(
                chroma_embedding_store.upsert,
                chunk_ids,
                embeddings,
                texts,
                metadatas,
            )
        except Exception as exc:
            err_msg = f"ChromaDB upsert failed for document {document_id}: {exc}"
            logger.error(err_msg, exc_info=True)
            if project_id:
                await event_bus.publish(
                    project_id,
                    create_timeline_event(
                        event_type=EventType.VECTOR_INDEXING_STARTED,
                        status="error",
                        metadata={"error": str(exc)},
                        project_id=project_id
                    )
                )
            raise RuntimeError(err_msg) from exc

        index_duration = int((time.time() - start_index) * 1000)

        if project_id:
            await event_bus.publish(
                project_id,
                create_timeline_event(
                    event_type=EventType.VECTOR_INDEXING_COMPLETED,
                    status="done",
                    duration_ms=index_duration,
                    metadata={"indexed_count": indexed},
                    project_id=project_id
                )
            )

        logger.info(
            "Document %s: %d vectors upserted into ChromaDB (embed_ms=%d index_ms=%d).",
            document_id, indexed, embed_duration, index_duration,
        )

    @staticmethod
    async def get_chunks(session: AsyncSession, document_id: UUID) -> List[DocumentChunkResponse]:
        """Retrieve all chunks for a document."""
        db_chunks = await ChunkRepository.get_by_document(session, document_id)
        return [DocumentChunkResponse.model_validate(c) for c in db_chunks]

    @staticmethod
    async def get_chunk_summary(session: AsyncSession, document_id: UUID) -> ChunkSummaryResponse:
        """Get aggregate chunk statistics for a document."""
        db_chunks = await ChunkRepository.get_by_document(session, document_id)
        total_chars = sum(c.character_count for c in db_chunks)
        total_tokens = sum(c.estimated_tokens for c in db_chunks)
        return ChunkSummaryResponse(
            document_id=document_id,
            chunk_count=len(db_chunks),
            total_characters=total_chars,
            total_estimated_tokens=total_tokens,
        )
