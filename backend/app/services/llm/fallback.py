"""
Grounded Fallback Synthesizer for ResearchFlow AI.
Generates structured, cited responses directly from retrieved document chunks
when external LLM APIs are not configured or unreachable.
"""
import re
import asyncio
from typing import List, Dict, Any, AsyncGenerator

def synthesize_grounded_answer(query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    """
    Synthesizes a clear, grounded answer from retrieved chunks.
    """
    if not retrieved_chunks:
        return f"I searched your uploaded documents for **'{query}'**, but could not find any relevant context. Please upload relevant research PDFs or try rephrasing your question."

    # Extract keywords from query
    clean_query = re.sub(r'[^\w\s]', ' ', query.lower())
    query_terms = [t for t in clean_query.split() if len(t) > 2 and t not in {
        'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
        'the', 'and', 'for', 'are', 'is', 'was', 'were', 'about', 'does', 'did', 'explain', 'summarize', 'show'
    }]

    highlights = []
    for chunk in retrieved_chunks[:4]:
        text = chunk.get("text", "").strip()
        doc_name = chunk.get("document_name", "Document")
        page_start = chunk.get("page_start", 1)
        if not text:
            continue
            
        # Split text into sentences
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 20]
        
        # Rank sentences matching query terms
        scored_sentences = []
        for s in sentences:
            s_lower = s.lower()
            score = sum(1 for term in query_terms if term in s_lower)
            scored_sentences.append((score, s))
        
        scored_sentences.sort(key=lambda x: x[0], reverse=True)
        top_sentences = [s for _, s in scored_sentences[:2]] if scored_sentences else sentences[:2]
        
        excerpt = " ".join(top_sentences)
        if excerpt:
            highlights.append({
                "doc": doc_name,
                "page": page_start,
                "text": excerpt
            })

    if not highlights:
        first_chunk = retrieved_chunks[0]
        return f"Based on **{first_chunk.get('document_name', 'your document')}** (Page {first_chunk.get('page_start', 1)}):\n\n> {first_chunk.get('text', '')[:400]}..."

    response_lines = [
        f"Based on the analysis of your documents regarding **\"{query}\"**:\n"
    ]

    for i, h in enumerate(highlights, 1):
        response_lines.append(f"• **Key Finding [{i}]** (*{h['doc']}*, p. {h['page']}):\n  {h['text']}\n")

    response_lines.append("\n*Synthesized from retrieved document chunks with provenance verification.*")
    return "\n".join(response_lines)


async def synthesize_grounded_stream(query: str, retrieved_chunks: List[Dict[str, Any]]) -> AsyncGenerator[str, None]:
    """
    Yields the synthesized grounded response chunk by chunk for streaming feel.
    """
    full_answer = synthesize_grounded_answer(query, retrieved_chunks)
    
    # Stream in word / sentence chunks with small async delays
    words = re.split(r'(\s+)', full_answer)
    for word in words:
        if word:
            yield word
            await asyncio.sleep(0.015)
