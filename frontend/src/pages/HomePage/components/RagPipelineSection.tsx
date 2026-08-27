import { useState } from 'react';
import { FileText, Scissors, Binary, Search, BrainCircuit, MessageSquare, Quote, CheckCircle2, ShieldCheck } from 'lucide-react';
import './RagPipelineSection.css';

interface PipelineStep {
  id: string;
  name: string;
  badge: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  technicalDetails: {
    technology: string;
    throughput: string;
    transformation: string;
    codeSnippet: string;
  };
}

export function RagPipelineSection() {
  const [activeStepId, setActiveStepId] = useState<string>('embeddings');

  const STEPS: PipelineStep[] = [
    {
      id: 'documents',
      name: '1. Documents',
      badge: 'PyMuPDF Engine',
      icon: <FileText size={18} />,
      title: 'High-Fidelity PDF & Multi-Document Ingestion',
      desc: 'Raw scientific papers, clinical trials, and reports are ingested with full preservation of page numbers, column layouts, table structures, and metadata.',
      technicalDetails: {
        technology: 'PyMuPDF (fitz) + Python async parser',
        throughput: 'Up to 50MB per document (instant page mapping)',
        transformation: 'Binary PDF Stream → Page-Indexed Text Matrix',
        codeSnippet: 'doc = fitz.open(stream=file_bytes)\npage_text = doc[page_num].get_text("text")',
      },
    },
    {
      id: 'extraction',
      name: '2. Text Extraction',
      badge: 'Regex Normalizer',
      icon: <Scissors size={18} />,
      title: 'Structural Cleaning & Provenance Tagging',
      desc: 'Heuristic text cleaning removes hyphenation artifacts, headers/footers, and preserves mathematical notations and paragraph boundaries.',
      technicalDetails: {
        technology: 'Custom TextCleaner + Unicode Normalizer',
        throughput: '< 15ms per 100 pages',
        transformation: 'Raw strings → Normalized sentences with page bounds',
        codeSnippet: 'cleaned = clean_extracted_text(raw_text)\ntagged_blocks = tag_page_boundaries(cleaned)',
      },
    },
    {
      id: 'chunking',
      name: '3. Chunking',
      badge: 'Sliding Window',
      icon: <Scissors size={18} />,
      title: 'Recursive Semantic Chunking with Overlap',
      desc: 'Documents are partitioned into optimal semantic chunks (500–1000 characters) with 15% sliding overlap to preserve cross-boundary reasoning context.',
      technicalDetails: {
        technology: 'RecursiveCharacterTextSplitter + Sentence Windowing',
        throughput: 'Adaptive chunk sizes with token boundary detection',
        transformation: 'Full text → Multi-page chunk tuples with exact line ranges',
        codeSnippet: 'chunks = chunk_text(pages, chunk_size=800, overlap=120)\n# Preserves page_start & page_end strictly',
      },
    },
    {
      id: 'embeddings',
      name: '4. Embeddings',
      badge: 'Dense Vectors',
      icon: <Binary size={18} />,
      title: 'High-Dimensional Dense Vector Embeddings',
      desc: 'State-of-the-art sentence transformer models convert text chunks into 384-dimensional dense semantic vectors optimized for domain-specific scientific similarity.',
      technicalDetails: {
        technology: 'SentenceTransformers (all-MiniLM-L6-v2 / BGE)',
        throughput: 'Local GPU / CPU vectorized batching',
        transformation: 'Text chunk → 384-dimensional dense float32 array',
        codeSnippet: 'embedding = model.encode(chunk["text"], normalize_embeddings=True)',
      },
    },
    {
      id: 'retrieval',
      name: '5. Semantic Retrieval',
      badge: 'ChromaDB HNSW',
      icon: <Search size={18} />,
      title: 'Cosine Distance Metric & HNSW Indexing',
      desc: 'Project-scoped ChromaDB collections query vector similarity in milliseconds, ranking the top K most relevant excerpts with exact cosine confidence scores.',
      technicalDetails: {
        technology: 'ChromaDB Vector Store + Cosine Distance Index',
        throughput: '< 12ms query latency over 100k chunks',
        transformation: 'Query Vector → Top K Ranked Chunks + Confidence (%)',
        codeSnippet: 'results = collection.query(query_embeddings=[q_vec], n_results=5)',
      },
    },
    {
      id: 'rag',
      name: '6. RAG Engine',
      badge: 'Strict Grounding',
      icon: <BrainCircuit size={18} />,
      title: 'PromptBuilder Grounded Context Synthesis',
      desc: 'Retrieved context is injected into a strict zero-hallucination PromptBuilder system template that mandates citations and refuses fabricated claims.',
      technicalDetails: {
        technology: 'AgentNotebook PromptBuilder + Provable Context Injection',
        throughput: 'Strict zero-hallucination guardrails',
        transformation: 'Ranked chunks + User query → Grounded LLM Prompt',
        codeSnippet: 'prompt = prompt_builder.build_prompt(query, retrieved_chunks)\n# "Answer based ONLY on provided context"',
      },
    },
    {
      id: 'answer',
      name: '7. AI Answer',
      badge: 'SSE Streaming',
      icon: <MessageSquare size={18} />,
      title: 'Real-time Token Streaming & Fallback Guard',
      desc: 'Model tokens stream in real time via Server-Sent Events (SSE), backed by local grounded synthesis if external providers encounter quota limits.',
      technicalDetails: {
        technology: 'FastAPI StreamingResponse + Server-Sent Events (SSE)',
        throughput: 'Sub-30ms first-token latency',
        transformation: 'LLM Stream → EventSource data: {"type": "token", "content": "..."}',
        codeSnippet: 'async for chunk in provider.generate_stream(prompt):\n    yield f"data: {json.dumps({\'type\': \'token\', \'content\': chunk})}\\n\\n"',
      },
    },
    {
      id: 'citations',
      name: '8. Citations',
      badge: 'Provable Evidence',
      icon: <Quote size={18} />,
      title: 'Verifiable Evidence Links & Page Jumps',
      desc: 'Every generated claim links directly to its source document, exact page range, verbatim excerpt, and similarity confidence percentage.',
      technicalDetails: {
        technology: 'PostgreSQL Message Citation Persistence + PyMuPDF Page API',
        throughput: 'Direct PDF canvas jump on click',
        transformation: 'Chunk Metadata → Interactive Citation Card + Page Viewer',
        codeSnippet: 'await CitationRepository.create_bulk(db, ai_msg.id, sources)',
      },
    },
  ];

  const currentStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <section className="an-pipeline" id="pipeline">
      <div className="an-pipeline__container">
        {/* ── Section Header ── */}
        <div className="an-pipeline__header">
          <div className="an-pipeline__pill">
            <BrainCircuit size={13} />
            <span>Under the Hood</span>
          </div>
          <h2 className="an-pipeline__title">
            From documents to <span className="text-gradient-cyan">answers.</span>
          </h2>
          <p className="an-pipeline__desc">
            Explore the exact 8-stage intelligence architecture powering AgentNotebook AI.
            Answers are strictly grounded in your indexed sources with provable provenance.
          </p>
        </div>

        {/* ── Interactive Horizontal Step Bar ── */}
        <div className="an-pipeline__rail" role="tablist">
          {STEPS.map((step) => {
            const isActive = step.id === activeStepId;
            return (
              <button
                key={step.id}
                type="button"
                className={`an-rail-btn ${isActive ? 'an-rail-btn--active' : ''}`}
                onClick={() => setActiveStepId(step.id)}
                role="tab"
                aria-selected={isActive}
              >
                <div className="an-rail-btn__icon">{step.icon}</div>
                <span className="an-rail-btn__name">{step.name.split('. ')[1]}</span>
                <span className="an-rail-btn__badge">{step.badge}</span>
              </button>
            );
          })}
        </div>

        {/* ── Deep-Dive Detail Inspector Card ── */}
        <div className="an-pipeline__inspector glass-panel animate-fade-in">
          <div className="an-inspector__grid">
            {/* Left: Functional Explanation */}
            <div className="an-inspector__main">
              <div className="an-inspector__top">
                <span className="an-inspector__step-badge">{currentStep.name}</span>
                <span className="an-inspector__tech-badge">
                  <ShieldCheck size={13} />
                  {currentStep.technicalDetails.technology}
                </span>
              </div>

              <h3 className="an-inspector__title">{currentStep.title}</h3>
              <p className="an-inspector__desc">{currentStep.desc}</p>

              <div className="an-inspector__specs">
                <div className="an-spec-card">
                  <span className="an-spec-card__label">Latency & Throughput</span>
                  <span className="an-spec-card__val">{currentStep.technicalDetails.throughput}</span>
                </div>
                <div className="an-spec-card">
                  <span className="an-spec-card__label">Data Transformation</span>
                  <span className="an-spec-card__val">{currentStep.technicalDetails.transformation}</span>
                </div>
              </div>
            </div>

            {/* Right: Technical Code & Pipeline State */}
            <div className="an-inspector__code-col">
              <div className="an-inspector__code-header">
                <div className="an-hero__visual-dots">
                  <span className="an-dot an-dot--red" />
                  <span className="an-dot an-dot--yellow" />
                  <span className="an-dot an-dot--green" />
                </div>
                <span className="an-code-title">backend/app/services/{currentStep.id}.py</span>
              </div>
              <pre className="an-inspector__code-block">
                <code>{currentStep.technicalDetails.codeSnippet}</code>
              </pre>
              <div className="an-inspector__guarantee">
                <CheckCircle2 size={14} color="var(--color-success)" />
                <span>Deterministic provenance guarantee active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
