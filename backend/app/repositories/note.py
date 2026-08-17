"""
NoteRepository — CRUD operations for the Note model.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.note import Note


class NoteRepository:
    @staticmethod
    async def get_by_project(session: AsyncSession, project_id: UUID) -> List[Note]:
        result = await session.execute(
            select(Note)
            .where(Note.project_id == project_id)
            .order_by(Note.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, note_id: UUID) -> Optional[Note]:
        result = await session.execute(select(Note).where(Note.id == note_id))
        return result.scalars().first()

    @staticmethod
    async def create(session: AsyncSession, project_id: UUID, content: str) -> Note:
        note = Note(project_id=project_id, content=content)
        session.add(note)
        await session.commit()
        await session.refresh(note)
        return note

    @staticmethod
    async def update(session: AsyncSession, note: Note, content: str) -> Note:
        note.content = content
        session.add(note)
        await session.commit()
        await session.refresh(note)
        return note

    @staticmethod
    async def delete(session: AsyncSession, note: Note) -> None:
        await session.delete(note)
        await session.commit()
