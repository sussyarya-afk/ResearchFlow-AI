from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.repositories.project import ProjectRepository

class ProjectService:
    @staticmethod
    async def get_projects(session: AsyncSession, user_id: UUID) -> List[Project]:
        return await ProjectRepository.get_multi(session, user_id)

    @staticmethod
    async def get_project(session: AsyncSession, project_id: UUID, user_id: UUID) -> Project:
        project = await ProjectRepository.get_by_id(session, project_id, user_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found or not accessible"
            )
        return project

    @staticmethod
    async def create_project(session: AsyncSession, project_in: ProjectCreate, user_id: UUID) -> Project:
        return await ProjectRepository.create(session, project_in, user_id)

    @staticmethod
    async def update_project(session: AsyncSession, project_id: UUID, project_in: ProjectUpdate, user_id: UUID) -> Project:
        project = await ProjectService.get_project(session, project_id, user_id)
        return await ProjectRepository.update(session, project, project_in)

    @staticmethod
    async def delete_project(session: AsyncSession, project_id: UUID, user_id: UUID) -> None:
        project = await ProjectService.get_project(session, project_id, user_id)
        await ProjectRepository.delete(session, project)
