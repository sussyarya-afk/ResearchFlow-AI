"""
Notes routes — full CRUD with project ownership validation.
Phase 10: implements the missing Notes API.
"""
import logging
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.note import NoteCreate, NoteResponse
from app.services.project import ProjectService
from app.repositories.note import NoteRepository

logger = logging.getLogger(__name__)

router = APIRouter()


class NoteUpdate:
    def __init__(self, content: str):
        self.content = content

from pydantic import BaseModel

class NoteUpdateRequest(BaseModel):
    content: str


@router.get("/{project_id}/notes", response_model=List[NoteResponse])
async def list_notes(
    project_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """List all notes for a project."""
    await ProjectService.get_project(session, project_id, current_user.id)
    notes = await NoteRepository.get_by_project(session, project_id)
    return [NoteResponse.model_validate(n) for n in notes]


@router.post("/{project_id}/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    project_id: UUID,
    note_in: NoteCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new note in a project."""
    await ProjectService.get_project(session, project_id, current_user.id)
    note = await NoteRepository.create(session, project_id, note_in.content)
    return NoteResponse.model_validate(note)


@router.put("/{project_id}/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    project_id: UUID,
    note_id: UUID,
    note_in: NoteUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Update an existing note."""
    await ProjectService.get_project(session, project_id, current_user.id)
    note = await NoteRepository.get_by_id(session, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Note does not belong to this project")
    updated = await NoteRepository.update(session, note, note_in.content)
    return NoteResponse.model_validate(updated)


@router.delete("/{project_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    project_id: UUID,
    note_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete a note."""
    await ProjectService.get_project(session, project_id, current_user.id)
    note = await NoteRepository.get_by_id(session, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Note does not belong to this project")
    await NoteRepository.delete(session, note)
