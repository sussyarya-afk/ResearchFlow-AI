"""
ProjectService — business logic for project management.
Phase 15: get_projects and get_project now attach real document/chat counts.
"""
from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.repositories.project import ProjectRepository


def _attach_counts(project: Project, counts: dict) -> Project:
    """Attach count metadata directly onto the ORM object for serialization."""
    project.document_count = counts.get("document_count", 0)
    project.chat_count = counts.get("chat_count", 0)
    return project


class ProjectService:
    @staticmethod
    async def get_projects(session: AsyncSession, user_id: UUID) -> List[Project]:
        """Return all projects for user with real document and chat counts."""
        projects = await ProjectRepository.get_multi(session, user_id)
        for project in projects:
            counts = await ProjectRepository.get_counts_for_project(session, project.id)
            _attach_counts(project, counts)
        return projects

    @staticmethod
    async def get_project(session: AsyncSession, project_id: UUID, user_id: UUID) -> Project:
        """Get a specific project with real counts. Raises 404 if not found."""
        project = await ProjectRepository.get_by_id(session, project_id, user_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not accessible"
            )
        counts = await ProjectRepository.get_counts_for_project(session, project.id)
        _attach_counts(project, counts)
        return project

    @staticmethod
    async def create_project(session: AsyncSession, project_in: ProjectCreate, user_id: UUID) -> Project:
        project = await ProjectRepository.create(session, project_in, user_id)
        project.document_count = 0
        project.chat_count = 0
        return project

    @staticmethod
    async def update_project(
        session: AsyncSession, project_id: UUID, project_in: ProjectUpdate, user_id: UUID
    ) -> Project:
        project = await ProjectService.get_project(session, project_id, user_id)
        return await ProjectRepository.update(session, project, project_in)

    @staticmethod
    async def delete_project(session: AsyncSession, project_id: UUID, user_id: UUID) -> None:
        project = await ProjectService.get_project(session, project_id, user_id)
        await ProjectRepository.delete(session, project)
