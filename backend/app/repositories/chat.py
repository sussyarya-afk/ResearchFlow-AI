"""
Repositories for ChatSession, Message, and Citation models.
"""
import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.chat import ChatSession, Message, Citation

logger = logging.getLogger(__name__)


class ChatSessionRepository:
    @staticmethod
    async def get_or_create_for_project(
        session: AsyncSession,
        project_id: UUID,
        title: str = "Research Chat",
    ) -> ChatSession:
        """Return the first (most recent) chat session for the project, or create one."""
        result = await session.execute(
            select(ChatSession)
            .where(ChatSession.project_id == project_id)
            .order_by(ChatSession.updated_at.desc())
            .limit(1)
        )
        existing = result.scalars().first()
        if existing:
            return existing

        new_session = ChatSession(project_id=project_id, title=title)
        session.add(new_session)
        await session.commit()
        await session.refresh(new_session)
        logger.info(f"Created new chat session {new_session.id} for project {project_id}")
        return new_session

    @staticmethod
    async def get_with_messages(
        session: AsyncSession, project_id: UUID
    ) -> Optional[ChatSession]:
        """Return the most recent chat session with all messages and their citations."""
        result = await session.execute(
            select(ChatSession)
            .where(ChatSession.project_id == project_id)
            .order_by(ChatSession.updated_at.desc())
            .options(
                selectinload(ChatSession.messages)
                .selectinload(Message.citations)
                .selectinload(Citation.document)
            )
            .limit(1)
        )
        return result.scalars().first()


class MessageRepository:
    @staticmethod
    async def create(
        session: AsyncSession,
        chat_session_id: UUID,
        role: str,
        content: str,
    ) -> Message:
        msg = Message(session_id=chat_session_id, role=role, content=content)
        session.add(msg)
        await session.commit()
        await session.refresh(msg)
        return msg


class CitationRepository:
    @staticmethod
    async def create_bulk(
        session: AsyncSession,
        message_id: UUID,
        sources: List[dict],
    ) -> List[Citation]:
        """
        Save a list of RAG source dicts as Citation records.
        Expected keys: document_id, page_start, excerpt, similarity.
        """
        citations = []
        for src in sources:
            doc_id = src.get("document_id")
            if not doc_id:
                continue
            try:
                citation = Citation(
                    message_id=message_id,
                    document_id=UUID(str(doc_id)),
                    chunk_id=src.get("chunk_id"),
                    page_number=src.get("page_start"),
                    page_start=src.get("page_start"),
                    page_end=src.get("page_end"),
                    excerpt=src.get("excerpt", ""),
                    confidence=float(src.get("similarity", 0.0)),
                )
                session.add(citation)
                citations.append(citation)
            except Exception as exc:
                logger.warning(f"Skipping invalid citation: {src} — {exc}")

        if citations:
            await session.commit()
            for c in citations:
                await session.refresh(c)
        return citations
