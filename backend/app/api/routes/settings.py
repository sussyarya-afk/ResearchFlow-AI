"""
Settings routes — LLM provider management (Phase 8: per-user selection).

Provider is stored in User.llm_provider so one user cannot affect another.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.llm.factory import LLMFactory
from app.repositories.user import UserRepository

logger = logging.getLogger(__name__)

router = APIRouter()


class ProviderSwitchRequest(BaseModel):
    provider: str


class LLMConfigUpdateRequest(BaseModel):
    provider: str
    key_or_url: str


@router.post("/llm/config")
async def update_llm_config(
    request: LLMConfigUpdateRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Update the API key or endpoint URL for a specific provider.
    """
    try:
        LLMFactory.update_provider_config(request.provider, request.key_or_url)
        all_status = await LLMFactory.get_all_providers_status()
        all_status["current_provider"] = current_user.llm_provider
        user_provider = LLMFactory.get_provider(current_user.llm_provider)
        all_status["current_model"] = user_provider.model_name
        return all_status
    except Exception as exc:
        logger.error(f"Error updating LLM config: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update LLM configuration.",
        )


@router.get("/llm")
async def get_llm_settings(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get current AI Provider settings for the requesting user.
    Returns status of all available providers plus which one this user has selected.
    """
    try:
        all_status = await LLMFactory.get_all_providers_status()
        # Override active provider with per-user value
        all_status["current_provider"] = current_user.llm_provider
        user_provider = LLMFactory.get_provider(current_user.llm_provider)
        all_status["current_model"] = user_provider.model_name
        return all_status
    except Exception as exc:
        logger.error(f"Error fetching LLM settings: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch LLM provider settings.",
        )


@router.post("/llm/provider")
async def set_llm_provider(
    request: ProviderSwitchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Set the LLM provider for the current user only.
    Does NOT affect any other user's session.
    """
    provider_name = request.provider.lower()
    valid_providers = {"gemini", "nvidia", "ollama"}
    if provider_name not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider '{request.provider}'. Supported: {', '.join(valid_providers)}",
        )

    try:
        # Persist per-user selection to DB
        current_user.llm_provider = provider_name
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)

        logger.info(f"User {current_user.id} switched LLM provider to: {provider_name}")

        all_status = await LLMFactory.get_all_providers_status()
        all_status["current_provider"] = provider_name
        user_provider = LLMFactory.get_provider(provider_name)
        all_status["current_model"] = user_provider.model_name
        return all_status
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error setting LLM provider: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to set LLM provider.",
        )
