from fastapi import APIRouter
from app.api.routes.auth import router as auth_router
from app.api.routes.projects import router as projects_router
from app.api.routes.documents import router as documents_router
from app.api.routes.documents import global_router as documents_global_router
from app.api.routes.search import router as search_router
from app.api.routes.chat import router as chat_router
from app.api.routes.settings import router as settings_router
from app.api.routes.notes import router as notes_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(documents_router, prefix="/projects", tags=["documents"])
api_router.include_router(documents_global_router, prefix="/documents", tags=["documents"])
api_router.include_router(search_router, prefix="/projects", tags=["search"])
api_router.include_router(chat_router, prefix="/projects", tags=["chat"])
api_router.include_router(settings_router, prefix="/settings", tags=["settings"])
api_router.include_router(notes_router, prefix="/projects", tags=["notes"])
