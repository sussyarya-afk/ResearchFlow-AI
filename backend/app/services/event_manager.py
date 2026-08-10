import uuid
import time
import asyncio
import logging
from enum import Enum
from datetime import datetime
from typing import Dict, Any, List, Optional, AsyncGenerator

logger = logging.getLogger(__name__)

class EventType(str, Enum):
    UPLOAD_RECEIVED = "upload_received"
    PDF_PROCESSING_STARTED = "pdf_processing_started"
    PDF_PROCESSING_COMPLETED = "pdf_processing_completed"
    TEXT_EXTRACTION_STARTED = "text_extraction_started"
    TEXT_EXTRACTION_COMPLETED = "text_extraction_completed"
    CHUNKING_STARTED = "chunking_started"
    CHUNKING_COMPLETED = "chunking_completed"
    EMBEDDING_STARTED = "embedding_started"
    EMBEDDING_COMPLETED = "embedding_completed"
    VECTOR_INDEXING_STARTED = "vector_indexing_started"
    VECTOR_INDEXING_COMPLETED = "vector_indexing_completed"
    RETRIEVAL_STARTED = "retrieval_started"
    RETRIEVAL_COMPLETED = "retrieval_completed"
    PROMPT_BUILDING = "prompt_building"
    LLM_STARTED = "llm_started"
    LLM_COMPLETED = "llm_completed"
    RESPONSE_SENT = "response_sent"

EVENT_TITLES: Dict[str, str] = {
    EventType.UPLOAD_RECEIVED: "File Upload Received",
    EventType.PDF_PROCESSING_STARTED: "Starting PDF Document Analysis",
    EventType.PDF_PROCESSING_COMPLETED: "Completed PDF Analysis",
    EventType.TEXT_EXTRACTION_STARTED: "Extracting Text Content",
    EventType.TEXT_EXTRACTION_COMPLETED: "Text Extraction Finished",
    EventType.CHUNKING_STARTED: "Chunking Document Text",
    EventType.CHUNKING_COMPLETED: "Text Chunking Finished",
    EventType.EMBEDDING_STARTED: "Generating Vector Embeddings",
    EventType.EMBEDDING_COMPLETED: "Vector Embeddings Generated",
    EventType.VECTOR_INDEXING_STARTED: "Storing Embeddings in Vector Database",
    EventType.VECTOR_INDEXING_COMPLETED: "Vector Database Indexing Finished",
    EventType.RETRIEVAL_STARTED: "Querying Vector Database (RAG)",
    EventType.RETRIEVAL_COMPLETED: "Relevant Context Chunks Retrieved",
    EventType.PROMPT_BUILDING: "Constructing Augmented Prompt",
    EventType.LLM_STARTED: "Generating LLM Response",
    EventType.LLM_COMPLETED: "LLM Response Generation Completed",
    EventType.RESPONSE_SENT: "Response Sent to Client",
}

def create_timeline_event(
    event_type: str,
    status: str = "running",
    duration_ms: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    project_id: Optional[str] = None
) -> Dict[str, Any]:
    """Helper to construct a standardized timeline event dictionary."""
    now = datetime.now()
    return {
        "id": str(uuid.uuid4()),
        "event_type": event_type,
        "title": EVENT_TITLES.get(event_type, event_type.replace("_", " ").title()),
        "status": status,
        "timestamp": now.strftime("%H:%M:%S"),
        "duration_ms": duration_ms if duration_ms is not None else 0,
        "metadata": metadata or {},
        "project_id": project_id
    }

class EventBus:
    """In-memory event bus for broadcasting events to SSE listeners by project_id."""
    def __init__(self):
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}

    def subscribe(self, project_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if project_id not in self._subscribers:
            self._subscribers[project_id] = []
        self._subscribers[project_id].append(queue)
        logger.info(f"Subscribed queue to project {project_id}. Total: {len(self._subscribers[project_id])}")
        return queue

    def unsubscribe(self, project_id: str, queue: asyncio.Queue):
        if project_id in self._subscribers and queue in self._subscribers[project_id]:
            self._subscribers[project_id].remove(queue)
            if not self._subscribers[project_id]:
                del self._subscribers[project_id]
            logger.info(f"Unsubscribed queue from project {project_id}")

    async def publish(self, project_id: str, event: Dict[str, Any]):
        if project_id in self._subscribers:
            for queue in self._subscribers[project_id]:
                await queue.put(event)

event_bus = EventBus()
