import { useState } from 'react';
import { Quote, FileText, ShieldCheck, Eye } from 'lucide-react';
import './CitationsSection.css';

export function CitationsSection() {
  const [activeCitation, setActiveCitation] = useState<number>(0);

  const CITATION_CASES = [
    {
      doc: 'Quantum_Fault_Tolerance_2024.pdf',
      pages: 'Page 14 (Lines 112–148)',
      similarity: 0.96,
      claim: 'Topological surface codes exhibit fault-tolerant threshold rates below 0.75%.',
      verbatim: '“Through empirical syndrome decoding on superconducting architectures, we demonstrate that when physical error rates ε_p < 0.75%, logical error rates decay exponentially with code distance d.”',
      confidenceGrade: 'Highest Confidence · Direct Empirical Measurement',
      jumpTarget: 'PDF Page 14 / Vector Chunk #42',
    },
    {
      doc: 'Decadal_Climate_Dynamics.pdf',
      pages: 'Pages 8–10 (Section 3.2)',
      similarity: 0.92,
      claim: 'Global planetary energy imbalance averages +1.24 ± 0.12 W/m² over the recent 10-year cycle.',
      verbatim: '“Integrating satellite radiometric balances with ocean profiling floats produces a global net thermal storage flux of 1.24 W/m², consistent with model predictions for greenhouse radiative forcing.”',
      confidenceGrade: 'High Confidence · Cross-Sensor Radiometric Data',
      jumpTarget: 'PDF Page 8 / Vector Chunk #89',
    },
    {
      doc: 'Linear_Attention_Transformers.pdf',
      pages: 'Page 6 (Table 2 & Equation 4)',
      similarity: 0.89,
      claim: 'Linear attention kernels compress KV-cache memory footprints by 4.8x without perplexity penalties.',
      verbatim: '“Benchmarking on 128k context sequences reveals an average 4.8× reduction in GPU VRAM allocation, preserving 99.4% of standard softmax validation perplexity.”',
      confidenceGrade: 'High Confidence · Empirical Benchmark Parity',
      jumpTarget: 'PDF Page 6 / Vector Chunk #27',
    },
  ];

  const current = CITATION_CASES[activeCitation];

  return (
    <section className="an-citations-sec" id="citations">
      <div className="an-citations__container">
        {/* ── Header ── */}
        <div className="an-citations__header">
          <div className="an-citations__pill">
            <Quote size={13} />
            <span>Zero Hallucination Guarantee</span>
          </div>
          <h2 className="an-citations__title">
            Every answer has <span className="text-gradient-cyan">evidence.</span>
          </h2>
          <p className="an-citations__desc">
            Never wonder where an AI got its answers. Every synthesis is deterministically linked
            to source page coordinates, excerpt bounds, and semantic similarity scores.
          </p>
        </div>

        {/* ── Visual Provenance Flow ── */}
        <div className="an-citations__workflow-bar">
          <div className="an-wf-step">
            <span className="an-wf-step__num">1</span>
            <span className="an-wf-step__label">Grounded AI Answer</span>
          </div>
          <div className="an-wf-arrow">→</div>
          <div className="an-wf-step an-wf-step--highlight">
            <span className="an-wf-step__num">2</span>
            <span className="an-wf-step__label">Anchor Citation</span>
          </div>
          <div className="an-wf-arrow">→</div>
          <div className="an-wf-step">
            <span className="an-wf-step__num">3</span>
            <span className="an-wf-step__label">Open Document</span>
          </div>
          <div className="an-wf-arrow">→</div>
          <div className="an-wf-step an-wf-step--highlight">
            <span className="an-wf-step__num">4</span>
            <span className="an-wf-step__label">Jump to Exact Page</span>
          </div>
        </div>

        {/* ── Interactive Provenance Inspector ── */}
        <div className="an-citations__inspector glass-panel">
          <div className="an-citations__grid">
            {/* Left: Citation List */}
            <div className="an-citations__list-col">
              <span className="an-citations__col-label">Select Verified Citation</span>
              <div className="an-citations__cards">
                {CITATION_CASES.map((item, idx) => {
                  const isSelected = idx === activeCitation;
                  const pct = Math.round(item.similarity * 100);
                  return (
                    <button
                      key={item.doc}
                      type="button"
                      className={`an-cite-card ${isSelected ? 'an-cite-card--selected' : ''}`}
                      onClick={() => setActiveCitation(idx)}
                    >
                      <div className="an-cite-card__header">
                        <FileText size={15} color="var(--color-primary-400)" />
                        <span className="an-cite-card__doc">{item.doc}</span>
                      </div>
                      <p className="an-cite-card__claim">"{item.claim}"</p>
                      <div className="an-cite-card__footer">
                        <span className="an-cite-card__pages">{item.pages}</span>
                        <div className="an-cite-card__score">
                          <span className="an-score-dot" />
                          <span>{pct}% Match</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Page Jump Simulation Card */}
            <div className="an-citations__proof-col animate-fade-in">
              <div className="an-proof-card">
                <div className="an-proof-card__header">
                  <div className="an-proof-card__badge">
                    <ShieldCheck size={14} color="var(--color-success)" />
                    <span>DETERMINISTIC CITATION PROVENANCE</span>
                  </div>
                  <span className="an-proof-card__coords">{current.jumpTarget}</span>
                </div>

                <div className="an-proof-card__body">
                  <div className="an-proof-card__source-box">
                    <div className="an-proof-card__source-top">
                      <span className="an-proof-card__doc-title">{current.doc}</span>
                      <span className="an-proof-card__badge-sub">{current.pages}</span>
                    </div>
                    <span className="an-proof-card__grade">{current.confidenceGrade}</span>
                  </div>

                  <div className="an-proof-card__excerpt-box">
                    <span className="an-excerpt-label">Verbatim Ground Truth in Source PDF</span>
                    <blockquote className="an-excerpt-text">
                      {current.verbatim}
                    </blockquote>
                  </div>

                  <div className="an-proof-card__actions">
                    <div className="an-proof-jump-btn">
                      <Eye size={14} />
                      <span>Viewing Page in PyMuPDF Viewer</span>
                    </div>
                    <span className="an-proof-action-sub">
                      Confidence Score: {Math.round(current.similarity * 100)}%
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
