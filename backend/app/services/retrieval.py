import asyncio
import logging

from app.services.embedding import embedding_service

logger = logging.getLogger(__name__)


class RetrievalService:
    """
    Semantic retrieval using ChromaDB as the vector store.
    Initialisation is lazy and failure-tolerant — a broken vector store
    does not prevent the rest of the application from starting.
    """

    def __init__(self):
        self._healthy = False
        self.chroma_client = None
        self.collection = None
        self.collection_name = "document_chunks_gemini_768"
        self._init_chroma()

    def _init_chroma(self) -> None:
        """Attempt to connect to ChromaDB. Sets _healthy flag accordingly."""
        try:
            import chromadb

            self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
            self.collection = self.chroma_client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
            )
            self._healthy = True
            logger.info("ChromaDB initialised successfully.")
        except Exception as exc:
            self._healthy = False
            logger.error(
                f"ChromaDB failed to initialise: {exc}. "
                "Retrieval will be unavailable until ChromaDB is accessible.",
                exc_info=True,
            )

    def search(self, project_id: str, query: str, top_k: int = 5) -> list[dict]:
        """
        Search for top_k most similar chunks in ChromaDB for a given project_id.
        Returns an empty list if ChromaDB is unhealthy or the query is blank.
        NOTE: This is a synchronous method — callers should wrap with asyncio.to_thread.
        """
        if not self._healthy or self.collection is None:
            logger.warning(
                f"ChromaDB is not healthy — skipping retrieval for project {project_id}. "
                "Returning empty results."
            )
            return []

        query = query.strip()
        if not query:
            return []

        logger.info(f"Retrieval: project={project_id} top_k={top_k} query_len={len(query)}")

        try:
            # Generate query embedding
            query_embedding = embedding_service.generate_query_embedding(query)
            if not query_embedding:
                logger.warning("Embedding service returned empty result for query.")
                return []

            # Query ChromaDB, filtered by project_id
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where={"project_id": project_id},
            )

            if not results["ids"] or not results["ids"][0]:
                logger.info(f"No results found for project={project_id}")
                return []

            ids = results["ids"][0]
            distances = (
                results["distances"][0]
                if results.get("distances")
                else [0.0] * len(ids)
            )
            metadatas = (
                results["metadatas"][0]
                if results.get("metadatas")
                else [{}] * len(ids)
            )
            documents = (
                results["documents"][0]
                if results.get("documents")
                else [""] * len(ids)
            )

            matches = []
            for i in range(len(ids)):
                similarity_score = 1.0 - distances[i] if distances[i] is not None else 0.0
                meta = metadatas[i]
                matches.append({
                    "chunk_id": ids[i],
                    "document_id": meta.get("document_id", ""),
                    "document_name": meta.get("document_name", "Unknown Document"),
                    "page_start": meta.get("page_start", 1),
                    "page_end": meta.get("page_end", 1),
                    "similarity_score": similarity_score,
                    "text": documents[i],
                })

            logger.info(
                f"Retrieval complete: project={project_id} "
                f"results={len(matches)} top_score={round(matches[0]['similarity_score'], 3) if matches else 0}"
            )
            return matches

        except Exception as exc:
            logger.error(f"Retrieval error for project={project_id}: {exc}", exc_info=True)
            return []


retrieval_service = RetrievalService()
