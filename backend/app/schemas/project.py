from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: UUID
    user_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    # Phase 15: real document and chat counts
    document_count: int = 0
    chat_count: int = 0

    model_config = ConfigDict(from_attributes=True)
