import { useState } from 'react';
import { Layers, FileSpreadsheet, FileText, Globe, Bookmark, Sparkles, Check, X } from 'lucide-react';
import './ProblemSection.css';

export function ProblemSection() {
  const [viewMode, setViewMode] = useState<'scattered' | 'unified'>('unified');

  const SCATTERED_TABS = [
    { title: 'Nature_Qubit_Error_Rate.pdf', type: 'pdf', pages: '34 pp.', status: 'Lost in Tab #17' },
    { title: 'arXiv:2403.09112v2 [cs.AI]', type: 'web', pages: '18 pp.', status: 'Unread' },
    { title: 'Methods_Section_Draft_v4_FINAL.docx', type: 'doc', pages: '12 pp.', status: 'Out of sync' },
    { title: 'Google Scholar - Citation query (94 results)', type: 'web', pages: 'Web', status: 'Lost context' },
    { title: 'Notion Research Scratchpad', type: 'note', pages: 'Notes', status: 'Unverified claims' },
    { title: 'DeepSeek_Llama3_Benchmark.pdf', type: 'pdf', pages: '42 pp.', status: 'Missing figures' },
  ];

  return (
    <section className="an-problem" id="problem">
      <div className="an-problem__container">
        {/* ── Section Header ── */}
        <div className="an-problem__header">
          <div className="an-problem__pill">
            <Layers size={13} />
            <span>The Research Paradigm Shift</span>
          </div>
          <h2 className="an-problem__title">
            Research shouldn't mean<br />
            <span className="an-problem__title-gradient">opening 30 tabs.</span>
          </h2>
          <p className="an-problem__desc">
            Modern scientific inquiry is drowning in fragmented browser tabs, disconnected PDFs,
            and ungrounded AI summaries that hallucinate facts. AgentNotebook AI unites your entire corpus into a single living workspace.
          </p>

          {/* Interactive Mode Toggle */}
          <div className="an-problem__toggle-group" role="tablist">
            <button
              type="button"
              className={`an-problem__toggle-btn ${viewMode === 'scattered' ? 'an-problem__toggle-btn--active-scattered' : ''}`}
              onClick={() => setViewMode('scattered')}
              role="tab"
              aria-selected={viewMode === 'scattered'}
            >
              <X size={14} />
              <span>30 Disconnected Tabs (The Chaos)</span>
            </button>
            <button
              type="button"
              className={`an-problem__toggle-btn ${viewMode === 'unified' ? 'an-problem__toggle-btn--active-unified' : ''}`}
              onClick={() => setViewMode('unified')}
              role="tab"
              aria-selected={viewMode === 'unified'}
            >
              <Sparkles size={14} />
              <span>AgentNotebook AI (Connected Knowledge)</span>
            </button>
          </div>
        </div>

        {/* ── Visual Comparison Canvas ── */}
        <div className="an-problem__comparison-box glass-panel">
          {viewMode === 'scattered' ? (
            <div className="an-problem__scattered-grid animate-fade-in">
              <div className="an-scattered__overlay-badge">
                <X size={14} /> Fragmented Cognitive Load · 30+ Memory Leaks
              </div>
              {SCATTERED_TABS.map((tab, idx) => (
                <div key={tab.title} className="an-scattered-card" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="an-scattered-card__top">
                    <div className="an-scattered-card__type">
                      {tab.type === 'pdf' && <FileText size={14} color="#f43f5e" />}
                      {tab.type === 'web' && <Globe size={14} color="#60a5fa" />}
                      {tab.type === 'doc' && <FileSpreadsheet size={14} color="#34d399" />}
                      {tab.type === 'note' && <Bookmark size={14} color="#fbbf24" />}
                      <span>{tab.type.toUpperCase()}</span>
                    </div>
                    <span className="an-scattered-card__status">{tab.status}</span>
                  </div>
                  <h4 className="an-scattered-card__title">{tab.title}</h4>
                  <div className="an-scattered-card__footer">
                    <span>{tab.pages}</span>
                    <span className="an-scattered-card__warning">No cross-document linkage</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="an-problem__unified-view animate-fade-in">
              <div className="an-unified__badge">
                <Check size={14} /> Unified RAG Memory Graph · Multi-hop Cross-Document Grounding
              </div>

              <div className="an-unified__grid">
                <div className="an-unified__col an-unified__col--left">
                  <div className="an-unified__card-header">
                    <span className="an-unified__section-title">Indexed Corpus</span>
                    <span className="an-unified__count">4 Sources Synchronized</span>
                  </div>
                  <div className="an-unified__doc-list">
                    <div className="an-unified__doc-item an-unified__doc-item--active">
                      <FileText size={14} className="an-text-cyan" />
                      <div>
                        <p className="an-unified__doc-name">Quantum_Error_Correction.pdf</p>
                        <span className="an-unified__doc-sub">34 pages · 128 dense vector chunks</span>
                      </div>
                    </div>
                    <div className="an-unified__doc-item">
                      <FileText size={14} className="an-text-indigo" />
                      <div>
                        <p className="an-unified__doc-name">Surface_Codes_Topological_Braid.pdf</p>
                        <span className="an-unified__doc-sub">18 pages · 72 dense vector chunks</span>
                      </div>
                    </div>
                    <div className="an-unified__doc-item">
                      <FileText size={14} className="an-text-purple" />
                      <div>
                        <p className="an-unified__doc-name">Fault_Tolerant_Superconducting_Qubits.pdf</p>
                        <span className="an-unified__doc-sub">24 pages · 96 dense vector chunks</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="an-unified__col an-unified__col--center">
                  <div className="an-unified__card-header">
                    <span className="an-unified__section-title">Synthesized Evidence & Reasoning</span>
                    <span className="an-unified__ai-tag">Grounded RAG</span>
                  </div>
                  <div className="an-unified__chat-preview">
                    <div className="an-unified__query-bubble">
                      "What threshold error rate is required for fault tolerance across these studies?"
                    </div>
                    <div className="an-unified__answer-bubble">
                      <p>
                        Across all 3 analyzed publications, fault tolerance is achieved when physical error rates fall below <strong>0.75%–1.0%</strong>. Specifically, topological surface codes demonstrate exponential suppression of syndrome errors once threshold conditions are satisfied.
                      </p>
                      <div className="an-unified__citations-row">
                        <span className="an-unified__cite-pill">Quantum_Error_Correction.pdf · p. 14</span>
                        <span className="an-unified__cite-pill">Surface_Codes_Topological.pdf · pp. 8–10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
