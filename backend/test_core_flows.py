import pytest

from app.core.security import get_password_hash, verify_password
from app.services.chunk import chunk_text
from app.services.llm.gemini_provider import GeminiProvider
from app.services.llm.nvidia_provider import NvidiaProvider
from app.services.prompt_builder import prompt_builder
from app.services.llm.fallback import synthesize_grounded_answer, synthesize_grounded_stream
from app.services.llm.factory import update_provider_config, get_llm_provider


def test_password_hashing_round_trip():
    hashed = get_password_hash("correct horse battery staple")

    assert hashed != "correct horse battery staple"
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong password", hashed)


def test_chunk_text_preserves_page_metadata():
    chunks = chunk_text(
        [
            (1, "First page conclusion.\n\nMore supporting detail."),
            (2, "Second page method.\n\nFinal result."),
        ],
        chunk_size=60,
        overlap=10,
    )

    assert chunks
    assert chunks[0]["chunk_index"] == 0
    assert chunks[0]["page_start"] == 1
    assert all(chunk["page_start"] <= chunk["page_end"] for chunk in chunks)
    assert all(chunk["character_count"] == len(chunk["text"]) for chunk in chunks)


def test_prompt_builder_requires_grounded_answers():
    prompt = prompt_builder.build_prompt(
        query="What is the population of Mars?",
        retrieved_chunks=[],
    )

    assert "based *only* on the provided context" in prompt
    assert "I do not have enough information" in prompt
    assert "What is the population of Mars?" in prompt


@pytest.mark.asyncio
async def test_unconfigured_keyed_providers_report_not_configured(monkeypatch):
    monkeypatch.setattr("app.services.llm.gemini_provider.settings.GEMINI_API_KEY", "")
    monkeypatch.setattr("app.services.llm.nvidia_provider.settings.NVIDIA_API_KEY", "")

    gemini_status = await GeminiProvider().check_connection()
    nvidia_status = await NvidiaProvider().check_connection()

    assert gemini_status["status"] == "not_configured"
    assert nvidia_status["status"] == "not_configured"


def test_fallback_synthesizer_grounding():
    sample_chunks = [
        {
            "chunk_id": "c1",
            "document_name": "Quantum_Error.pdf",
            "page_start": 4,
            "page_end": 4,
            "text": "Surface codes achieve fault tolerance with high threshold rates for superconducting quantum processors.",
        },
        {
            "chunk_id": "c2",
            "document_name": "Quantum_Error.pdf",
            "page_start": 7,
            "page_end": 7,
            "text": "The topological stabilizer measurements suppress bit-flip and phase-flip syndrome errors exponentially.",
        }
    ]

    answer = synthesize_grounded_answer("How do surface codes achieve fault tolerance?", sample_chunks)
    assert "Quantum_Error.pdf" in answer
    assert "fault tolerance" in answer.lower() or "surface codes" in answer.lower()


@pytest.mark.asyncio
async def test_fallback_stream_tokens():
    sample_chunks = [
        {
            "chunk_id": "c1",
            "document_name": "TestDoc.pdf",
            "page_start": 1,
            "page_end": 1,
            "text": "Neural network optimization relies on gradient descent variants.",
        }
    ]

    tokens = []
    async for tok in synthesize_grounded_stream("Tell me about optimization", sample_chunks):
        tokens.append(tok)

    full_output = "".join(tokens)
    assert len(tokens) > 0
    assert "TestDoc.pdf" in full_output


def test_dynamic_provider_config_update():
    update_provider_config("gemini", "test_gemini_key_123")
    from app.core.config import settings
    assert settings.GEMINI_API_KEY == "test_gemini_key_123"

    update_provider_config("ollama", "http://localhost:11434")
    assert settings.OLLAMA_URL == "http://localhost:11434"
