"""
ProjectRepository — database queries for projects.
Phase 15: added get_counts_for_project() for real document + chat metrics.
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.project import Project
from app.models.document import Document
from app.models.chat import ChatSession
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectRepository:
    @staticmethod
    async def get_multi(session: AsyncSession, user_id: UUID) -> List[Project]:
        result = await session.execute(
            select(Project)
            .where(Project.user_id == user_id)
            .order_by(Project.updated_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, project_id: UUID, user_id: UUID) -> Optional[Project]:
        result = await session.execute(
            select(Project)
            .where(Project.id == project_id)
            .where(Project.user_id == user_id)
        )
        return result.scalars().first()

    @staticmethod
    async def create(session: AsyncSession, project_in: ProjectCreate, user_id: UUID) -> Project:
        db_project = Project(
            user_id=user_id,
            name=project_in.name,
            description=project_in.description
        )
        session.add(db_project)
        await session.commit()
        await session.refresh(db_project)
        return db_project

    @staticmethod
    async def update(session: AsyncSession, db_project: Project, project_in: ProjectUpdate) -> Project:
        update_data = project_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)

        session.add(db_project)
        await session.commit()
        await session.refresh(db_project)
        return db_project

    @staticmethod
    async def delete(session: AsyncSession, db_project: Project) -> None:
        await session.delete(db_project)
        await session.commit()

    @staticmethod
    async def get_counts_for_project(
        session: AsyncSession, project_id: UUID
    ) -> dict:
        """Phase 15: return real document and chat-session counts for a project."""
        doc_count_result = await session.execute(
            select(func.count(Document.id)).where(Document.project_id == project_id)
        )
        doc_count = doc_count_result.scalar() or 0

        chat_count_result = await session.execute(
            select(func.count(ChatSession.id)).where(ChatSession.project_id == project_id)
        )
        chat_count = chat_count_result.scalar() or 0

        return {"document_count": doc_count, "chat_count": chat_count}
