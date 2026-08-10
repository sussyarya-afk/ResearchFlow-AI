import { FileText, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';
import type { WorkspaceDocument } from '../../../types';
import './DocumentViewer.css';

interface DocumentViewerProps {
  document: WorkspaceDocument;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function DocumentViewer({ document, zoomLevel, onZoomIn, onZoomOut }: DocumentViewerProps) {
  return (
    <div className="rf-doc-viewer" aria-label="Document viewer">
      {/* ── Toolbar ── */}
      <div className="rf-doc-viewer__toolbar">
        <span className="rf-doc-viewer__doc-name" title={document.name}>
          {document.name}
        </span>
        <div className="rf-doc-viewer__controls">
          <button
            className="rf-doc-viewer__ctrl-btn"
            onClick={onZoomOut}
            disabled={zoomLevel <= 50}
            aria-label="Zoom out"
            id="viewer-zoom-out"
          >
            <ZoomOut size={14} aria-hidden="true" />
          </button>
          <span className="rf-doc-viewer__zoom" aria-label={`Zoom level: ${zoomLevel}%`}>
            {zoomLevel}%
          </span>
          <button
            className="rf-doc-viewer__ctrl-btn"
            onClick={onZoomIn}
            disabled={zoomLevel >= 200}
            aria-label="Zoom in"
            id="viewer-zoom-in"
          >
            <ZoomIn size={14} aria-hidden="true" />
          </button>
          <button
            className="rf-doc-viewer__ctrl-btn"
            aria-label="Download document"
            id="viewer-download"
          >
            <Download size={14} aria-hidden="true" />
          </button>
          <button
            className="rf-doc-viewer__ctrl-btn"
            aria-label="Open in new tab"
            id="viewer-open"
          >
            <ExternalLink size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── PDF Placeholder ── */}
      <div
        className="rf-doc-viewer__canvas"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        aria-label="PDF preview"
      >
        {/* Thumbnail */}
        <div
          className="rf-doc-viewer__thumb"
          style={{ background: document.thumbnailColor }}
          aria-hidden="true"
        >
          <FileText size={48} color="rgba(255,255,255,0.6)" />
        </div>

        {/* Simulated page lines */}
        <div className="rf-doc-viewer__page">
          <div className="rf-doc-viewer__page-header">
            <div className="rf-doc-viewer__line rf-doc-viewer__line--title" />
            <div className="rf-doc-viewer__line rf-doc-viewer__line--subtitle" />
          </div>
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="rf-doc-viewer__line"
              style={{ width: `${75 + Math.sin(i * 1.7) * 15}%`, opacity: 0.3 + (i % 3) * 0.1 }}
            />
          ))}
          <p className="rf-doc-viewer__placeholder-text">
            PDF rendering is not implemented in this demo.
          </p>
        </div>
      </div>

      {/* ── Meta ── */}
      <div className="rf-doc-viewer__meta">
        <span>{document.pages} pages</span>
        <span>·</span>
        <span>{document.sizeLabel}</span>
        {document.chunkCount != null && document.chunkCount > 0 && (
          <>
            <span>·</span>
            <span>{document.chunkCount} chunks</span>
          </>
        )}
        <span>·</span>
        <span>Uploaded {document.uploadedAt}</span>
      </div>
    </div>
  );
}
