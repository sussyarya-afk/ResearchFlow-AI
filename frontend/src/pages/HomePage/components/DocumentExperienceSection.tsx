import { useState } from 'react';
import { FileText, UploadCloud, Brain, MessageSquare, Compass, CheckCircle } from 'lucide-react';
import './DocumentExperienceSection.css';

interface DocCard {
  title: string;
  category: string;
  pages: number;
  chunks: number;
  highlight: string;
  color: string;
}

export function DocumentExperienceSection() {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  const DOCS: DocCard[] = [
    {
      title: 'Research Paper.pdf',
      category: 'Quantum Computing',
      pages: 34,
      chunks: 142,
      highlight: 'Fault-tolerant quantum error thresholds achieve < 0.1% physical error rate using topological braid geometry.',
      color: '#38bdf8',
    },
    {
      title: 'Climate Study.pdf',
      category: 'Atmospheric Physics',
      pages: 48,
      chunks: 198,
      highlight: 'Deep ocean heat flux anomalies show a 1.24 W/m² energy imbalance over the last observational decadal cycle.',
      color: '#34d399',
    },
    {
      title: 'AI Research.pdf',
      category: 'Deep Learning',
      pages: 28,
      chunks: 116,
      highlight: 'Subquadratic attention mechanisms reduce KV-cache memory overhead by 4.8x for 128k context windows.',
      color: '#818cf8',
    },
    {
      title: 'Market Report.pdf',
      category: 'Biotech & Pharma',
      pages: 52,
      chunks: 210,
      highlight: 'Phase III oncology pipeline trials exhibit a 38% increase in accelerated FDA designations year-over-year.',
      color: '#fbbf24',
    },
  ];

  const FLOW_STEPS = [
    { step: '01', title: 'Upload', desc: 'Drag & drop scientific PDFs, papers, or clinical datasets.', icon: <UploadCloud size={16} /> },
    { step: '02', title: 'Understand', desc: 'PyMuPDF parses structure, OCR tables, and semantic boundaries.', icon: <Brain size={16} /> },
    { step: '03', title: 'Ask', desc: 'Query in natural language across multiple papers simultaneously.', icon: <MessageSquare size={16} /> },
    { step: '04', title: 'Discover', desc: 'Uncover hidden connections backed by verifiable page-level proof.', icon: <Compass size={16} /> },
  ];

  const activeDoc = DOCS[selectedDocIndex];

  return (
    <section className="an-doc-exp" id="documents">
      <div className="an-doc-exp__container">
        {/* ── Header ── */}
        <div className="an-doc-exp__header">
          <div className="an-doc-exp__pill">
            <FileText size={13} />
            <span>Multi-Document Ingestion & Synthesis</span>
          </div>
          <h2 className="an-doc-exp__title">
            Your documents, <span className="text-gradient-cyan">connected.</span>
          </h2>
          <p className="an-doc-exp__desc">
            Floating across disparate formats and academic repositories, your papers consolidate into
            a single, structured research notebook with instant semantic search.
          </p>
        </div>

        {/* ── 4-Stage Flow Cards ── */}
        <div className="an-doc-exp__flow-grid">
          {FLOW_STEPS.map((f, i) => (
            <div key={f.title} className="an-flow-card glass-panel">
              <div className="an-flow-card__top">
                <span className="an-flow-card__step">{f.step}</span>
                <div className="an-flow-card__icon">{f.icon}</div>
              </div>
              <h3 className="an-flow-card__title">{f.title}</h3>
              <p className="an-flow-card__desc">{f.desc}</p>
              {i < FLOW_STEPS.length - 1 && <div className="an-flow-card__arrow">→</div>}
            </div>
          ))}
        </div>

        {/* ── Interactive Floating Document Hub ── */}
        <div className="an-doc-exp__hub-box glass-panel">
          <div className="an-hub__grid">
            {/* Left: Floating Document Cards Selection */}
            <div className="an-hub__cards-col">
              <span className="an-hub__label">Interactive Document Corpus</span>
              <div className="an-hub__cards-list">
                {DOCS.map((doc, idx) => {
                  const isSelected = idx === selectedDocIndex;
                  return (
                    <button
                      key={doc.title}
                      type="button"
                      className={`an-floating-doc-card ${isSelected ? 'an-floating-doc-card--selected' : ''}`}
                      onClick={() => setSelectedDocIndex(idx)}
                    >
                      <div className="an-floating-doc-card__icon" style={{ color: doc.color, borderColor: `${doc.color}40` }}>
                        <FileText size={18} />
                      </div>
                      <div className="an-floating-doc-card__info">
                        <span className="an-floating-doc-card__title">{doc.title}</span>
                        <div className="an-floating-doc-card__meta">
                          <span>{doc.category}</span>
                          <span>·</span>
                          <span>{doc.pages} pages</span>
                        </div>
                      </div>
                      <span className="an-floating-doc-card__badge">{doc.chunks} Chunks</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Consolidated Notebook Preview */}
            <div className="an-hub__notebook-col animate-fade-in">
              <div className="an-notebook-view">
                <div className="an-notebook-view__header">
                  <div className="an-notebook-view__badge">
                    <span className="an-dot--green an-dot" />
                    <span>SYNCHRONIZED WITH AGENTNOTEBOOK OS</span>
                  </div>
                  <span className="an-notebook-view__doc-tag" style={{ color: activeDoc.color }}>
                    {activeDoc.title}
                  </span>
                </div>

                <div className="an-notebook-view__body">
                  <div className="an-notebook-view__meta-bar">
                    <span className="an-notebook-view__meta-item"><strong>Index Status:</strong> Ready</span>
                    <span className="an-notebook-view__meta-item"><strong>Pages:</strong> {activeDoc.pages}</span>
                    <span className="an-notebook-view__meta-item"><strong>Embeddings:</strong> 384-dim Dense</span>
                  </div>

                  <div className="an-notebook-view__quote-box">
                    <span className="an-quote-label">Semantic Key Highlight (Page 14)</span>
                    <blockquote className="an-quote-text">
                      "{activeDoc.highlight}"
                    </blockquote>
                  </div>

                  <div className="an-notebook-view__footer">
                    <div className="an-notebook-view__provenance">
                      <CheckCircle size={14} color="var(--color-success)" />
                      <span>Direct Citation Provenance Verified</span>
                    </div>
                    <span className="an-notebook-view__open-hint">
                      Ready for multi-turn research Q&A
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
