from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.document import Document
from app.schemas.document import DocumentCreate

class DocumentRepository:
    @staticmethod
    async def get_multi_by_project(session: AsyncSession, project_id: UUID) -> List[Document]:
        result = await session.execute(
            select(Document)
            .where(Document.project_id == project_id)
            .order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(session: AsyncSession, document_id: UUID) -> Optional[Document]:
        result = await session.execute(
            select(Document).where(Document.id == document_id)
        )
        return result.scalars().first()

    @staticmethod
    async def create(session: AsyncSession, document_in: DocumentCreate) -> Document:
        db_document = Document(
            project_id=document_in.project_id,
            name=document_in.name,
            type=document_in.type,
            size=document_in.size,
            s3_key=document_in.s3_key,
            processing_status="Pending"
        )
        session.add(db_document)
        await session.commit()
        await session.refresh(db_document)
        return db_document

    @staticmethod
    async def update_status(session: AsyncSession, db_document: Document, status: str, pages: int = 0, processed_at=None) -> Document:
        db_document.processing_status = status
        db_document.pages = pages
        if processed_at:
            db_document.processed_at = processed_at
            
        session.add(db_document)
        await session.commit()
        await session.refresh(db_document)
        return db_document

    @staticmethod
    async def delete(session: AsyncSession, db_document: Document) -> None:
        await session.delete(db_document)
        await session.commit()
