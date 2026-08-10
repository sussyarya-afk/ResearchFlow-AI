from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional, Any
from uuid import UUID
from datetime import datetime

class DocumentBase(BaseModel):
    name: str
    type: str

class DocumentCreate(DocumentBase):
    project_id: UUID
    size: int
    s3_key: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: UUID
    project_id: UUID
    pages: int
    size: int
    s3_key: Optional[str]
    processing_status: str
    processed_at: Optional[datetime]
    created_at: datetime
    chunk_count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def _extract_chunk_count(cls, data: Any) -> Any:
        """Pull _chunk_count from the ORM model if present."""
        if hasattr(data, "_chunk_count"):
            # data is an ORM model instance
            count = data._chunk_count
            # We need to let pydantic handle the rest via from_attributes,
            # so we convert to dict first
            obj = {
                "id": data.id,
                "project_id": data.project_id,
                "name": data.name,
                "type": data.type,
                "pages": data.pages,
                "size": data.size,
                "s3_key": data.s3_key,
                "processing_status": data.processing_status,
                "processed_at": data.processed_at,
                "created_at": data.created_at,
                "chunk_count": count,
            }
            return obj
        return data
