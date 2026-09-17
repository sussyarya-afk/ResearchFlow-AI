# AgentNotebook AI

> **Research. Think. Connect.**  
> *An intelligent research notebook that turns your documents, questions, and sources into connected knowledge.*

AgentNotebook AI is a high-performance research operating system built with FastAPI, React 19, TypeScript, and ChromaDB. It indexes scientific PDFs, creates dense semantic vector graphs, and synthesizes answers grounded in verifiable document page citations through modular LLM providers (NVIDIA NIM, Google Gemini, Ollama).

## Architecture

- Backend: FastAPI, async SQLAlchemy, Alembic, PostgreSQL, JWT auth, PyMuPDF PDF extraction, sentence-transformers embeddings, ChromaDB vector search, SSE timeline events.
- Frontend: React, Vite, TypeScript, three-panel workspace UI, streaming chat, citations, project dashboard.
- Persistence: PostgreSQL stores users, projects, documents, chunks, chat history, citations, and notes. ChromaDB stores chunk vectors and retrieval metadata. Uploaded PDFs live on disk or a mounted volume.

## Deployment

**Production Backend (Vercel Deployment):**
[https://research-flow-ai-fiqq-eight.vercel.app](https://research-flow-ai-fiqq-eight.vercel.app)

## RAG Flow

PDF upload -> PyMuPDF page extraction -> paragraph-aware chunks -> sentence-transformer embeddings -> ChromaDB upsert with project/document/page metadata -> query embedding -> ChromaDB filtered retrieval -> grounded prompt -> selected LLM provider -> streamed answer -> citations saved with chat history.

## Prerequisites

- Python 3.10+
- Node.js 20+
- PostgreSQL 14+
- Docker Desktop, optional for container deployment
- One configured LLM provider: `GEMINI_API_KEY`, `NVIDIA_API_KEY`, or reachable `OLLAMA_URL`

## Environment

Copy `backend/.env.example` to `backend/.env` for local development. Never commit real `.env` files.

Important variables:

```bash
ENVIRONMENT=production
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/researchflow
SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
FRONTEND_ORIGINS=http://localhost:5173
LLM_PROVIDER=nvidia
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
NVIDIA_API_KEY=
NVIDIA_MODEL=meta/llama-3.3-70b-instruct
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
MAX_UPLOAD_SIZE_MB=50
```

Providers without credentials report `not_configured`; they do not return fake answers.

## Local Setup

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8000/api/v1` if the frontend cannot infer the backend URL.

## Database

The production database is PostgreSQL. Run migrations with:

```bash
cd backend
alembic upgrade head
```

The current migration chain includes legacy placeholders for previously referenced revisions plus a baseline schema for clean installs.

## Docker

```bash
docker compose up --build
```

The compose stack provides PostgreSQL, the FastAPI backend, persistent upload/vector volumes, and an Nginx-served frontend. Supply secrets through environment variables or a local uncommitted `.env`.

## Verification

Backend:

```bash
cd backend
python -m compileall app
pytest
alembic upgrade head
```

Frontend:

```bash
cd frontend
npx tsc --noEmit
npm run build
```

Docker:

```bash
docker compose config
docker compose build
```

## Troubleshooting

- Login fails with `Failed to fetch`: confirm the backend is running, CORS includes the frontend origin, and PostgreSQL is reachable by `DATABASE_URL`.
- Upload fails during indexing: verify the embedding model can load and `chroma_db/` is writable.
- Chat fails with provider not configured: set the selected provider's API key or use a reachable Ollama server.
- SSE timeline does not connect: confirm the frontend uses `VITE_API_URL` and the user is authenticated.
- Docker commands fail: install Docker Desktop and ensure `docker` is on PATH.
