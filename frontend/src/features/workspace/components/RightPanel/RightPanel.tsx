import { Quote } from 'lucide-react';
import { DocumentViewer } from '../viewer/DocumentViewer';
import { CitationCard } from '../citations/CitationCard';
import type { WorkspaceDocument, Citation } from '../../types';
import './RightPanel.css';

interface RightPanelProps {
  document: WorkspaceDocument;
  citations: Citation[];
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function RightPanel({
  document,
  citations,
  zoomLevel,
  onZoomIn,
  onZoomOut,
}: RightPanelProps) {
  return (
    <aside className="rf-ws-right" aria-label="Document viewer and citations">
      {/* ── Document viewer ── */}
      <div className="rf-ws-right__viewer">
        <DocumentViewer
          document={document}
          zoomLevel={zoomLevel}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </div>

      {/* ── Citations ── */}
      {citations.length > 0 && (
        <div className="rf-ws-right__citations">
          <div className="rf-ws-right__citations-header">
            <Quote size={14} className="rf-ws-right__citations-icon" aria-hidden="true" />
            <h3 className="rf-ws-right__citations-title">
              Citations
              <span className="rf-ws-right__citations-count">{citations.length}</span>
            </h3>
          </div>
          <div className="rf-ws-right__citations-list" role="list" aria-label="Source citations">
            {citations.map((citation, i) => (
              <div key={citation.chunk_id} role="listitem">
                <CitationCard citation={citation} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
