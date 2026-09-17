"""
ChromaEmbeddingStore — upserts chunk embeddings + metadata into ChromaDB.

This is the WRITE path that matches RetrievalService (the READ path).
Both must use the same ChromaDB collection name: "document_chunks".

Legacy note:
  DocumentChunk.embedding (JSON column) is kept for potential future use,
  but is NOT queried during retrieval. ChromaDB is the authoritative vector
  store for semantic search.
"""
import logging
from uuid import UUID

logger = logging.getLogger(__name__)

COLLECTION_NAME = "document_chunks_gemini_768"


class ChromaEmbeddingStore:
    """
    Upsert embeddings + metadata into ChromaDB so that RetrievalService
    can find them via .search().
    """

    def __init__(self) -> None:
        self._healthy = False
        self._client = None
        self._collection = None
        self._init()

    def _init(self) -> None:
        try:
            import os
            import chromadb
            
            if os.environ.get("VERCEL") == "1":
                self._client = chromadb.EphemeralClient()
            else:
                self._client = chromadb.PersistentClient(path="./chroma_db")
                
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
            self._healthy = True
            logger.info("ChromaEmbeddingStore initialised — collection '%s'.", COLLECTION_NAME)
        except Exception as exc:
            self._healthy = False
            logger.error(
                "ChromaEmbeddingStore failed to initialise: %s. "
                "Embeddings will NOT be indexed — retrieval will return empty results.",
                exc,
                exc_info=True,
            )

    def upsert(
        self,
        chunk_ids: list[UUID],
        embeddings: list[list[float]],
        texts: list[str],
        metadatas: list[dict],
    ) -> int:
        """
        Upsert embeddings into ChromaDB.  Runs synchronously — wrap with
        asyncio.to_thread() when calling from async code.

        Args:
            chunk_ids:   UUIDs of each chunk (used as ChromaDB document IDs).
            embeddings:  Embedding vectors (one per chunk).
            texts:       Raw chunk texts (stored as ChromaDB documents).
            metadatas:   Dicts containing: chunk_id, document_id, project_id,
                         page_start, page_end, document_name.

        Returns:
            Number of items upserted, or 0 on failure.
        """
        if not self._healthy or self._collection is None:
            logger.error(
                "ChromaDB is not healthy — skipping upsert of %d chunks.", len(chunk_ids)
            )
            return 0

        if not chunk_ids:
            return 0

        n = len(chunk_ids)
        if not (len(embeddings) == len(texts) == len(metadatas) == n):
            raise ValueError(
                f"Mismatched lengths: chunk_ids={n} embeddings={len(embeddings)} "
                f"texts={len(texts)} metadatas={len(metadatas)}"
            )

        # ChromaDB requires string IDs
        str_ids = [str(cid) for cid in chunk_ids]

        try:
            self._collection.upsert(
                ids=str_ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
            )
            logger.info(
                "ChromaDB upsert complete: %d vectors indexed in collection '%s'.",
                n,
                COLLECTION_NAME,
            )
            return n
        except Exception as exc:
            logger.error("ChromaDB upsert failed: %s", exc, exc_info=True)
            raise


# Singleton — initialised once at import time (same pattern as retrieval_service)
chroma_embedding_store = ChromaEmbeddingStore()
