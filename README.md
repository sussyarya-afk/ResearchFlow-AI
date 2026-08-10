# ResearchFlow AI

ResearchFlow AI is an advanced research and document analysis platform designed to streamline knowledge extraction, organization, and comprehension.

## The Problem
Researchers, analysts, and students often struggle with information overload when dealing with numerous academic papers, technical documentation, and long-form articles. Existing tools either lack intelligent querying capabilities or fail to maintain a coherent workflow across multiple documents.

## Main Features
- **Document Management**: Upload and organize PDFs seamlessly.
- **Intelligent RAG (Retrieval-Augmented Generation)**: Ask complex questions and get answers rooted directly in your uploaded documents.
- **Multi-LLM Support**: Choose between cutting-edge models for generating responses.
- **Advanced Citations**: Every claim is backed by specific citations to the source text.
- **Streaming Responses**: Real-time answer generation.
- **Live Agent Timeline**: See the AI's step-by-step reasoning and retrieval process in real-time.
- **Workspace Integration**: Split-pane view for side-by-side reading and chatting.

## RAG Architecture & Application Flow
ResearchFlow AI uses a sophisticated Retrieval-Augmented Generation pipeline:
1. **Upload & Processing**: PDFs are parsed, chunked, and embedded using Sentence Transformers.
2. **Vector Storage**: Embeddings are stored in ChromaDB for high-speed similarity search.
3. **Querying**: User queries are embedded and matched against the vector database to retrieve the most relevant document chunks.
4. **Generation**: The context (retrieved chunks) and query are passed to the selected LLM, which streams back a comprehensive answer with inline citations.

## Tech Stack
### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Relational Data), ChromaDB (Vector Data)
- **Embeddings**: Sentence Transformers
- **LLM Integrations**: Gemini, NVIDIA, Ollama

### Frontend
- **Framework**: React + Vite + TypeScript
- **Styling**: Vanilla CSS with modern aesthetics

## LLM Providers
- **Gemini**: Google's highly capable model for rapid and accurate reasoning.
- **NVIDIA**: High-performance enterprise AI models.
- **Ollama**: Local, privacy-first inference for open-source models.

## Installation Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Git

### 1. Clone the repository
```bash
git clone https://github.com/sussyarya-afk/ResearchFlow-AI.git
cd ResearchFlow-AI
```

### 2. Environment Setup
Create a `.env` file in the `backend/` directory by copying `.env.example`:
```bash
cp backend/.env.example backend/.env
```
Fill in the necessary API keys (e.g., Gemini, NVIDIA) and your PostgreSQL connection string.

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
# Run database migrations if applicable
uvicorn app.main:app --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Project Structure
```text
ResearchFlow-AI/
├── backend/          # FastAPI server, ChromaDB integrations, LLM providers
├── frontend/         # React application, components, pages
├── README.md         # Documentation
└── .gitignore        # Excludes sensitive data (e.g., .env, local DBs, node_modules)
```

## Future Roadmap
- Collaborative workspaces for teams
- Integration with external knowledge bases (e.g., Notion, Google Drive)
- Advanced graph-based retrieval (GraphRAG)
- Automated literature review generation
