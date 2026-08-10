import { FileText, StickyNote, Bot, BookOpen, Upload, ChevronRight, AlertCircle } from 'lucide-react';
import type { WorkspaceDocument, WorkspaceProject } from '../../types';
import './LeftPanel.css';

type LeftTab = 'documents' | 'notes' | 'agents' | 'sources';

interface LeftPanelProps {
  project: WorkspaceProject;
  documents: WorkspaceDocument[];
  documentsLoading?: boolean;
  documentsError?: string | null;
  activeDocumentId: string;
  onDocumentSelect: (id: string) => void;
  activeTab: LeftTab;
  onTabChange: (tab: LeftTab) => void;
  onUploadClick: () => void;
}

const NAV_TABS: { id: LeftTab; label: string; icon: React.ReactNode }[] = [
  { id: 'documents', label: 'Documents', icon: <FileText size={15} /> },
  { id: 'notes', label: 'Notes', icon: <StickyNote size={15} /> },
  { id: 'agents', label: 'AI Agents', icon: <Bot size={15} /> },
  { id: 'sources', label: 'Sources', icon: <BookOpen size={15} /> },
];

export function LeftPanel({
  project,
  documents,
  documentsLoading = false,
  documentsError = null,
  activeDocumentId,
  onDocumentSelect,
  activeTab,
  onTabChange,
  onUploadClick,
}: LeftPanelProps) {
  return (
    <aside className="rf-ws-left" aria-label="Workspace sidebar">
      {/* ── Project info ── */}
      <div className="rf-ws-left__project">
        <div className="rf-ws-left__project-badge" aria-label={`Status: ${project.status}`}>
          <span className={`rf-ws-left__status-dot rf-ws-left__status-dot--${project.status.toLowerCase()}`} />
          {project.status}
        </div>
        <h2 className="rf-ws-left__project-name">{project.name}</h2>
        <p className="rf-ws-left__project-desc">{project.description}</p>
        <div className="rf-ws-left__project-stats">
          <span>{project.documentCount} docs</span>
          <span className="rf-ws-left__dot">·</span>
          <span>{project.chatCount} chats</span>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <nav className="rf-ws-left__tabs" role="tablist" aria-label="Left panel sections">
        {NAV_TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            id={`left-tab-${tab.id}`}
            className={`rf-ws-left__tab ${activeTab === tab.id ? 'rf-ws-left__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Tab content ── */}
      <div className="rf-ws-left__content" role="tabpanel">
        {activeTab === 'documents' && (
          <>
            {documentsError && (
              <div className="rf-ws-left__doc-error" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{documentsError}</span>
              </div>
            )}

            {documentsLoading && !documents.length && (
              <div className="rf-ws-left__doc-loading" aria-label="Loading documents">
                <div className="rf-ws-left__skeleton" />
                <div className="rf-ws-left__skeleton rf-ws-left__skeleton--short" />
                <div className="rf-ws-left__skeleton" />
              </div>
            )}

            {!documentsLoading && !documentsError && documents.length === 0 && (
              <div className="rf-ws-left__empty-tab">
                <FileText size={28} aria-hidden="true" />
                <p>No documents yet</p>
                <span>Upload a PDF to get started.</span>
                <button
                  className="rf-ws-left__empty-upload-cta"
                  onClick={onUploadClick}
                  id="empty-state-upload-btn"
                >
                  <Upload size={13} aria-hidden="true" />
                  Upload PDF
                </button>
              </div>
            )}

            {documents.length > 0 && (
              <ul className="rf-ws-left__doc-list" aria-label="Project documents">
                {documents.map(doc => (
                  <li key={doc.id}>
                    <button
                      className={`rf-ws-left__doc-item ${activeDocumentId === doc.id ? 'rf-ws-left__doc-item--active' : ''}`}
                      onClick={() => onDocumentSelect(doc.id)}
                      aria-current={activeDocumentId === doc.id ? 'true' : undefined}
                    >
                      <div
                        className="rf-ws-left__doc-thumb"
                        style={{ background: doc.thumbnailColor }}
                        aria-hidden="true"
                      >
                        <FileText size={12} color="#fff" />
                      </div>
                      <div className="rf-ws-left__doc-info">
                        <span className="rf-ws-left__doc-name">{doc.name}</span>
                        <span className="rf-ws-left__doc-meta">
                          {doc.status === 'Processing' ? 'Processing…' :
                           doc.status === 'Completed' ? `${doc.pages}p · ${doc.sizeLabel}${doc.chunkCount ? ` · ${doc.chunkCount} chunks` : ''}` :
                           doc.status === 'Failed' ? '⚠ Processing failed' : `${doc.pages}p · ${doc.sizeLabel}`}
                        </span>
                      </div>
                      <ChevronRight size={14} className="rf-ws-left__doc-arrow" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {activeTab === 'notes' && (
          <div className="rf-ws-left__empty-tab">
            <StickyNote size={28} />
            <p>No notes yet</p>
            <span>Notes you create will appear here.</span>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="rf-ws-left__empty-tab">
            <Bot size={28} />
            <p>No agents running</p>
            <span>Attach an AI agent to this project.</span>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="rf-ws-left__empty-tab">
            <BookOpen size={28} />
            <p>No sources yet</p>
            <span>Sources cited by the AI will appear here.</span>
          </div>
        )}
      </div>

      {/* ── Upload button ── */}
      <div className="rf-ws-left__footer">
        <button
          className="rf-ws-left__upload-btn"
          onClick={onUploadClick}
          id="upload-pdf-btn"
          aria-label="Upload PDF document"
        >
          <Upload size={16} aria-hidden="true" />
          Upload PDF
        </button>
      </div>
    </aside>
  );
}
