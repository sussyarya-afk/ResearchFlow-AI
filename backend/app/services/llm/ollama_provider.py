import logging
import json
import asyncio
from typing import AsyncGenerator, Dict, Any
import httpx

from app.core.config import settings
from app.services.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class OllamaProvider(BaseLLMProvider):
    def __init__(self):
        self._provider_name = "ollama"
        self._model_name = settings.OLLAMA_MODEL or "llama3"
        self.ollama_url = (settings.OLLAMA_URL or "http://localhost:11434").rstrip("/")

    @property
    def provider_name(self) -> str:
        return self._provider_name

    @property
    def model_name(self) -> str:
        return self._model_name

    async def check_connection(self) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.ollama_url}/api/tags")
                if res.status_code == 200:
                    models = [m.get("name") for m in res.json().get("models", [])]
                    return {
                        "status": "connected",
                        "message": f"Ollama server active at {self.ollama_url}. Installed models: {', '.join(models) if models else 'None'}",
                        "model": self.model_name
                    }
                return {
                    "status": "error",
                    "message": f"Ollama server returned status {res.status_code}",
                    "model": self.model_name
                }
        except Exception as e:
            return {
                "status": "not_configured",
                "message": f"Ollama server not reachable at {self.ollama_url} ({str(e)}).",
                "model": self.model_name
            }

    async def generate(self, prompt: str, timeout: int = 30) -> str:
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False
        }
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(f"{self.ollama_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", "")
                res.raise_for_status()
        except Exception as e:
            logger.error(f"Ollama call failed: {str(e)}")
            raise RuntimeError("Ollama response generation failed.") from e

        raise RuntimeError("Ollama returned an empty response.")

    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": True
        }
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", f"{self.ollama_url}/api/generate", json=payload) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            line = line.strip()
                            if not line:
                                continue
                            try:
                                data = json.loads(line)
                                chunk = data.get("response", "")
                                if chunk:
                                    yield chunk
                                if data.get("done", False):
                                    break
                            except json.JSONDecodeError:
                                continue
                        return
        except Exception as e:
            logger.error(f"Ollama streaming connection failed: {str(e)}")
            raise RuntimeError("Ollama streaming failed.") from e
