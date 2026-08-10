from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project
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
