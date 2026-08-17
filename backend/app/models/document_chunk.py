import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Index, JSON
from app.models.base import Base

class DocumentChunk(Base):
    """A text chunk extracted from a processed document."""
    __tablename__ = "document_chunks"

    __table_args__ = (
        Index("ix_document_chunks_doc_idx", "document_id", "chunk_index"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    chunk_index: Mapped[int] = mapped_column(Integer, default=0)
    page_start: Mapped[int] = mapped_column(Integer, default=1)
    page_end: Mapped[int] = mapped_column(Integer, default=1)
    text: Mapped[str] = mapped_column(Text, default="")
    character_count: Mapped[int] = mapped_column(Integer, default=0)
    estimated_tokens: Mapped[int] = mapped_column(Integer, default=0)
    embedding: Mapped[list[float]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
