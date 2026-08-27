from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AgentNotebook AI"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # PostgreSQL
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str
    DATABASE_URL: str

    # JWT Authentication
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # LLM Settings
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    NVIDIA_API_KEY: str = ""
    NVIDIA_MODEL: str = "meta/llama-3.3-70b-instruct"
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 50  # Reject files larger than this

    # CORS — comma-separated list of allowed frontend origins
    # In production set to your actual frontend domain, e.g. "https://app.researchflow.ai"
    FRONTEND_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:8080"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()

# Derived helpers (not stored in env, computed once at startup)
MAX_UPLOAD_SIZE_BYTES: int = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
ALLOWED_ORIGINS: list[str] = [o.strip() for o in settings.FRONTEND_ORIGINS.split(",") if o.strip()]
