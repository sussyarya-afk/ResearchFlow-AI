import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.llm.factory import LLMFactory

logger = logging.getLogger(__name__)

router = APIRouter()

class ProviderSwitchRequest(BaseModel):
    provider: str

@router.get("/llm")
async def get_llm_settings(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get current AI Provider settings, active model, and status of all available providers.
    """
    try:
        return await LLMFactory.get_all_providers_status()
    except Exception as e:
        logger.error(f"Error fetching LLM settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch LLM provider settings: {str(e)}"
        )

@router.post("/llm/provider")
async def set_llm_provider(
    request: ProviderSwitchRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Switch the active LLM provider dynamically.
    """
    try:
        LLMFactory.set_provider(request.provider)
        return await LLMFactory.get_all_providers_status()
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error setting LLM provider: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set LLM provider: {str(e)}"
        )
