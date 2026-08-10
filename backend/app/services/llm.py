import logging
from app.services.llm.factory import LLMFactory

logger = logging.getLogger(__name__)

class LegacyLLMServiceBridge:
    """
    Backwards compatibility bridge delegating requests to LLMFactory.
    """
    async def generate_response(self, prompt: str, timeout: int = 30) -> str:
        provider = LLMFactory.get_provider()
        return await provider.generate(prompt=prompt, timeout=timeout)

llm_service = LegacyLLMServiceBridge()
