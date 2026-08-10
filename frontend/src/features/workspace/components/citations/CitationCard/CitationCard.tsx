import { ExternalLink, FileText } from 'lucide-react';
import type { Citation } from '../../../types';
import './CitationCard.css';

interface CitationCardProps {
  citation: Citation;
  index: number;
  onOpenDocument?: (documentId: string, pageNumber: number) => void;
}

export function CitationCard({ citation, index, onOpenDocument }: CitationCardProps) {
  const similarityPct = Math.round(citation.similarity * 100);
  
  const getBadgeColor = (sim: number) => {
    if (sim >= 0.85) return 'var(--color-success)';
    if (sim >= 0.7) return 'var(--color-warning)';
    return 'var(--color-text-muted)';
  };
  const badgeColor = getBadgeColor(citation.similarity);

  return (
    <article
      className="rf-citation-card"
      aria-label={`Citation ${index + 1}: ${citation.document_name}`}
    >
      {/* ── Source info ── */}
      <div className="rf-citation-card__source">
        <div className="rf-citation-card__icon" aria-hidden="true">
          <FileText size={13} />
        </div>
        <div className="rf-citation-card__source-info">
          <span className="rf-citation-card__doc-name" title={citation.document_name}>
            {citation.document_name}
          </span>
          <span className="rf-citation-card__page">
            Page {citation.page_start === citation.page_end ? citation.page_start : `${citation.page_start}-${citation.page_end}`}
          </span>
        </div>
        <div
          className="rf-citation-card__confidence"
          style={{ color: badgeColor }}
          aria-label={`Similarity: ${similarityPct}%`}
          title={`Similarity score: ${similarityPct}%`}
        >
          <span
            className="rf-citation-card__conf-dot"
            style={{ background: badgeColor }}
            aria-hidden="true"
          />
          {similarityPct}%
        </div>
      </div>

      {/* ── Excerpt ── */}
      <blockquote className="rf-citation-card__excerpt">
        "{citation.excerpt}"
      </blockquote>

      {/* ── Actions ── */}
      <div className="rf-citation-card__actions">
        <button
          className="rf-citation-card__open-btn"
          aria-label={`Open ${citation.document_name} at page ${citation.page_start}`}
          id={`citation-open-${citation.chunk_id}`}
          onClick={() => onOpenDocument?.(citation.document_id, citation.page_start)}
        >
          <ExternalLink size={12} aria-hidden="true" />
          Open Document
        </button>
      </div>
    </article>
  );
}
