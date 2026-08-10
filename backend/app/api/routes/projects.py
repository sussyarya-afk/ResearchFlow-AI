import asyncio
import json
import logging

from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.project import ProjectService
from app.services.event_manager import event_bus

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
async def read_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieve all projects for the current user."""
    return await ProjectService.get_projects(session, current_user.id)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new project for the current user."""
    return await ProjectService.create_project(session, project_in, current_user.id)


@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project(
    project_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a specific project by ID."""
    return await ProjectService.get_project(session, project_id, current_user.id)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Update a specific project."""
    return await ProjectService.update_project(session, project_id, project_in, current_user.id)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete a specific project."""
    await ProjectService.delete_project(session, project_id, current_user.id)


@router.get("/{project_id}/events")
async def stream_project_events(
    project_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Stream live timeline events for a project via Server-Sent Events (SSE).
    The connection is cleaned up automatically on client disconnect.
    """
    proj_id_str = str(project_id)
    queue = event_bus.subscribe(proj_id_str)
    logger.info(f"SSE client connected | project={proj_id_str} user={current_user.id}")

    async def event_generator():
        try:
            while True:
                event = await queue.get()
                payload = json.dumps({"type": "timeline_event", "event": event})
                yield f"data: {payload}\n\n"
        except asyncio.CancelledError:
            # Client disconnected — this is normal, not an error
            logger.info(
                f"SSE client disconnected (CancelledError) | project={proj_id_str} user={current_user.id}"
            )
        except GeneratorExit:
            logger.info(
                f"SSE client disconnected (GeneratorExit) | project={proj_id_str} user={current_user.id}"
            )
        except Exception as exc:
            logger.error(
                f"SSE error | project={proj_id_str} user={current_user.id}: {exc}",
                exc_info=True,
            )
        finally:
            event_bus.unsubscribe(proj_id_str, queue)
            logger.info(f"SSE queue cleaned up | project={proj_id_str}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")
