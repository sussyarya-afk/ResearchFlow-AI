import { Database, Server, Cpu, Layers, ShieldCheck, Terminal, ArrowDown, Activity, Sparkles } from 'lucide-react';
import './ArchitectureSection.css';

export function ArchitectureSection() {
  const TECH_BADGES = [
    { name: 'React 19', role: 'Frontend UI', color: '#38bdf8' },
    { name: 'TypeScript', role: 'Strict Type System', color: '#60a5fa' },
    { name: 'FastAPI', role: 'Async Python Backend', color: '#34d399' },
    { name: 'Python 3.13', role: 'Core Compute Engine', color: '#fbbf24' },
    { name: 'PostgreSQL', role: 'Relational & Auth DB', color: '#818cf8' },
    { name: 'ChromaDB', role: 'Vector Store (HNSW)', color: '#c084fc' },
    { name: 'Sentence Transformers', role: 'Dense Embeddings', color: '#38bdf8' },
    { name: 'PyMuPDF', role: 'PDF Structural OCR', color: '#f43f5e' },
    { name: 'Server-Sent Events', role: 'Real-time Streaming', color: '#34d399' },
    { name: 'NVIDIA NIM', role: 'Accelerated Inference', color: '#76b900' },
    { name: 'Google Gemini', role: 'Million-Token Context', color: '#38bdf8' },
    { name: 'Ollama', role: 'Air-Gapped Local LLMs', color: '#a78bfa' },
  ];

  const PIPELINE_FLOW = [
    { node: 'RESEARCHER / USER', tag: 'Client Query', icon: <Terminal size={14} /> },
    { node: 'AGENTNOTEBOOK UI', tag: 'React 19 + TypeScript', icon: <Layers size={14} /> },
    { node: 'FASTAPI ASYNC GATEWAY', tag: 'OAuth2 JWT + SSE', icon: <Server size={14} /> },
    { node: 'RAG REASONING ENGINE', tag: 'PromptBuilder Guardrails', icon: <Cpu size={14} /> },
    { node: 'SEMANTIC RETRIEVAL', tag: 'Dense Cosine Similarity', icon: <Activity size={14} /> },
    { node: 'CHROMADB VECTOR STORE', tag: '384d Embeddings Index', icon: <Database size={14} /> },
    { node: 'LLM PROVIDER', tag: 'NVIDIA / Gemini / Ollama', icon: <Sparkles size={14} /> },
    { node: 'GROUNDED RESPONSE & PROOF', tag: 'Verifiable Citations', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <section className="an-arch-sec" id="technology">
      <div className="an-arch__container">
        {/* ── Header ── */}
        <div className="an-arch__header">
          <div className="an-arch__pill">
            <Layers size={13} />
            <span>Full-Stack Architecture</span>
          </div>
          <h2 className="an-arch__title">
            Engineered for <span className="text-gradient-cyan">speed & precision.</span>
          </h2>
          <p className="an-arch__desc">
            A state-of-the-art asynchronous architecture combining Python, FastAPI, ChromaDB,
            and modular LLM providers with microsecond vector indexing.
          </p>
        </div>

        {/* ── Technical Pipeline Flow Diagram ── */}
        <div className="an-arch__flow-card glass-panel">
          <div className="an-arch__flow-header">
            <span className="an-arch__flow-badge">End-to-End Execution Graph</span>
            <span className="an-arch__flow-sub">Deterministic RAG Data Topology</span>
          </div>

          <div className="an-arch__pipeline-track">
            {PIPELINE_FLOW.map((step, idx) => (
              <div key={step.node} className="an-arch-node">
                <div className="an-arch-node__box">
                  <div className="an-arch-node__icon">{step.icon}</div>
                  <div className="an-arch-node__info">
                    <span className="an-arch-node__name">{step.node}</span>
                    <span className="an-arch-node__tag">{step.tag}</span>
                  </div>
                </div>
                {idx < PIPELINE_FLOW.length - 1 && (
                  <div className="an-arch-node__arrow">
                    <ArrowDown size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Technologies Grid ── */}
        <div className="an-arch__tech-grid">
          {TECH_BADGES.map((t) => (
            <div key={t.name} className="an-tech-pill glass-panel">
              <span className="an-tech-pill__dot" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
              <div className="an-tech-pill__content">
                <span className="an-tech-pill__name">{t.name}</span>
                <span className="an-tech-pill__role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
