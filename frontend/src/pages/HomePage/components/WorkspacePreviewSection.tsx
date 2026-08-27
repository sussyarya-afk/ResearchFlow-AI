import { useState } from 'react';
import { LayoutDashboard, FileText, Eye } from 'lucide-react';
import './WorkspacePreviewSection.css';

export function WorkspacePreviewSection() {
  const [activePane, setActivePane] = useState<'all' | 'left' | 'center' | 'right'>('all');

  return (
    <section className="an-ws-preview" id="workspace-preview">
      <div className="an-ws-preview__container">
        {/* ── Header ── */}
        <div className="an-ws-preview__header">
          <div className="an-ws-preview__pill">
            <LayoutDashboard size={13} />
            <span>Research Operating System</span>
          </div>
          <h2 className="an-ws-preview__title">
            The three-pane <span className="text-gradient-cyan">workspace.</span>
          </h2>
          <p className="an-ws-preview__desc">
            Engineered as a research OS. Navigate your knowledge corpus on the left, collaborate with
            intelligent agent reasoning in the center, and inspect verifiable PDF coordinates on the right.
          </p>

          {/* Pane filter controls */}
          <div className="an-ws-preview__tabs" role="tablist">
            <button
              type="button"
              className={`an-ws-tab ${activePane === 'all' ? 'an-ws-tab--active' : ''}`}
              onClick={() => setActivePane('all')}
            >
              All 3 Panes (Unified OS)
            </button>
            <button
              type="button"
              className={`an-ws-tab ${activePane === 'left' ? 'an-ws-tab--active' : ''}`}
              onClick={() => setActivePane('left')}
            >
              Left Pane · Corpus & Notes
            </button>
            <button
              type="button"
              className={`an-ws-tab ${activePane === 'center' ? 'an-ws-tab--active' : ''}`}
              onClick={() => setActivePane('center')}
            >
              Center Pane · AI & Timeline
            </button>
            <button
              type="button"
              className={`an-ws-tab ${activePane === 'right' ? 'an-ws-tab--active' : ''}`}
              onClick={() => setActivePane('right')}
            >
              Right Pane · PDF Viewer
            </button>
          </div>
        </div>

        {/* ── Mock 3-Pane OS Shell ── */}
        <div className="an-ws-shell glass-panel">
          {/* Top Window Bar */}
          <div className="an-ws-shell__bar">
            <div className="an-hero__visual-dots">
              <span className="an-dot an-dot--red" />
              <span className="an-dot an-dot--yellow" />
              <span className="an-dot an-dot--green" />
            </div>
            <div className="an-ws-shell__title-badge">
              <span>AgentNotebook OS · Project: Quantum_Error_Correction</span>
            </div>
            <div className="an-ws-shell__status">
              <span className="an-dot--green an-dot" />
              <span>ChromaDB Sync Active</span>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className={`an-ws-shell__columns an-ws-shell__columns--${activePane}`}>
            {/* 1. Left Panel */}
            <div className="an-ws-col an-ws-col--left">
              <div className="an-col-header">
                <span className="an-col-title">Knowledge Corpus</span>
                <span className="an-col-badge">3 Indexed</span>
              </div>

              <div className="an-left-nav-pills">
                <span className="an-nav-pill an-nav-pill--active">Documents (3)</span>
                <span className="an-nav-pill">Research Notes (2)</span>
                <span className="an-nav-pill">AI Agents (4)</span>
              </div>

              <div className="an-left-docs">
                <div className="an-mini-doc an-mini-doc--active">
                  <FileText size={14} color="#38bdf8" />
                  <div className="an-mini-doc__info">
                    <span className="an-mini-doc__name">Quantum_Error.pdf</span>
                    <span className="an-mini-doc__sub">34 pages · 142 chunks</span>
                  </div>
                </div>
                <div className="an-mini-doc">
                  <FileText size={14} color="#818cf8" />
                  <div className="an-mini-doc__info">
                    <span className="an-mini-doc__name">Surface_Codes.pdf</span>
                    <span className="an-mini-doc__sub">18 pages · 72 chunks</span>
                  </div>
                </div>
                <div className="an-mini-doc">
                  <FileText size={14} color="#34d399" />
                  <div className="an-mini-doc__info">
                    <span className="an-mini-doc__name">Topological_Braid.pdf</span>
                    <span className="an-mini-doc__sub">24 pages · 96 chunks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Center Panel */}
            <div className="an-ws-col an-ws-col--center">
              <div className="an-col-header">
                <span className="an-col-title">Research Chat & Live Trace</span>
                <span className="an-col-ai-badge">Gemini / NVIDIA NIM</span>
              </div>

              <div className="an-center-chat">
                <div className="an-center-bubble an-center-bubble--user">
                  "What is the syndrome error threshold in Study 1?"
                </div>
                <div className="an-center-bubble an-center-bubble--ai">
                  <p>
                    According to <em>Quantum_Error.pdf</em> (Page 14), the physical syndrome error threshold is <strong>0.75%</strong>. Stabilizers exponentially suppress logical bit-flips once this condition is met.
                  </p>
                  {/* Embedded live agent timeline */}
                  <div className="an-center-timeline">
                    <div className="an-center-timeline__head">
                      <span className="an-dot--green an-dot" />
                      <span>Live Agent Trace: SEARCHING (42ms) → RETRIEVING (78ms) → CITING (18ms)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Right Panel */}
            <div className="an-ws-col an-ws-col--right">
              <div className="an-col-header">
                <span className="an-col-title">PyMuPDF Document Canvas</span>
                <span className="an-col-page-num">Page 14 of 34</span>
              </div>

              <div className="an-right-viewer">
                <div className="an-pdf-preview-box">
                  <div className="an-pdf-header-bar">
                    <span>Quantum_Fault_Tolerance.pdf (p. 14)</span>
                    <Eye size={12} />
                  </div>
                  <div className="an-pdf-mock-page">
                    <div className="an-mock-line an-mock-line--head" />
                    <div className="an-mock-line" />
                    <div className="an-mock-line an-mock-line--highlight">
                      [Highlighted Vector Chunk #42]: "physical error rate ε_p &lt; 0.75%"
                    </div>
                    <div className="an-mock-line" />
                    <div className="an-mock-line an-mock-line--short" />
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
