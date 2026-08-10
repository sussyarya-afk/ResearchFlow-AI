import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class PromptBuilder:
    def __init__(self):
        # A simple template emphasizing accurate answering from sources
        self.system_prompt = """You are a helpful research assistant. 
You will be provided with some context information (retrieved from the user's documents) and a question.
Your task is to answer the question based *only* on the provided context. 
If the context does not contain the answer, simply say "I do not have enough information to answer that based on the provided documents."
Do not use outside knowledge.
"""

    def build_prompt(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """
        Builds the final prompt string for the LLM.
        """
        logger.info(f"Building prompt for query '{query}' with {len(retrieved_chunks)} chunks.")
        
        context_parts = []
        for i, chunk in enumerate(retrieved_chunks):
            # chunk has text, document_id, etc.
            text = chunk.get('text', '')
            context_parts.append(f"--- Chunk {i+1} ---\n{text}\n")
            
        context_str = "\n".join(context_parts)
        
        prompt = f"{self.system_prompt}\n\nContext Information:\n{context_str}\n\nUser Question: {query}\n\nAnswer:"
        return prompt

prompt_builder = PromptBuilder()
