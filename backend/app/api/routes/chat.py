"""
Chat routes.

Phase 3 fix: project ownership is verified BEFORE any RAG execution.
Phase 7 fix: messages and citations are persisted to the database.
             A history endpoint is added to reload prior conversation.
"""
import asyncio
import json
import logging
from typing import List, Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.rag import rag_service
from app.services.project import ProjectService
from app.services.llm.factory import LLMFactory
from app.repositories.chat import ChatSessionRepository, MessageRepository, CitationRepository
from app.schemas.chat import ChatSessionResponse

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


class CitationOut(BaseModel):
    document_id: str
    document_name: str
    chunk_id: str
    page_start: int
    page_end: int
    excerpt: str
    similarity: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[CitationOut]


# ── Helper: resolve per-user LLM provider ───────────────────────────────────

def _get_provider_for_user(user: User):
    """Return the LLM provider configured for this specific user."""
    provider_name = getattr(user, "llm_provider", None) or "gemini"
    return LLMFactory.get_provider(provider_name)


# ── POST /{project_id}/chat ───────────────────────────────────────────────────

@router.post("/{project_id}/chat", response_model=ChatResponse)
async def chat_with_project(
    project_id: UUID,
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    """Send a query and get a RAG-grounded answer. Persists the exchange."""
    # Phase 3: verify ownership — raises 404 if not found/accessible
    await ProjectService.get_project(db, project_id, current_user.id)

    logger.info(
        f"Chat request | project={project_id} user={current_user.id} "
        f"query_len={len(request.query.strip())} provider={getattr(current_user, 'llm_provider', 'gemini')}"
    )

    try:
        provider = _get_provider_for_user(current_user)
        result = await rag_service.chat(
            project_id=str(project_id),
            query=request.query,
            provider=provider,
        )

        # Phase 7: persist
        chat_session = await ChatSessionRepository.get_or_create_for_project(db, project_id)
        user_msg = await MessageRepository.create(db, chat_session.id, "user", request.query.strip())
        ai_msg = await MessageRepository.create(db, chat_session.id, "ai", result["answer"])
        await CitationRepository.create_bulk(db, ai_msg.id, result["sources"])

        return ChatResponse(answer=result["answer"], sources=result["sources"])
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as exc:
        logger.error(f"Chat error | project={project_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during chat generation.",
        )


# ── POST /{project_id}/chat/stream ────────────────────────────────────────────

@router.post("/{project_id}/chat/stream")
async def chat_with_project_stream(
    project_id: UUID,
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    """
    Streaming RAG via Server-Sent Events.
    Persists the complete exchange after streaming finishes.
    """
    # Phase 3: verify ownership
    await ProjectService.get_project(db, project_id, current_user.id)

    logger.info(
        f"Stream chat | project={project_id} user={current_user.id} "
        f"query_len={len(request.query.strip())}"
    )

    provider = _get_provider_for_user(current_user)

    async def event_generator():
        full_answer_parts: list[str] = []
        final_sources: list[dict] = []

        try:
            async for data in rag_service.chat_stream(
                project_id=str(project_id),
                query=request.query,
                provider=provider,
            ):
                payload = json.dumps(data)
                yield f"data: {payload}\n\n"

                # Collect for persistence
                if data.get("type") == "token":
                    full_answer_parts.append(data.get("content", ""))
                elif data.get("type") == "sources":
                    final_sources = data.get("content", [])

        except asyncio.CancelledError:
            logger.info(f"Stream cancelled (client disconnect) | project={project_id}")
            return
        except GeneratorExit:
            logger.info(f"Stream disconnected (GeneratorExit) | project={project_id}")
            return
        except Exception as exc:
            logger.error(f"Stream error | project={project_id}: {exc}", exc_info=True)
            error_payload = json.dumps({"type": "error", "content": "Streaming chat failed."})
            yield f"data: {error_payload}\n\n"
            return

        # Phase 7: persist after stream completes
        try:
            full_answer = "".join(full_answer_parts)
            if full_answer:
                chat_session = await ChatSessionRepository.get_or_create_for_project(db, project_id)
                user_msg = await MessageRepository.create(db, chat_session.id, "user", request.query.strip())
                ai_msg = await MessageRepository.create(db, chat_session.id, "ai", full_answer)
                await CitationRepository.create_bulk(db, ai_msg.id, final_sources)
                logger.info(
                    f"Persisted stream exchange | project={project_id} "
                    f"answer_chars={len(full_answer)} citations={len(final_sources)}"
                )
        except Exception as persist_exc:
            # Non-fatal — don't break the stream response
            logger.error(f"Failed to persist stream exchange: {persist_exc}", exc_info=True)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ── GET /{project_id}/chat/history ────────────────────────────────────────────

@router.get("/{project_id}/chat/history", response_model=ChatSessionResponse)
async def get_chat_history(
    project_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    """
    Return the saved chat history for a project.
    Returns an empty session response if no history exists yet.
    """
    # Verify ownership
    await ProjectService.get_project(db, project_id, current_user.id)

    chat_session = await ChatSessionRepository.get_with_messages(db, project_id)
    if not chat_session:
        # Return empty session representation — no 404, just no messages yet
        return ChatSessionResponse(
            id=UUID("00000000-0000-0000-0000-000000000000"),
            project_id=project_id,
            title="Research Chat",
            messages=[],
            created_at=__import__("datetime").datetime.utcnow(),
            updated_at=__import__("datetime").datetime.utcnow(),
        )

    return ChatSessionResponse.model_validate(chat_session)
