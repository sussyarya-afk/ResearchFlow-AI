import logging
import asyncio
from typing import AsyncGenerator, Dict, Any
from google import genai

from app.core.config import settings
from app.services.llm.base import BaseLLMProvider

logger = logging.getLogger(__name__)

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self._provider_name = "gemini"
        self._model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self.api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            logger.warning("GEMINI_API_KEY is not set. Gemini is not configured.")
            self.client = None

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
                "message": "GEMINI_API_KEY is not configured.",
                "model": self.model_name
            }
        try:
            # Simple check
            return {
                "status": "connected",
                "message": "Gemini API key is configured and ready.",
                "model": self.model_name
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Gemini connection error: {str(e)}",
                "model": self.model_name
            }

    async def generate(self, prompt: str, timeout: int = 30) -> str:
        if not self.api_key or not self.client:
            raise RuntimeError("Gemini provider is not configured. Set GEMINI_API_KEY.")

        logger.info(f"Generating Gemini response, model: {self.model_name}, prompt len: {len(prompt)}")
        try:
            loop = asyncio.get_running_loop()
            def _generate():
                res = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                return res.text
            
            task = loop.run_in_executor(None, _generate)
            result = await asyncio.wait_for(task, timeout=timeout)
            return result
        except asyncio.TimeoutError:
            logger.error(f"Gemini request timed out after {timeout}s")
            raise RuntimeError("Gemini API request timed out.")
        except Exception as e:
            logger.error(f"Error in Gemini generate: {str(e)}")
            raise RuntimeError("Gemini response generation failed.") from e

    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        if not self.api_key or not self.client:
            raise RuntimeError("Gemini provider is not configured. Set GEMINI_API_KEY.")

        logger.info(f"Starting Gemini stream, model: {self.model_name}, prompt len: {len(prompt)}")
        try:
            response_stream = await self.client.aio.models.generate_content_stream(
                model=self.model_name,
                contents=prompt
            )
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Error in Gemini generate_stream: {str(e)}")
            raise RuntimeError("Gemini streaming failed.") from e
