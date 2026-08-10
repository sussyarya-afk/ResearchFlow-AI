import asyncio
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Annotated
from uuid import UUID

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.rag import rag_service

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


class Citation(BaseModel):
    document_id: str
    document_name: str
    chunk_id: str
    page_start: int
    page_end: int
    excerpt: str
    similarity: float


class ChatResponse(BaseModel):
    answer: str
    sources: List[Citation]


@router.post("/{project_id}/chat", response_model=ChatResponse)
async def chat_with_project(
    project_id: UUID,
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Send a query to the project's documents and get an AI response using RAG."""
    logger.info(
        f"Chat request | project={project_id} user={current_user.id} "
        f"query_len={len(request.query.strip())}"
    )
    try:
        result = await rag_service.chat(project_id=str(project_id), query=request.query)
        return ChatResponse(answer=result["answer"], sources=result["sources"])
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as exc:
        logger.error(f"Chat error | project={project_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during chat: {exc}",
        )


@router.post("/{project_id}/chat/stream")
async def chat_with_project_stream(
    project_id: UUID,
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Send a query to the project's documents and get a streaming AI response
    via Server-Sent Events (SSE).
    """
    logger.info(
        f"Stream chat request | project={project_id} user={current_user.id} "
        f"query_len={len(request.query.strip())}"
    )

    async def event_generator():
        try:
            async for data in rag_service.chat_stream(
                project_id=str(project_id), query=request.query
            ):
                payload = json.dumps(data)
                yield f"data: {payload}\n\n"
        except asyncio.CancelledError:
            logger.info(
                f"Stream chat cancelled (client disconnect) | project={project_id} user={current_user.id}"
            )
        except GeneratorExit:
            logger.info(
                f"Stream chat disconnected (GeneratorExit) | project={project_id} user={current_user.id}"
            )
        except Exception as exc:
            logger.error(f"Stream chat error | project={project_id}: {exc}", exc_info=True)
            error_payload = json.dumps({"type": "error", "content": f"Streaming error: {exc}"})
            yield f"data: {error_payload}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
