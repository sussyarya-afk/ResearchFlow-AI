import logging
import time

logger = logging.getLogger(__name__)

class EmbeddingService:
    """Service for generating semantic embeddings using sentence-transformers."""
    
    def __init__(self):
        self.model_name = "all-MiniLM-L6-v2"
        self.expected_dimension = 384
        self.model = None

    def load_model(self):
        """Load the embedding model into memory."""
        logger.info(f"Loading embedding model: {self.model_name}...")
        start_time = time.time()
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Embedding model {self.model_name} loaded in {time.time() - start_time:.2f}s")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise e

    def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for a list of texts.
        Returns a list of lists (vectors) of floats.
        """
        if not self.model:
            logger.error("Embedding model not loaded. Call load_model() first.")
            raise RuntimeError("Embedding model is not loaded.")

        if not texts:
            return []

        logger.info(f"Generating embeddings for {len(texts)} chunks...")
        start_time = time.time()
        try:
            # Output is typically a numpy array
            embeddings_np = self.model.encode(texts, convert_to_numpy=True)
            embeddings = embeddings_np.tolist()
            
            if embeddings and len(embeddings[0]) != self.expected_dimension:
                logger.error(f"Embedding dimension mismatch: expected {self.expected_dimension}, got {len(embeddings[0])}")
                raise ValueError(f"Generated embeddings have incorrect dimension: {len(embeddings[0])}")
                
            logger.info(f"Successfully generated {len(texts)} embeddings in {time.time() - start_time:.2f}s")
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise e

# Global singleton instance
embedding_service = EmbeddingService()
