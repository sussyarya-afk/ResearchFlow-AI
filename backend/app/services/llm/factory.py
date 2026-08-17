import logging
from typing import Dict, Any, Optional

from app.core.config import settings
from app.services.llm.base import BaseLLMProvider
from app.services.llm.gemini_provider import GeminiProvider
from app.services.llm.nvidia_provider import NvidiaProvider
from app.services.llm.ollama_provider import OllamaProvider

logger = logging.getLogger(__name__)

class LLMFactory:
    """
    Factory for creating and managing LLM providers.
    Selects the correct provider based on LLM_PROVIDER setting or runtime selection.
    """
    _providers: Dict[str, BaseLLMProvider] = {}
    _active_provider_name: Optional[str] = None

    @classmethod
    def _initialize_providers(cls):
        if not cls._providers:
            cls._providers["gemini"] = GeminiProvider()
            cls._providers["nvidia"] = NvidiaProvider()
            cls._providers["ollama"] = OllamaProvider()
            
        if cls._active_provider_name is None:
            cls._active_provider_name = (settings.LLM_PROVIDER or "gemini").lower()

    @classmethod
    def get_provider(cls, provider_name: Optional[str] = None) -> BaseLLMProvider:
        """
        Returns the active LLM provider instance matching the given or default provider_name.
        """
        cls._initialize_providers()
        name = (provider_name or cls._active_provider_name or "gemini").lower()
        
        if name not in cls._providers:
            logger.warning(f"Unknown provider '{name}'. Falling back to Gemini.")
            name = "gemini"
            
        return cls._providers[name]

    @classmethod
    def set_provider(cls, provider_name: str) -> BaseLLMProvider:
        """
        Dynamically sets the active LLM provider.
        """
        cls._initialize_providers()
        name = provider_name.lower()
        if name not in cls._providers:
            raise ValueError(f"Unsupported provider '{provider_name}'. Supported options: gemini, nvidia, ollama.")
            
        cls._active_provider_name = name
        logger.info(f"LLM Provider dynamically switched to: {name}")
        return cls._providers[name]

    @classmethod
    def get_active_provider_name(cls) -> str:
        cls._initialize_providers()
        return cls._active_provider_name or "gemini"

    @classmethod
    async def get_all_providers_status(cls) -> Dict[str, Any]:
        """
        Returns status metadata for all supported providers.
        """
        cls._initialize_providers()
        active = cls.get_active_provider_name()
        active_provider = cls.get_provider(active)
        active_status = await active_provider.check_connection()

        providers_meta = []
        display_names = {
            "gemini": "Gemini",
            "nvidia": "NVIDIA",
            "ollama": "Ollama",
        }

        for p_id, provider in cls._providers.items():
            status_info = await provider.check_connection()
            providers_meta.append({
                "id": p_id,
                "name": display_names.get(p_id, p_id.capitalize()),
                "model": provider.model_name,
                "configured": status_info.get("status") in ["connected", "configured"],
                "status": status_info.get("status"),
                "message": status_info.get("message")
            })

        return {
            "current_provider": active,
            "current_model": active_provider.model_name,
            "status": active_status.get("status"),
            "message": active_status.get("message"),
            "providers": providers_meta
        }

    @classmethod
    def update_provider_config(cls, provider_id: str, key_or_url: str) -> None:
        """Dynamically updates API key or endpoint URL for a provider."""
        cls._initialize_providers()
        p_id = provider_id.lower()
        if p_id == "gemini":
            import google.generativeai as genai
            settings.GEMINI_API_KEY = key_or_url.strip()
            if key_or_url.strip():
                genai.configure(api_key=key_or_url.strip())
                cls._providers["gemini"] = GeminiProvider()
        elif p_id == "nvidia":
            settings.NVIDIA_API_KEY = key_or_url.strip()
            cls._providers["nvidia"] = NvidiaProvider()
        elif p_id == "ollama":
            settings.OLLAMA_URL = key_or_url.strip()
            cls._providers["ollama"] = OllamaProvider()

llm_factory = LLMFactory()

def get_llm_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
    return LLMFactory.get_provider(provider_name)

def update_provider_config(provider_id: str, key_or_url: str) -> None:
    return LLMFactory.update_provider_config(provider_id, key_or_url)

