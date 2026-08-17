import logging
import json
import asyncio
from typing import AsyncGenerator, Dict, Any
import httpx

from app.core.config import settings
from app.services.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class NvidiaProvider(BaseLLMProvider):
    def __init__(self):
        self._provider_name = "nvidia"
        self._model_name = settings.NVIDIA_MODEL or "meta/llama-3.3-70b-instruct"
        self.api_key = settings.NVIDIA_API_KEY.strip() if settings.NVIDIA_API_KEY else ""
        self.base_url = "https://integrate.api.nvidia.com/v1/chat/completions"

    @property
    def provider_name(self) -> str:
        return self._provider_name

    @property
    def model_name(self) -> str:
        return self._model_name

    async def check_connection(self) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "status": "not_configured",
                "message": "NVIDIA_API_KEY is not configured.",
                "model": self.model_name
            }
        return {
            "status": "connected",
            "message": "NVIDIA API key configured.",
            "model": self.model_name
        }

    async def generate(self, prompt: str, timeout: int = 30) -> str:
        if not self.api_key:
            raise RuntimeError("NVIDIA provider is not configured. Set NVIDIA_API_KEY.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 1024,
            "stream": False
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(self.base_url, headers=headers, json=payload)
                res.raise_for_status()
                data = res.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Error in NVIDIA generate: {str(e)}")
            raise RuntimeError("NVIDIA response generation failed.") from e

    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise RuntimeError("NVIDIA provider is not configured. Set NVIDIA_API_KEY.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 1024,
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", self.base_url, headers=headers, json=payload) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line or line.startswith(":"):
                            continue
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                delta = data["choices"][0].get("delta", {})
                                content = delta.get("content", "")
                                if content:
                                    yield content
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            logger.error(f"Error in NVIDIA generate_stream: {str(e)}")
            raise RuntimeError("NVIDIA streaming failed.") from e
