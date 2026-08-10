import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.repositories.project import ProjectRepository
from app.services.retrieval import retrieval_service

logger = logging.getLogger(__name__)

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
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
    current_user = Depends(get_current_user)
):
    """
    Search for semantically similar chunks in a project.
    """
    # Validate project ownership
    project = await ProjectRepository.get(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    logger.info(f"User {current_user.id} searching in project {project_id} with query: {request.query}")
    
    try:
        matches = retrieval_service.search(
            project_id=str(project_id),
            query=request.query,
            top_k=request.top_k
        )
        return SearchResponse(results=matches)
    except Exception as e:
        logger.error(f"Search failed for project {project_id}: {e}")
        # Return empty list on failure to prevent breaking the UI
        return SearchResponse(results=[])
