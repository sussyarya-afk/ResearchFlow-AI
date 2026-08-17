import os
import fitz
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Tuple
from uuid import UUID

from fastapi import HTTPException, status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import MAX_UPLOAD_SIZE_BYTES, settings
from app.models.document import Document
from app.schemas.document import DocumentCreate
from app.repositories.document import DocumentRepository
from app.repositories.chunk import ChunkRepository
from app.services.project import ProjectService
from app.services.chunk import ChunkService

logger = logging.getLogger(__name__)

# Allowed MIME types for upload
ALLOWED_CONTENT_TYPES = {"application/pdf"}
ALLOWED_EXTENSIONS = {".pdf"}

UPLOAD_DIR = "uploads"


def _safe_filename(filename: str) -> str:
    """
    Return only the final path component of a filename to prevent path traversal.
    e.g. '../../etc/passwd' → 'passwd'
    """
    return Path(filename).name or "upload"


class DocumentService:
    @staticmethod
    async def get_user_documents(session: AsyncSession, user_id: UUID) -> List[Document]:
        documents = await DocumentRepository.get_multi_by_user(session, user_id)
        for doc in documents:
            doc._chunk_count = await ChunkRepository.count_by_document(session, doc.id)
        return documents

    @staticmethod
    async def get_documents(session: AsyncSession, project_id: UUID, user_id: UUID) -> List[Document]:
        # Validate project ownership
        await ProjectService.get_project(session, project_id, user_id)
        documents = await DocumentRepository.get_multi_by_project(session, project_id)

        # Attach chunk counts for response serialization
        for doc in documents:
            doc._chunk_count = await ChunkRepository.count_by_document(session, doc.id)
        return documents

    @staticmethod
    async def get_document_file(session: AsyncSession, document_id: UUID, user_id: UUID) -> Tuple[str, str]:
        document = await DocumentRepository.get_by_id(session, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        await ProjectService.get_project(session, document.project_id, user_id)
        if not document.s3_key or not os.path.exists(document.s3_key):
            raise HTTPException(status_code=404, detail="Document file not found on disk")
        return document.s3_key, document.name

    @staticmethod
    async def get_document_by_id_in_project(
        session: AsyncSession, document_id: UUID, project_id: UUID
    ) -> Document:
        """
        Fetch a document by ID and verify it belongs to the given project.
        Raises 404 if not found or 403 if it belongs to a different project.
        """
        document = await DocumentRepository.get_by_id(session, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        if document.project_id != project_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Document does not belong to this project",
            )
        return document

    @staticmethod
    async def process_pdf(file_path: str) -> dict:
        """
        Extracts page count, metadata, and per-page text from the PDF using PyMuPDF.
        Runs in a thread pool to avoid blocking the async event loop.

        Returns:
            dict with keys: pages, metadata, pages_text (list of (page_num, text) tuples)
        """
        def _process():
            try:
                doc = fitz.open(file_path)
            except Exception as exc:
                raise ValueError(f"Cannot open PDF file: {exc}") from exc

            pages = len(doc)
            metadata = doc.metadata

            pages_text: List[Tuple[int, str]] = []
            for i in range(pages):
                page = doc.load_page(i)
                page_text = page.get_text()
                pages_text.append((i + 1, page_text))

            doc.close()
            return {
                "pages": pages,
                "metadata": metadata,
                "pages_text": pages_text,
            }

        return await asyncio.to_thread(_process)

    @staticmethod
    async def upload_document(session: AsyncSession, project_id: UUID, user_id: UUID, file: UploadFile) -> Document:
        import time
        from app.services.event_manager import event_bus, EventType, create_timeline_event

        proj_id_str = str(project_id)

        # ── Validate ownership ────────────────────────────────────────────────
        await ProjectService.get_project(session, project_id, user_id)

        # ── Read file content (needed for size check before writing to disk) ──
        content = await file.read()

        # ── File size guard ───────────────────────────────────────────────────
        if len(content) > MAX_UPLOAD_SIZE_BYTES:
            size_mb = len(content) / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=(
                    f"File '{file.filename}' is {size_mb:.1f} MB. "
                    f"Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB} MB."
                ),
            )

        # ── File type guard ───────────────────────────────────────────────────
        safe_name = _safe_filename(file.filename or "upload.pdf")
        ext = Path(safe_name).suffix.lower()
        content_type = (file.content_type or "").lower()

        is_pdf = (content_type in ALLOWED_CONTENT_TYPES) or (ext in ALLOWED_EXTENSIONS)
        if not is_pdf:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=(
                    f"Unsupported file type '{content_type or ext}'. "
                    "Only PDF files are accepted."
                ),
            )

        # ── Save file to disk (UUID-prefixed to prevent collisions) ───────────
        import uuid as _uuid
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        # Collision-safe storage name: {uuid}_{sanitized_filename}
        storage_name = f"{_uuid.uuid4().hex}_{safe_name}"
        file_path = os.path.join(UPLOAD_DIR, storage_name)

        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(
            f"Document uploaded: original={safe_name!r} storage={storage_name!r} "
            f"size_bytes={len(content)} project={proj_id_str} user={user_id}"
        )

        await event_bus.publish(
            proj_id_str,
            create_timeline_event(
                event_type=EventType.UPLOAD_RECEIVED,
                status="done",
                metadata={"filename": safe_name, "size_bytes": len(content), "content_type": content_type},
                project_id=proj_id_str,
            ),
        )

        # DB stores original display name; s3_key stores the collision-safe path
        doc_in = DocumentCreate(
            project_id=project_id,
            name=safe_name,
            type=content_type or "application/pdf",
            size=len(content),
            s3_key=file_path,
        )
        db_doc = await DocumentRepository.create(session, doc_in)

        # ── Process PDF ───────────────────────────────────────────────────────
        try:
            db_doc = await DocumentRepository.update_status(session, db_doc, "Processing")

            await event_bus.publish(
                proj_id_str,
                create_timeline_event(
                    event_type=EventType.PDF_PROCESSING_STARTED,
                    status="running",
                    metadata={"filename": safe_name},
                    project_id=proj_id_str,
                ),
            )
            await event_bus.publish(
                proj_id_str,
                create_timeline_event(
                    event_type=EventType.TEXT_EXTRACTION_STARTED,
                    status="running",
                    metadata={"filename": safe_name},
                    project_id=proj_id_str,
                ),
            )

            start_extract = time.time()
            pdf_data = await DocumentService.process_pdf(file_path)
            extract_duration = int((time.time() - start_extract) * 1000)

            logger.info(
                f"PDF extraction complete: name={safe_name!r} pages={pdf_data['pages']} "
                f"duration_ms={extract_duration}"
            )

            await event_bus.publish(
                proj_id_str,
                create_timeline_event(
                    event_type=EventType.TEXT_EXTRACTION_COMPLETED,
                    status="done",
                    duration_ms=extract_duration,
                    metadata={"page_count": pdf_data["pages"]},
                    project_id=proj_id_str,
                ),
            )
            await event_bus.publish(
                proj_id_str,
                create_timeline_event(
                    event_type=EventType.PDF_PROCESSING_COMPLETED,
                    status="done",
                    duration_ms=extract_duration,
                    metadata={"page_count": pdf_data["pages"]},
                    project_id=proj_id_str,
                ),
            )

            db_doc = await DocumentRepository.update_status(
                session,
                db_doc,
                status="Completed",
                pages=pdf_data["pages"],
                processed_at=datetime.utcnow(),
            )

            # Trigger chunking — non-fatal on failure
            try:
                chunk_count = await ChunkService.create_chunks_for_document(
                    session,
                    db_doc.id,
                    pdf_data["pages_text"],
                    project_id=proj_id_str,
                    document_name=safe_name,
                )
                logger.info(f"Chunking complete: document={db_doc.id} chunks={chunk_count}")
            except Exception as chunk_err:
                await DocumentRepository.update_status(session, db_doc, "Failed", pages=pdf_data["pages"])
                logger.error(f"Chunking/indexing failed for document {db_doc.id}: {chunk_err}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Document upload succeeded, but text indexing failed.",
                ) from chunk_err

        except HTTPException:
            raise
        except Exception as exc:
            db_doc = await DocumentRepository.update_status(session, db_doc, "Failed")
            logger.error(f"PDF processing failed for '{safe_name}': {exc}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PDF processing failed.",
            ) from exc

        # Attach chunk count for response
        db_doc._chunk_count = await ChunkRepository.count_by_document(session, db_doc.id)
        return db_doc

    @staticmethod
    async def delete_document(session: AsyncSession, document_id: UUID, project_id: UUID, user_id: UUID) -> None:
        await ProjectService.get_project(session, project_id, user_id)
        document = await DocumentRepository.get_by_id(session, document_id)
        if not document or document.project_id != project_id:
            raise HTTPException(status_code=404, detail="Document not found")

        stored_path = document.s3_key
        await ChunkService._delete_chroma_vectors_for_document(str(document.id), str(project_id))
        await DocumentRepository.delete(session, document)
        if stored_path and os.path.exists(stored_path):
            try:
                os.remove(stored_path)
                logger.info("Deleted stored PDF file for document %s", document_id)
            except OSError as exc:
                logger.error("Failed to delete stored PDF file for document %s: %s", document_id, exc, exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Document metadata was deleted but the stored file could not be removed.",
                ) from exc

    @staticmethod
    async def get_document_page(session: AsyncSession, document_id: UUID, page: int, user_id: UUID) -> str:
        document = await DocumentRepository.get_by_id(session, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Validate ownership
        await ProjectService.get_project(session, document.project_id, user_id)

        if not document.s3_key or not os.path.exists(document.s3_key):
            raise HTTPException(status_code=404, detail="Document file not found on disk")

        def _get_page():
            try:
                doc = fitz.open(document.s3_key)
                if page < 1 or page > len(doc):
                    doc.close()
                    raise HTTPException(status_code=400, detail=f"Page {page} out of range (1–{len(doc)})")

                p = doc.load_page(page - 1)
                text = p.get_text()
                doc.close()
                return text
            except HTTPException:
                raise
            except Exception as exc:
                logger.error(f"Error reading page {page} of document {document_id}: {exc}")
                raise HTTPException(status_code=500, detail=f"Error reading page: {exc}") from exc

        return await asyncio.to_thread(_get_page)
