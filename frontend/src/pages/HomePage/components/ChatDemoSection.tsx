import { useState } from 'react';
import { Bot, User, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import './ChatDemoSection.css';

interface DemoQuery {
  id: string;
  prompt: string;
  answer: string;
  citations: Array<{
    doc: string;
    page: string;
    similarity: number;
    snippet: string;
  }>;
}

export function ChatDemoSection() {
  const DEMO_QUERIES: DemoQuery[] = [
    {
      id: 'findings',
      prompt: 'What are the main findings across these papers?',
      answer: 'Based on the uploaded research documents, the primary findings are threefold:\n\n1. **Fault-Tolerant Thresholds**: Quantum error correction achieves exponential syndrome suppression when physical error rates remain under 0.75% (*Quantum_Error.pdf*, p. 14).\n2. **Atmospheric Energy Imbalance**: Decadal climate observations indicate a persistent 1.24 W/m² ocean thermal uptake (*Climate_Study.pdf*, pp. 8–10).\n3. **Subquadratic Attention**: Linearized attention kernels reduce inference memory consumption by 4.8x without degrading perceptual loss metrics (*AI_Attention.pdf*, p. 6).',
      citations: [
        {
          doc: 'Quantum_Error.pdf',
          page: 'Page 14',
          similarity: 0.94,
          snippet: 'Topological stabilizer measurements suppress bit-flip and phase-flip syndrome errors exponentially below the 0.75% threshold.',
        },
        {
          doc: 'Climate_Study.pdf',
          page: 'Pages 8–10',
          similarity: 0.91,
          snippet: 'Global ocean thermal measurements between 2014 and 2024 confirm net radiation imbalance averaging +1.24 ± 0.12 W/m².',
        },
        {
          doc: 'AI_Attention.pdf',
          page: 'Page 6',
          similarity: 0.89,
          snippet: 'Subquadratic matrix factoring achieves O(N) sequence length complexity while maintaining cross-entropy parity with full softmax attention.',
        },
      ],
    },
    {
      id: 'methodology',
      prompt: 'How do the experimental setups differ between Study 1 and Study 3?',
      answer: 'Study 1 (*Quantum_Error.pdf*) employs cryogenic dilution refrigerators operating at 15mK with transmon qubits on silicon substrates, whereas Study 3 (*AI_Attention.pdf*) is a computational evaluation tested across an 8x NVIDIA H100 GPU cluster using synthetic and natural language benchmark suites.',
      citations: [
        {
          doc: 'Quantum_Error.pdf',
          page: 'Page 3',
          similarity: 0.96,
          snippet: 'Measurements performed in an Oxford Triton 200 dilution refrigerator at a base temperature of 14.8 mK.',
        },
        {
          doc: 'AI_Attention.pdf',
          page: 'Page 4',
          similarity: 0.93,
          snippet: 'Empirical throughput benchmarks measured on an 8x NVIDIA H100 80GB SXM5 node with PyTorch 2.4 compilation.',
        },
      ],
    },
  ];

  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [selectedCitation, setSelectedCitation] = useState<number | null>(0);

  const current = DEMO_QUERIES[activeQueryIndex];

  return (
    <section className="an-chat-demo" id="chat-demo">
      <div className="an-chat-demo__container">
        {/* ── Header ── */}
        <div className="an-chat-demo__header">
          <div className="an-chat-demo__pill">
            <Sparkles size={13} />
            <span>Interactive Research Conversation</span>
          </div>
          <h2 className="an-chat-demo__title">
            Ask questions. <span className="text-gradient-cyan">Get proof.</span>
          </h2>
          <p className="an-chat-demo__desc">
            Experience how AgentNotebook AI turns questions into cited research syntheses.
            Click any citation below to inspect the verbatim source text and exact page.
          </p>

          {/* Sample query buttons */}
          <div className="an-chat-demo__prompts">
            {DEMO_QUERIES.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                className={`an-prompt-chip ${idx === activeQueryIndex ? 'an-prompt-chip--active' : ''}`}
                onClick={() => { setActiveQueryIndex(idx); setSelectedCitation(0); }}
              >
                <span>"{q.prompt}"</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat Simulation Box ── */}
        <div className="an-chat-demo__box glass-panel">
          <div className="an-chat-demo__grid">
            {/* Left: Chat stream */}
            <div className="an-chat-stream">
              {/* User Bubble */}
              <div className="an-demo-msg an-demo-msg--user">
                <div className="an-demo-msg__avatar an-demo-msg__avatar--user">
                  <User size={14} />
                </div>
                <div className="an-demo-msg__content">
                  <span className="an-demo-msg__sender">Researcher</span>
                  <div className="an-demo-msg__bubble an-demo-msg__bubble--user">
                    {current.prompt}
                  </div>
                </div>
              </div>

              {/* AI Bubble */}
              <div className="an-demo-msg an-demo-msg--ai animate-fade-in">
                <div className="an-demo-msg__avatar an-demo-msg__avatar--ai">
                  <Bot size={14} />
                </div>
                <div className="an-demo-msg__content">
                  <div className="an-demo-msg__sender-row">
                    <span className="an-demo-msg__sender">AgentNotebook AI</span>
                    <span className="an-demo-msg__badge">Grounded RAG</span>
                  </div>

                  <div className="an-demo-msg__bubble an-demo-msg__bubble--ai">
                    {current.answer.split('\n\n').map((para, i) => (
                      <p key={i} className="an-demo-para">{para}</p>
                    ))}
                  </div>

                  {/* Citations List */}
                  <div className="an-demo-citations">
                    <span className="an-demo-citations__title">Verified Citations ({current.citations.length})</span>
                    <div className="an-demo-citations__list">
                      {current.citations.map((c, i) => {
                        const isSelected = i === selectedCitation;
                        return (
                          <button
                            key={c.doc + c.page}
                            type="button"
                            className={`an-demo-citation-card ${isSelected ? 'an-demo-citation-card--selected' : ''}`}
                            onClick={() => setSelectedCitation(i)}
                          >
                            <div className="an-demo-citation-card__top">
                              <FileText size={13} color="var(--color-primary-400)" />
                              <span className="an-demo-citation-card__name">{c.doc}</span>
                              <span className="an-demo-citation-card__page">{c.page}</span>
                            </div>
                            <div className="an-demo-citation-card__conf">
                              <span className="an-conf-dot" />
                              <span>{Math.round(c.similarity * 100)}% Match</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Document Inspector / Excerpt Preview */}
            <div className="an-chat-preview-doc">
              <div className="an-preview-doc__header">
                <span className="an-preview-doc__title">Document Excerpt Inspector</span>
                <span className="an-preview-doc__status">Live Jump Preview</span>
              </div>

              {selectedCitation !== null && current.citations[selectedCitation] && (
                <div className="an-preview-doc__body animate-fade-in">
                  <div className="an-preview-doc__top-bar">
                    <FileText size={16} color="#38bdf8" />
                    <div>
                      <h4 className="an-preview-doc__docname">{current.citations[selectedCitation].doc}</h4>
                      <span className="an-preview-doc__page-tag">{current.citations[selectedCitation].page}</span>
                    </div>
                  </div>

                  <div className="an-preview-doc__content-box">
                    <span className="an-preview-doc__badge">Highlighted Passage</span>
                    <blockquote className="an-preview-doc__text">
                      "{current.citations[selectedCitation].snippet}"
                    </blockquote>
                  </div>

                  <div className="an-preview-doc__footer">
                    <div className="an-preview-doc__verif">
                      <CheckCircle2 size={14} color="var(--color-success)" />
                      <span>Direct Page Proof</span>
                    </div>
                    <span className="an-preview-doc__action">
                      Clicking citation jumps to exact coordinate
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
