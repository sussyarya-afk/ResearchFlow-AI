from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class NoteBase(BaseModel):
    content: str

class NoteCreate(NoteBase):
    project_id: UUID

class NoteResponse(NoteBase):
    id: UUID
    project_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
