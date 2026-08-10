import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings, ALLOWED_ORIGINS
from app.core.logging import setup_logging
from app.api.routes import api_router
from app.services.embedding import embedding_service

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
    description="Backend API for ResearchFlow AI",
    lifespan=lifespan,
)

# CORS — restrict to known frontend origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns application status, environment, and embedding model readiness.
    """
    return JSONResponse({
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "embedding_model": {
            "loaded": embedding_service.model is not None,
            "name": embedding_service.model_name,
        },
        "llm_provider": settings.LLM_PROVIDER,
    })
