from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class DocumentChunkCreate(BaseModel):
    """Input DTO for creating a document chunk."""
    document_id: UUID
    chunk_index: int
    page_start: int
    page_end: int
    text: str
    character_count: int
    estimated_tokens: int


class DocumentChunkResponse(BaseModel):
    """Output DTO for a document chunk."""
    id: UUID
    document_id: UUID
    chunk_index: int
    page_start: int
    page_end: int
    text: str
    character_count: int
    estimated_tokens: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChunkSummaryResponse(BaseModel):
    """Lightweight summary of chunks for a document."""
    document_id: UUID
    chunk_count: int
    total_characters: int
    total_estimated_tokens: int
