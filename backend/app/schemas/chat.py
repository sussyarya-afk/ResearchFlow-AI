from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class CitationBase(BaseModel):
    document_id: UUID
    page_number: Optional[int] = None
    excerpt: str
    confidence: float

class CitationResponse(CitationBase):
    id: UUID
    message_id: UUID

    model_config = ConfigDict(from_attributes=True)

class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    session_id: UUID
    created_at: datetime
    citations: List[CitationResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    project_id: UUID

class ChatSessionResponse(ChatSessionBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    model_config = ConfigDict(from_attributes=True)
