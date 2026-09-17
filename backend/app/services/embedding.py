import logging
import time
from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for generating semantic embeddings using Google Gemini."""
    
    def __init__(self):
        self.model_name = "text-embedding-004"
        self.expected_dimension = 768
        self.client = None

    def load_model(self):
        """Configure the Gemini API for embeddings."""
        logger.info(f"Configuring Gemini embedding model: {self.model_name}...")
        start_time = time.time()
        try:
            if not settings.GEMINI_API_KEY:
                logger.error("GEMINI_API_KEY is not set. Embeddings cannot be generated.")
                raise ValueError("GEMINI_API_KEY is not set.")
                
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            logger.info(f"Gemini API configured for embeddings in {time.time() - start_time:.2f}s")
        except Exception as e:
            logger.error(f"Failed to configure Gemini embedding model: {e}")
            raise e

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Backward compatibility wrapper that defaults to RETRIEVAL_DOCUMENT.
        """
        return self.generate_document_embeddings(texts)

    def generate_document_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for document chunks using Gemini with RETRIEVAL_DOCUMENT task type.
        """
        if not self.client:
            logger.error("Embedding model not configured. Call load_model() first.")
            raise RuntimeError("Embedding model is not configured.")

        if not texts:
            return []

        logger.info(f"Generating Gemini document embeddings for {len(texts)} chunks...")
        start_time = time.time()
        try:
            response = self.client.models.embed_content(
                model=self.model_name,
                contents=texts,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_DOCUMENT",
                    output_dimensionality=self.expected_dimension,
                )
            )
            
            embeddings = [emb.values for emb in response.embeddings]
            
            if embeddings and len(embeddings[0]) != self.expected_dimension:
                logger.error(f"Embedding dimension mismatch: expected {self.expected_dimension}, got {len(embeddings[0])}")
                raise ValueError(f"Generated embeddings have incorrect dimension: {len(embeddings[0])}")
                
            logger.info(f"Successfully generated {len(texts)} document embeddings in {time.time() - start_time:.2f}s")
            return embeddings
        except Exception as e:
            logger.error(f"Error generating document embeddings with Gemini: {e}")
            raise e

    def generate_query_embedding(self, text: str) -> list[float]:
        """
        Generate an embedding for a user query using Gemini with RETRIEVAL_QUERY task type.
        """
        if not self.client:
            logger.error("Embedding model not configured. Call load_model() first.")
            raise RuntimeError("Embedding model is not configured.")

        if not text:
            return []

        logger.info("Generating Gemini query embedding...")
        start_time = time.time()
        try:
            response = self.client.models.embed_content(
                model=self.model_name,
                contents=text,
                config=types.EmbedContentConfig(
                    task_type="RETRIEVAL_QUERY",
                    output_dimensionality=self.expected_dimension,
                )
            )
            
            embedding = response.embeddings[0].values
            
            if len(embedding) != self.expected_dimension:
                logger.error(f"Embedding dimension mismatch: expected {self.expected_dimension}, got {len(embedding)}")
                raise ValueError(f"Generated embeddings have incorrect dimension: {len(embedding)}")
                
            logger.info(f"Successfully generated query embedding in {time.time() - start_time:.2f}s")
            return embedding
        except Exception as e:
            logger.error(f"Error generating query embedding with Gemini: {e}")
            raise e

# Global singleton instance
embedding_service = EmbeddingService()
