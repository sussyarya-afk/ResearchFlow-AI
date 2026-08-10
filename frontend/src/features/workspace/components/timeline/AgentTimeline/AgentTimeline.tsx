import { useState } from 'react';
import { Check, Loader, Circle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { AgentTimeline as AgentTimelineType, AgentStep } from '../../../types';
import './AgentTimeline.css';

interface AgentTimelineProps {
  timeline: AgentTimelineType;
}

function StepIcon({ status }: { status: AgentStep['status'] }) {
  if (status === 'done') return <Check size={11} aria-hidden="true" />;
  if (status === 'running') return <Loader size={11} className="rf-timeline-step__spin" aria-hidden="true" />;
  if (status === 'error') return <AlertCircle size={11} aria-hidden="true" />;
  return <Circle size={11} aria-hidden="true" />;
}

export function AgentTimeline({ timeline }: AgentTimelineProps) {
  const [expandedMeta, setExpandedMeta] = useState<Record<string, boolean>>({});

  const toggleMetadata = (stepId: string) => {
    setExpandedMeta(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const steps = timeline?.steps || [];
  const completedCount = steps.filter(s => s.status === 'done').length;
  const runningCount = steps.filter(s => s.status === 'running').length;
  const totalCount = steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalMs = steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0);

  return (
    <div className="rf-timeline" aria-label="Live AI Agent Trace Timeline">
      {/* ── Header & Progress Bar ── */}
      <div className="rf-timeline__header">
        <div className="rf-timeline__title-group">
          <span className="rf-timeline__label">Live Agent Timeline</span>
          {runningCount > 0 && <span className="rf-timeline__status-tag rf-timeline__status-tag--running">Active</span>}
          {completedCount > 0 && runningCount === 0 && <span className="rf-timeline__status-tag rf-timeline__status-tag--done">Complete</span>}
        </div>
        {totalMs > 0 && (
          <span className="rf-timeline__duration">{(totalMs / 1000).toFixed(2)}s total</span>
        )}
      </div>

      {totalCount > 0 && (
        <div className="rf-timeline__progress-container">
          <div className="rf-timeline__progress-bar" style={{ width: `${progressPercent}%` }} />
          <div className="rf-timeline__progress-text">
            <span>Pipeline Progress</span>
            <span>{progressPercent}% ({completedCount}/{totalCount})</span>
          </div>
        </div>
      )}

      {/* ── Event Steps List ── */}
      {steps.length === 0 ? (
        <div className="rf-timeline__empty">Waiting for pipeline events...</div>
      ) : (
        <ol className="rf-timeline__steps" aria-label="Pipeline steps">
          {steps.map((step, index) => {
            const hasMeta = step.metadata && Object.keys(step.metadata).length > 0;
            const isMetaOpen = !!expandedMeta[step.id];

            return (
              <li
                key={step.id}
                className={`rf-timeline-step rf-timeline-step--${step.status}`}
                aria-current={step.status === 'running' ? 'step' : undefined}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`rf-timeline-step__line ${step.status === 'done' ? 'rf-timeline-step__line--done' : ''}`}
                    aria-hidden="true"
                  />
                )}

                {/* Status Icon */}
                <div className="rf-timeline-step__icon" aria-hidden="true">
                  <StepIcon status={step.status} />
                </div>

                {/* Main Step Content */}
                <div className="rf-timeline-step__content">
                  <div className="rf-timeline-step__header-row">
                    <span className="rf-timeline-step__title">{step.title}</span>

                    <div className="rf-timeline-step__meta-badges">
                      {step.timestamp && (
                        <span className="rf-timeline-step__timestamp">{step.timestamp}</span>
                      )}
                      {step.durationMs !== undefined && step.durationMs > 0 && (
                        <span className="rf-timeline-step__time">{step.durationMs}ms</span>
                      )}
                      {hasMeta && (
                        <button
                          type="button"
                          className="rf-timeline-step__meta-toggle"
                          onClick={() => toggleMetadata(step.id)}
                          title="Toggle Metadata"
                        >
                          {isMetaOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          Meta
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata Drawer */}
                  {hasMeta && isMetaOpen && (
                    <div className="rf-timeline-step__metadata-box">
                      {Object.entries(step.metadata!).map(([key, val]) => (
                        <div key={key} className="rf-timeline-step__meta-item">
                          <span className="rf-timeline-step__meta-key">{key}:</span>
                          <span className="rf-timeline-step__meta-val">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
