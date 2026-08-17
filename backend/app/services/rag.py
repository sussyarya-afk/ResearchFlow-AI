import asyncio
import logging
import time
from typing import Dict, Any, List

from app.services.retrieval import retrieval_service
from app.services.prompt_builder import prompt_builder
from app.services.llm.factory import LLMFactory
from app.services.llm.fallback import synthesize_grounded_answer, synthesize_grounded_stream
from app.services.event_manager import event_bus, EventType, create_timeline_event

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        pass

    async def chat(self, project_id: str, query: str, top_k: int = 5, provider=None) -> Dict[str, Any]:
        """
        Executes the RAG pipeline: retrieval → prompt building → LLM generation.
        Strictly interfaces with BaseLLMProvider via LLMFactory.
        Pass `provider` to use a specific (e.g. per-user) LLM provider.
        """
        query = query.strip()
        if not query:
            raise ValueError("Query must not be empty.")

        logger.info(f"RAG chat started | project={project_id} query_len={len(query)}")
        t0 = time.time()

        # 1. Retrieval
        t1 = time.time()
        retrieved_chunks = await asyncio.to_thread(
            retrieval_service.search, project_id, query, top_k
        )
        retrieval_ms = int((time.time() - t1) * 1000)

        # 2. Build Prompt
        prompt = prompt_builder.build_prompt(query=query, retrieved_chunks=retrieved_chunks)

        # 3. Generate Answer using resolved LLM provider or grounded fallback
        resolved_provider = provider if provider is not None else LLMFactory.get_provider()
        t2 = time.time()
        try:
            answer = await resolved_provider.generate(prompt=prompt)
        except Exception as exc:
            logger.warning(f"Provider {resolved_provider.provider_name} generate failed: {exc}. Using grounded fallback.")
            answer = synthesize_grounded_answer(query, retrieved_chunks)
            
        llm_ms = int((time.time() - t2) * 1000)

        total_ms = int((time.time() - t0) * 1000)
        logger.info(
            f"RAG chat complete | project={project_id} "
            f"chunks={len(retrieved_chunks)} retrieval_ms={retrieval_ms} "
            f"llm_ms={llm_ms} total_ms={total_ms} provider={resolved_provider.provider_name}"
        )

        # 4. Format Sources
        sources = []
        for chunk in retrieved_chunks:
            sources.append({
                "chunk_id": chunk.get("chunk_id"),
                "document_id": chunk.get("document_id"),
                "document_name": chunk.get("document_name", "Unknown Document"),
                "page_start": chunk.get("page_start", 1),
                "page_end": chunk.get("page_end", 1),
                "excerpt": chunk.get("text", ""),
                "similarity": chunk.get("similarity_score", 0.0),
            })

        return {"answer": answer, "sources": sources}

    async def chat_stream(self, project_id: str, query: str, top_k: int = 5, provider=None):
        """
        Executes the RAG pipeline and yields stream data: timeline_event, tokens, and sources.
        Pass `provider` to use a specific (e.g. per-user) LLM provider.
        Handles SSE disconnects via GeneratorExit.
        """
        query = query.strip()
        if not query:
            yield {"type": "error", "content": "Query must not be empty."}
            return

        logger.info(f"RAG stream started | project={project_id} query_len={len(query)}")
        pipeline_start = time.time()

        try:
            # 1. Retrieval Started
            retrieval_start = time.time()
            ev_retrieval_start = create_timeline_event(
                event_type=EventType.RETRIEVAL_STARTED,
                status="running",
                metadata={"query": query, "top_k": top_k},
                project_id=project_id,
            )
            yield {"type": "timeline_event", "event": ev_retrieval_start}
            await event_bus.publish(project_id, ev_retrieval_start)

            retrieved_chunks = await asyncio.to_thread(
                retrieval_service.search, project_id, query, top_k
            )
            retrieval_duration = int((time.time() - retrieval_start) * 1000)

            # Retrieval Completed
            top_similarity = max(
                [c.get("similarity_score", 0.0) for c in retrieved_chunks], default=0.0
            )
            ev_retrieval_comp = create_timeline_event(
                event_type=EventType.RETRIEVAL_COMPLETED,
                status="done",
                duration_ms=retrieval_duration,
                metadata={"chunks_found": len(retrieved_chunks), "top_similarity": round(top_similarity, 3)},
                project_id=project_id,
            )
            yield {"type": "timeline_event", "event": ev_retrieval_comp}
            await event_bus.publish(project_id, ev_retrieval_comp)

            # 2. Build Prompt
            prompt_start = time.time()
            prompt = prompt_builder.build_prompt(query=query, retrieved_chunks=retrieved_chunks)
            ev_prompt = create_timeline_event(
                event_type=EventType.PROMPT_BUILDING,
                status="done",
                duration_ms=int((time.time() - prompt_start) * 1000),
                metadata={"context_chunks": len(retrieved_chunks)},
                project_id=project_id,
            )
            yield {"type": "timeline_event", "event": ev_prompt}
            await event_bus.publish(project_id, ev_prompt)

            # 3. LLM Started
            resolved_provider = provider if provider is not None else LLMFactory.get_provider()
            llm_start = time.time()
            ev_llm_start = create_timeline_event(
                event_type=EventType.LLM_STARTED,
                status="running",
                metadata={"model": resolved_provider.model_name, "provider": resolved_provider.provider_name},
                project_id=project_id,
            )
            yield {"type": "timeline_event", "event": ev_llm_start}
            await event_bus.publish(project_id, ev_llm_start)

            token_count = 0
            try:
                async for chunk in resolved_provider.generate_stream(prompt=prompt):
                    token_count += 1
                    yield {"type": "token", "content": chunk}
            except Exception as stream_err:
                logger.warning(f"Provider {resolved_provider.provider_name} stream error: {stream_err}. Using grounded fallback stream.")
                async for chunk in synthesize_grounded_stream(query, retrieved_chunks):
                    token_count += 1
                    yield {"type": "token", "content": chunk}

            llm_duration = int((time.time() - llm_start) * 1000)

            # LLM Completed
            ev_llm_comp = create_timeline_event(
                event_type=EventType.LLM_COMPLETED,
                status="done",
                duration_ms=llm_duration,
                metadata={"tokens_generated": token_count, "provider": resolved_provider.provider_name},
                project_id=project_id,
            )
            yield {"type": "timeline_event", "event": ev_llm_comp}
            await event_bus.publish(project_id, ev_llm_comp)

            # 4. Format Sources
            sources = []
            for chunk in retrieved_chunks:
                sources.append({
                    "chunk_id": chunk.get("chunk_id"),
                    "document_id": chunk.get("document_id"),
                    "document_name": chunk.get("document_name", "Unknown Document"),
                    "page_start": chunk.get("page_start", 1),
                    "page_end": chunk.get("page_end", 1),
                    "excerpt": chunk.get("text", ""),
                    "similarity": chunk.get("similarity_score", 0.0),
                })

            yield {"type": "sources", "content": sources}

            # 5. Response Sent
            total_duration = int((time.time() - pipeline_start) * 1000)
            ev_response_sent = create_timeline_event(
                event_type=EventType.RESPONSE_SENT,
                status="done",
                duration_ms=total_duration,
                metadata={"citation_count": len(sources)},
                project_id=project_id,
            )
            yield {"type": "timeline_event", "event": ev_response_sent}
            await event_bus.publish(project_id, ev_response_sent)

            logger.info(
                f"RAG stream complete | project={project_id} "
                f"retrieval_ms={retrieval_duration} llm_ms={llm_duration} "
                f"total_ms={total_duration} tokens={token_count} "
                f"provider={resolved_provider.provider_name}"
            )

        except GeneratorExit:
            logger.info(f"RAG stream: client disconnected mid-stream | project={project_id}")
        except asyncio.CancelledError:
            logger.info(f"RAG stream cancelled | project={project_id}")
        except Exception as exc:
            logger.error(f"RAG stream error | project={project_id}: {exc}", exc_info=True)
            yield {"type": "error", "content": "An error occurred during streaming."}


rag_service = RAGService()
