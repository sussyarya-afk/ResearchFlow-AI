import { useState, useEffect } from 'react';
import { Bot, Check, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import './AgentTimelineSection.css';

interface AgentTraceStep {
  id: string;
  stage: string;
  title: string;
  status: 'done' | 'running' | 'pending';
  durationMs: number;
  metadata: Record<string, string | number>;
}

export function AgentTimelineSection() {
  const [isRunning, setIsRunning] = useState(true);
  const [expandedMeta, setExpandedMeta] = useState<Record<string, boolean>>({ step_3: true });

  const BASE_STEPS: AgentTraceStep[] = [
    {
      id: 'step_1',
      stage: 'SEARCHING',
      title: 'Dense Vector Similarity Search in ChromaDB',
      status: 'done',
      durationMs: 42,
      metadata: { 'query': 'threshold error rate for fault tolerance', 'collection': 'quantum_research_v1', 'top_k': 5 },
    },
    {
      id: 'step_2',
      stage: 'RETRIEVING',
      title: 'Extracting High-Confidence Chunks with Page Bounds',
      status: 'done',
      durationMs: 78,
      metadata: { 'chunks_retrieved': 4, 'documents': 3, 'min_similarity': 0.88 },
    },
    {
      id: 'step_3',
      stage: 'ANALYZING',
      title: 'Multi-Document Cross-Verification & Entity Alignment',
      status: 'done',
      durationMs: 145,
      metadata: { 'entities_matched': 12, 'conflicts_detected': 0, 'confidence_score': '96.4%' },
    },
    {
      id: 'step_4',
      stage: 'BUILDING CONTEXT',
      title: 'PromptBuilder Strict Provenance Template Assembly',
      status: 'running',
      durationMs: 65,
      metadata: { 'context_tokens': 1420, 'guardrail_mode': 'zero_hallucination', 'citation_format': 'strict_page' },
    },
    {
      id: 'step_5',
      stage: 'REASONING',
      title: 'Multi-Hop Deduction Across Empirical Findings',
      status: 'pending',
      durationMs: 0,
      metadata: { 'model': 'llama-3.3-70b-instruct / gemini-1.5-flash', 'temperature': 0.2 },
    },
    {
      id: 'step_6',
      stage: 'GENERATING',
      title: 'Real-Time Token Streaming via SSE Channel',
      status: 'pending',
      durationMs: 0,
      metadata: { 'channel': 'EventSource /chat/stream', 'stream_format': 'chunked_sse' },
    },
    {
      id: 'step_7',
      stage: 'CITING SOURCES',
      title: 'Resolving Exact Page Ranges & Document Links',
      status: 'pending',
      durationMs: 0,
      metadata: { 'citations_anchored': 2, 'jump_target_pages': '14, 8-10' },
    },
  ];

  const [steps, setSteps] = useState<AgentTraceStep[]>(BASE_STEPS);

  // Auto animation simulation
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSteps((prevSteps) => {
        const runningIdx = prevSteps.findIndex((s) => s.status === 'running');
        const next = runningIdx === -1 ? 0 : (runningIdx + 1) % BASE_STEPS.length;
        return BASE_STEPS.map((s, i) => {
          if (i < next) return { ...s, status: 'done', durationMs: s.durationMs || 85 };
          if (i === next) return { ...s, status: 'running', durationMs: 40 };
          return { ...s, status: 'pending', durationMs: 0 };
        });
      });
    }, 2400);

    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleMeta = (stepId: string) => {
    setExpandedMeta((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const completedCount = steps.filter((s) => s.status === 'done').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <section className="an-agent-timeline-sec" id="timeline">
      <div className="an-agent-timeline__container">
        {/* ── Section Header ── */}
        <div className="an-agent-timeline__header">
          <div className="an-agent-timeline__pill">
            <Bot size={13} />
            <span>Autonomous Execution Trace</span>
          </div>
          <h2 className="an-agent-timeline__title">
            Live AI agent <span className="text-gradient-cyan">timeline.</span>
          </h2>
          <p className="an-agent-timeline__desc">
            Unlike opaque chatbots, AgentNotebook AI gives you complete real-time observability.
            Every reasoning leap, vector retrieval, and citation lookup is streamed live as it happens.
          </p>
        </div>

        {/* ── Visual Showcase Card ── */}
        <div className="an-agent-timeline__card glass-panel">
          {/* Header Bar */}
          <div className="an-agent-timeline__card-header">
            <div className="an-agent-timeline__live-badge">
              <span className="an-agent-timeline__live-dot" />
              <span>LIVE AGENT PIPELINE STREAM</span>
            </div>

            <div className="an-agent-timeline__controls">
              <span className="an-agent-timeline__progress-label">
                {progressPercent}% COMPLETE ({completedCount}/{steps.length})
              </span>
              <button
                type="button"
                className="an-agent-timeline__action-btn"
                onClick={() => setIsRunning(!isRunning)}
                title={isRunning ? 'Pause simulation' : 'Resume simulation'}
              >
                {isRunning ? 'Pause Trace' : 'Resume Trace'}
              </button>
            </div>
          </div>

          {/* Progress Indicator Bar */}
          <div className="an-agent-timeline__progress-track">
            <div className="an-agent-timeline__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Timeline Step List */}
          <ol className="an-agent-timeline__steps" aria-label="Agent execution trace steps">
            {steps.map((step, idx) => {
              const isMetaOpen = !!expandedMeta[step.id];
              return (
                <li key={step.id} className={`an-trace-step an-trace-step--${step.status}`}>
                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div className={`an-trace-step__line ${step.status === 'done' ? 'an-trace-step__line--done' : ''}`} />
                  )}

                  {/* Status Indicator Icon */}
                  <div className="an-trace-step__icon">
                    {step.status === 'done' && <Check size={12} />}
                    {step.status === 'running' && <Loader2 size={12} className="an-spin" />}
                    {step.status === 'pending' && <span className="an-trace-step__pending-dot" />}
                  </div>

                  {/* Step Body */}
                  <div className="an-trace-step__body">
                    <div className="an-trace-step__top-row">
                      <div className="an-trace-step__stage-tag">
                        <span>{step.stage}</span>
                      </div>
                      <span className="an-trace-step__title">{step.title}</span>

                      <div className="an-trace-step__meta-group">
                        {step.durationMs > 0 && (
                          <span className="an-trace-step__ms">{step.durationMs}ms</span>
                        )}
                        <button
                          type="button"
                          className="an-trace-step__meta-btn"
                          onClick={() => toggleMeta(step.id)}
                        >
                          {isMetaOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <span>Trace Meta</span>
                        </button>
                      </div>
                    </div>

                    {/* Metadata Drawer */}
                    {isMetaOpen && (
                      <div className="an-trace-step__meta-box animate-fade-in">
                        {Object.entries(step.metadata).map(([k, v]) => (
                          <div key={k} className="an-trace-meta-item">
                            <span className="an-trace-meta-key">{k}:</span>
                            <span className="an-trace-meta-val">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
