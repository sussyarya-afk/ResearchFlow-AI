import uuid
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, DateTime
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    # Phase 8: per-user LLM provider selection (gemini | nvidia | ollama)
    llm_provider: Mapped[str] = mapped_column(String(50), default="gemini", server_default="gemini")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="user", cascade="all, delete-orphan")
