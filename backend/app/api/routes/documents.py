import logging
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.core.config import MAX_UPLOAD_SIZE_BYTES, settings
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.document import DocumentResponse
from app.schemas.chunk import DocumentChunkResponse, ChunkSummaryResponse
from app.services.document import DocumentService
from app.services.chunk import ChunkService
from app.services.project import ProjectService

logger = logging.getLogger(__name__)

router = APIRouter()
global_router = APIRouter()


@global_router.get("", response_model=List[DocumentResponse])
async def get_all_user_documents(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieve all documents belonging to the current user across all projects."""
    return await DocumentService.get_user_documents(session, current_user.id)


@global_router.get("/{document_id}/page/{page}")
async def get_document_page(
    document_id: UUID,
    page: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieve text of a specific page of a document."""
    return await DocumentService.get_document_page(session, document_id, page, current_user.id)


@global_router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Download original PDF document file."""
    file_path, file_name = await DocumentService.get_document_file(session, document_id, current_user.id)
    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type="application/pdf",
    )


@global_router.get("/{document_id}/file")
async def view_document_file(
    document_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Serve PDF document for inline browser viewing."""
    file_path, file_name = await DocumentService.get_document_file(session, document_id, current_user.id)
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={file_name}"}
    )


@router.get("/{project_id}/documents", response_model=List[DocumentResponse])
async def read_documents(
    project_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieve all documents for a project."""
    return await DocumentService.get_documents(session, project_id, current_user.id)


@router.post(
    "/{project_id}/documents",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    project_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Upload and process a PDF document for a project.

    Enforces:
    - PDF-only uploads (HTTP 415 for other types)
    - Maximum file size of {MAX_UPLOAD_SIZE_MB} MB (HTTP 413)
    """
    # Pre-flight: reject clearly wrong content types before reading the full body
    content_type = (file.content_type or "").lower()
    filename = file.filename or ""
    if content_type and content_type not in {"application/pdf", "application/octet-stream", ""}:
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type '{content_type}'. Only PDF files are accepted.",
            )

    logger.info(
        f"Upload request | project={project_id} user={current_user.id} "
        f"filename={filename!r} content_type={content_type!r}"
    )

    return await DocumentService.upload_document(session, project_id, current_user.id, file)


@router.delete("/{project_id}/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    project_id: UUID,
    document_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete a specific document."""
    await DocumentService.delete_document(session, document_id, project_id, current_user.id)


@router.get(
    "/{project_id}/documents/{document_id}/chunks",
    response_model=List[DocumentChunkResponse],
)
async def read_document_chunks(
    project_id: UUID,
    document_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieve all text chunks for a document, ordered by chunk_index."""
    # Phase 4: verify project ownership AND that document belongs to this project
    await ProjectService.get_project(session, project_id, current_user.id)
    document = await DocumentService.get_document_by_id_in_project(session, document_id, project_id)
    return await ChunkService.get_chunks(session, document.id)


@router.get(
    "/{project_id}/documents/{document_id}/chunks/summary",
    response_model=ChunkSummaryResponse,
)
async def read_chunk_summary(
    project_id: UUID,
    document_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Get chunk summary statistics for a document."""
    # Phase 4: verify project ownership AND that document belongs to this project
    await ProjectService.get_project(session, project_id, current_user.id)
    document = await DocumentService.get_document_by_id_in_project(session, document_id, project_id)
    return await ChunkService.get_chunk_summary(session, document.id)
