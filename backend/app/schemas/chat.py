from pydantic import BaseModel, ConfigDict, model_validator
from typing import Any
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CitationResponse(BaseModel):
    id: UUID
    document_id: UUID
    document_name: str = "Document"
    chunk_id: Optional[str] = None
    page_number: Optional[int] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    excerpt: str
    confidence: float
    similarity: float = 0.0

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def _shape_from_orm(cls, data: Any) -> Any:
        if hasattr(data, "document_id"):
            page_start = getattr(data, "page_start", None) or getattr(data, "page_number", None)
            page_end = getattr(data, "page_end", None) or page_start
            confidence = getattr(data, "confidence", 0.0)
            document = getattr(data, "document", None)
            return {
                "id": data.id,
                "document_id": data.document_id,
                "document_name": getattr(document, "name", "Document"),
                "chunk_id": getattr(data, "chunk_id", None),
                "page_number": getattr(data, "page_number", None),
                "page_start": page_start,
                "page_end": page_end,
                "excerpt": data.excerpt,
                "confidence": confidence,
                "similarity": confidence,
            }
        return data


class MessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    created_at: datetime
    citations: List[CitationResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ChatSessionResponse(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    messages: List[MessageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
