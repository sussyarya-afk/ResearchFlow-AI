import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings, ALLOWED_ORIGINS
from app.core.database import async_session_maker
from app.core.logging import setup_logging
from app.api.routes import api_router
from app.services.embedding import embedding_service
from app.services.retrieval import retrieval_service
from app.services.llm.factory import LLMFactory

# Initialise structured logging before anything else runs
setup_logging()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler — load models, validate config on startup."""
    logger.info(f"Starting {settings.PROJECT_NAME} [{settings.ENVIRONMENT}]")

    # Load embedding model — warn but do NOT crash if it fails.
    # The app can still serve auth / project endpoints without the model.
    try:
        embedding_service.load_model()
    except Exception as exc:
        logger.error(
            f"Embedding model failed to load: {exc}. "
            "Chunking and retrieval will be unavailable until the model is loaded."
        )

    logger.info(f"CORS allowed origins: {ALLOWED_ORIGINS}")
    yield

    logger.info("Application shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for AgentNotebook AI",
    lifespan=lifespan,
)

# Phase 11: Never allow wildcard origins when credentials=True — RFC violation.
# Use the explicit ALLOWED_ORIGINS list in all environments.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Verifies database, vector store, embedding model, and selected LLM status.
    """
    db_status = "error"
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        logger.error("Health check database failure: %s", exc)

    vector_status = "healthy" if retrieval_service._healthy else "error"
    provider = LLMFactory.get_provider()
    provider_status = await provider.check_connection()
    critical_ok = db_status == "connected" and vector_status == "healthy" and embedding_service.model is not None

    return JSONResponse({
        "status": "ok" if critical_ok else "degraded",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "vector_store": vector_status,
        "embedding_model": {
            "loaded": embedding_service.model is not None,
            "name": embedding_service.model_name,
        },
        "llm_provider": provider.provider_name,
        "llm_status": provider_status.get("status"),
    })
