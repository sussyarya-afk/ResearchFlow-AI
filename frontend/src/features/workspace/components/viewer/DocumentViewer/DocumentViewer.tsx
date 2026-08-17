import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, ZoomIn, ZoomOut, Download, ExternalLink, 
  ChevronLeft, ChevronRight, Search, FileCode2, Eye
} from 'lucide-react';
import { apiClient } from '@/services/api';
import type { WorkspaceDocument } from '../../../types';
import './DocumentViewer.css';

interface DocumentViewerProps {
  document: WorkspaceDocument;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  highlightText?: string;
}

export function DocumentViewer({ 
  document, 
  zoomLevel, 
  onZoomIn, 
  onZoomOut,
  currentPage = 1,
  onPageChange,
  highlightText = ''
}: DocumentViewerProps) {
  const [page, setPage] = useState<number>(currentPage);
  const [pageText, setPageText] = useState<string>('');
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const totalPages = Math.max(document.pages || 1, 1);

  // Sync internal page when prop changes
  useEffect(() => {
    if (currentPage && currentPage !== page) {
      setPage(currentPage);
    }
  }, [currentPage]);

  const loadPageContent = useCallback(async (docId: string, pageNum: number) => {
    setPageLoading(true);
    try {
      const data = await apiClient.getDocumentPage(docId, pageNum);
      if (data && typeof data.text === 'string') {
        setPageText(data.text);
      } else {
        setPageText('');
      }
    } catch (err) {
      console.warn('Could not fetch page text:', err);
      setPageText('Document content extracted and indexed in vector store.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document && document.id) {
      loadPageContent(document.id, page);
    }
  }, [document, page, loadPageContent]);

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      if (onPageChange) onPageChange(newPage);
    }
  };

  const handleDownload = () => {
    const url = apiClient.getDocumentDownloadUrl(document.id);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenInNewTab = () => {
    const url = apiClient.getDocumentFileUrl(document.id);
    window.open(url, '_blank');
  };

  const renderHighlightedContent = (text: string) => {
    const query = (searchFilter || highlightText).trim().toLowerCase();
    if (!query || !text) return text;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query ? (
        <mark key={i} className="rf-doc-viewer__highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="rf-doc-viewer" aria-label="Document viewer">
      {/* ── Toolbar ── */}
      <div className="rf-doc-viewer__toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          <FileText size={16} color="var(--color-primary-400)" />
          <span className="rf-doc-viewer__doc-name" title={document.name}>
            {document.name}
          </span>
        </div>

        {/* View mode toggle */}
        <div className="rf-doc-viewer__mode-toggle">
          <button
            className={`rf-doc-viewer__mode-btn ${viewMode === 'text' ? 'rf-doc-viewer__mode-btn--active' : ''}`}
            onClick={() => setViewMode('text')}
            title="Extracted text view"
          >
            <FileCode2 size={13} /> Text
          </button>
          <button
            className={`rf-doc-viewer__mode-btn ${viewMode === 'pdf' ? 'rf-doc-viewer__mode-btn--active' : ''}`}
            onClick={() => setViewMode('pdf')}
            title="Embedded PDF view"
          >
            <Eye size={13} /> PDF
          </button>
        </div>

        {/* Page Nav */}
        <div className="rf-doc-viewer__pagination">
          <button
            className="rf-doc-viewer__ctrl-btn"
            onClick={handlePrevPage}
            disabled={page <= 1}
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="rf-doc-viewer__page-indicator">
            {page} / {totalPages}
          </span>
          <button
            className="rf-doc-viewer__ctrl-btn"
            onClick={handleNextPage}
            disabled={page >= totalPages}
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Zoom & Action Controls */}
        <div className="rf-doc-viewer__controls">
          <button
            className="rf-doc-viewer__ctrl-btn"
            onClick={onZoomOut}
            disabled={zoomLevel <= 50}
            aria-label="Zoom out"
            id="viewer-zoom-out"
          >
            <ZoomOut size={14} />
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
            <ZoomIn size={14} />
          </button>
          <button
            className="rf-doc-viewer__ctrl-btn"
            onClick={handleDownload}
            aria-label="Download document"
            id="viewer-download"
            title="Download PDF"
          >
            <Download size={14} />
          </button>
          <button
            className="rf-doc-viewer__ctrl-btn"
            onClick={handleOpenInNewTab}
            aria-label="Open in new tab"
            id="viewer-open"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* ── Filter / Search Bar ── */}
      <div className="rf-doc-viewer__search-bar">
        <Search size={13} color="var(--color-text-tertiary)" />
        <input
          type="text"
          placeholder="Filter keywords in this document..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="rf-doc-viewer__search-input"
        />
        {highlightText && (
          <span className="rf-doc-viewer__citation-badge" title={highlightText}>
            Citation match highlighted
          </span>
        )}
      </div>

      {/* ── Document Canvas ── */}
      <div
        className="rf-doc-viewer__canvas"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        aria-label="Document content"
      >
        {viewMode === 'pdf' ? (
          <iframe
            src={`${apiClient.getDocumentFileUrl(document.id)}#page=${page}`}
            className="rf-doc-viewer__iframe"
            title={document.name}
          />
        ) : (
          <div className="rf-doc-viewer__page animate-fade-in">
            <div className="rf-doc-viewer__page-header">
              <span className="rf-doc-viewer__page-tag">
                PAGE {page} OF {totalPages}
              </span>
              <span className="rf-doc-viewer__doc-tag">
                {document.name}
              </span>
            </div>

            {pageLoading ? (
              <div className="rf-doc-viewer__loading-state">
                <div className="rf-doc-viewer__line rf-doc-viewer__line--title" />
                <div className="rf-doc-viewer__line rf-doc-viewer__line--subtitle" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rf-doc-viewer__line" style={{ width: `${80 + (i % 3) * 5}%` }} />
                ))}
              </div>
            ) : (
              <div className="rf-doc-viewer__text-content">
                {pageText ? (
                  <p className="rf-doc-viewer__extracted-text">
                    {renderHighlightedContent(pageText)}
                  </p>
                ) : (
                  <div className="rf-doc-viewer__empty-text">
                    <p>Indexed text for Page {page} is stored in vector database.</p>
                    <span className="rf-doc-viewer__sub">Switch to PDF view or ask AI in chat for citations.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Meta Footer ── */}
      <div className="rf-doc-viewer__meta">
        <span>{document.pages} pages</span>
        <span>·</span>
        <span>{document.sizeLabel}</span>
        {document.chunkCount != null && document.chunkCount > 0 && (
          <>
            <span>·</span>
            <span>{document.chunkCount} vector chunks</span>
          </>
        )}
        <span>·</span>
        <span>Status: {document.status}</span>
      </div>
    </div>
  );
}
