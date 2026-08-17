import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.project import ProjectService
from app.services.retrieval import retrieval_service

logger = logging.getLogger(__name__)

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    document_name: str = "Unknown Document"
    page_start: int
    page_end: int
    similarity_score: float
    text: str


class SearchResponse(BaseModel):
    results: List[SearchResult]


@router.post("/{project_id}/search", response_model=SearchResponse)
async def search_project(
    project_id: UUID,
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search for semantically similar chunks in a project.
    Verifies project ownership before executing retrieval.
    """
    # Phase 2 fix: use ProjectService which calls get_by_id and checks user_id ownership
    await ProjectService.get_project(db, project_id, current_user.id)

    query = request.query.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Query must not be empty.",
        )

    logger.info(f"Search | project={project_id} user={current_user.id} query_len={len(query)}")

    try:
        matches = await __import__("asyncio").to_thread(
            retrieval_service.search,
            project_id=str(project_id),
            query=query,
            top_k=request.top_k,
        )
        return SearchResponse(results=matches)
    except Exception as exc:
        logger.error(f"Search failed for project {project_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Search failed. Please try again.",
        )
