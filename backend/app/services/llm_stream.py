import logging
from typing import AsyncGenerator
from app.services.llm.factory import LLMFactory

logger = logging.getLogger(__name__)

class LegacyLLMStreamServiceBridge:
    """
    Backwards compatibility bridge delegating streaming requests to LLMFactory.
    """
    async def generate_stream(self, prompt: str) -> AsyncGenerator[str, None]:
        provider = LLMFactory.get_provider()
        async for chunk in provider.generate_stream(prompt=prompt):
            yield chunk

llm_stream_service = LegacyLLMStreamServiceBridge()
