import logging
import sys
from app.core.config import settings


def setup_logging():
    """
    Configure structured logging for ResearchFlow AI.
    Format includes filename and line number for production tracing.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    fmt = "%(asctime)s | %(levelname)-8s | %(name)s:%(filename)s:%(lineno)d | %(message)s"
    datefmt = "%Y-%m-%dT%H:%M:%S"

    logging.basicConfig(
        level=log_level,
        format=fmt,
        datefmt=datefmt,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,  # Override any existing root-logger config
    )

    # Quiet noisy third-party libraries
    _quiet = [
        "sqlalchemy.engine",
        "chromadb",
        "chromadb.telemetry",
        "sentence_transformers",
        "httpx",
        "httpcore",
        "urllib3",
        "uvicorn.access",
    ]
    for lib in _quiet:
        logging.getLogger(lib).setLevel(
            log_level if log_level == logging.DEBUG else logging.WARNING
        )

    # Keep uvicorn error logs visible
    logging.getLogger("uvicorn.error").setLevel(logging.ERROR)
    logging.getLogger("uvicorn").setLevel(log_level)
