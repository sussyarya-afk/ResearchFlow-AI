import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class PromptBuilder:
    def __init__(self):
        self.system_prompt = """You are a helpful, intelligent research assistant. 
You will be provided with some context information (retrieved from the user's documents) and a question.

YOUR INSTRUCTIONS:
1. Answer the question directly using ONLY the provided context. If the context does not contain the answer, simply state: "I do not have enough information to answer that based on the provided documents." Do not use outside knowledge.
2. Provide a clean, natural, human-like response (similar to ChatGPT).
3. Do NOT expose the retrieval process. NEVER use phrases like "Based on the analysis of your documents", "According to the retrieved chunks", or "Key Finding".
4. Do NOT output raw citation metadata, page numbers, chunk IDs, or document artifacts (e.g., "Page | 32", "(*filename*, p. 32):").
5. Structure your response with proper Markdown formatting. Use headings (###), paragraphs, bullet points, numbered lists, or tables where appropriate to make the answer easy to read.
6. Synthesize the information smoothly. Extract only what is necessary to answer the question without dumping the entire retrieved document.
7. NEVER hallucinate information.

Remember: The user only wants the clean, synthesized answer text. Metadata and citations will be handled separately by the frontend system.
"""

    def build_prompt(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """
        Builds the final prompt string for the LLM.
        """
        logger.info(f"Building prompt for query '{query}' with {len(retrieved_chunks)} chunks.")
        
        context_parts = []
        for chunk in retrieved_chunks:
            # We ONLY provide text to the LLM. We omit page numbers/filenames 
            # so the LLM isn't tempted to format them into the output.
            text = chunk.get('text', '').strip()
            if text:
                context_parts.append(text)
            
        context_str = "\n\n".join(context_parts)
        
        prompt = f"{self.system_prompt}\n\nContext Information:\n{context_str}\n\nUser Question: {query}\n\nAnswer:"
        return prompt

prompt_builder = PromptBuilder()
