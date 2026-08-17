from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class NoteBase(BaseModel):
    content: str

class NoteCreate(NoteBase):
    project_id: Optional[UUID] = None  # optional — project_id comes from URL in API

class NoteResponse(NoteBase):
    id: UUID
    project_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
