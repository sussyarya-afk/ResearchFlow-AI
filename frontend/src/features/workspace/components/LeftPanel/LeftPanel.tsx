import { useState } from 'react';
import { 
  FileText, StickyNote, Bot, BookOpen, Upload, ChevronRight, 
  AlertCircle, Trash2, Plus, Edit2, Check, X, Sparkles, ExternalLink, Play 
} from 'lucide-react';
import type { WorkspaceDocument, WorkspaceProject, Citation } from '../../types';
import type { WorkspaceNote } from '../../hooks/useWorkspace';
import './LeftPanel.css';

type LeftTab = 'documents' | 'notes' | 'agents' | 'sources';

interface LeftPanelProps {
  project: WorkspaceProject;
  documents: WorkspaceDocument[];
  documentsLoading?: boolean;
  documentsError?: string | null;
  activeDocumentId: string;
  onDocumentSelect: (id: string) => void;
  onDocumentDelete?: (id: string) => void;
  activeTab: LeftTab;
  onTabChange: (tab: LeftTab) => void;
  onUploadClick: () => void;
  // Notes
  notes?: WorkspaceNote[];
  notesLoading?: boolean;
  onCreateNote?: (content: string) => void;
  onUpdateNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
  // Sources
  citations?: Citation[];
  onOpenSource?: (docId: string, page: number, excerpt?: string) => void;
  // Run Agent
  onRunAgentPrompt?: (prompt: string) => void;
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
  onDocumentDelete,
  activeTab,
  onTabChange,
  onUploadClick,
  notes = [],
  notesLoading = false,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  citations = [],
  onOpenSource,
  onRunAgentPrompt,
}: LeftPanelProps) {
  // Notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  // Agent running state
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !onCreateNote) return;
    onCreateNote(newNoteText.trim());
    setNewNoteText('');
  };

  const handleStartEditNote = (note: WorkspaceNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.content);
  };

  const handleSaveEditNote = (noteId: string) => {
    if (!editingNoteText.trim() || !onUpdateNote) return;
    onUpdateNote(noteId, editingNoteText.trim());
    setEditingNoteId(null);
  };

  const handleRunAgent = (agentId: string, prompt: string) => {
    setRunningAgentId(agentId);
    setTimeout(() => {
      setRunningAgentId(null);
      if (onRunAgentPrompt) {
        onRunAgentPrompt(prompt);
      }
    }, 1000);
  };

  const agentCards = [
    {
      id: 'agent_lit',
      title: 'Literature Reviewer',
      desc: 'Synthesize research methodology, core theorems, and experimental findings across all uploaded papers.',
      prompt: 'Synthesize a structured literature review of all uploaded documents highlighting methodology and core findings.',
      icon: <Sparkles size={16} color="var(--color-primary-400)" />
    },
    {
      id: 'agent_cite',
      title: 'Citation Linker',
      desc: 'Extract key citations and map relationships between referenced prior art and experimental claims.',
      prompt: 'Extract and analyze the most significant citations, mapping relationships between claims and evidence.',
      icon: <BookOpen size={16} color="var(--color-accent-400)" />
    },
    {
      id: 'agent_hypo',
      title: 'Hypothesis Generator',
      desc: 'Formulate testable research hypotheses and next experimental steps based on identified limitations.',
      prompt: 'Based on the limitations identified in these papers, propose 3 novel, testable research hypotheses.',
      icon: <Bot size={16} color="var(--color-success)" />
    },
  ];

  return (
    <aside className="rf-ws-left" aria-label="Workspace sidebar">
      {/* ── Project info ── */}
      <div className="rf-ws-left__project">
        <div className="rf-ws-left__project-badge" aria-label={`Status: ${project.status}`}>
          <span className={`rf-ws-left__status-dot rf-ws-left__status-dot--${project.status.toLowerCase()}`} />
          {project.status}
        </div>
        <h2 className="rf-ws-left__project-name">{project.name}</h2>
        <p className="rf-ws-left__project-desc">{project.description || 'No description'}</p>
        <div className="rf-ws-left__project-stats">
          <span>{documents.length} {documents.length === 1 ? 'doc' : 'docs'}</span>
          <span className="rf-ws-left__dot">·</span>
          <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
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
        {/* 1. DOCUMENTS TAB */}
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
                  <li key={doc.id} className="rf-ws-left__doc-li">
                    {docToDelete === doc.id ? (
                      <div className="rf-ws-left__doc-delete-confirm">
                        <span>Delete {doc.name}?</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="rf-ws-left__btn-sm"
                            onClick={() => setDocToDelete(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="rf-ws-left__btn-sm rf-ws-left__btn-sm--danger"
                            onClick={() => {
                              if (onDocumentDelete) onDocumentDelete(doc.id);
                              setDocToDelete(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`rf-ws-left__doc-item-wrap ${activeDocumentId === doc.id ? 'rf-ws-left__doc-item-wrap--active' : ''}`}>
                        <button
                          className="rf-ws-left__doc-item"
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
                        {onDocumentDelete && (
                          <button
                            className="rf-ws-left__doc-del-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocToDelete(doc.id);
                            }}
                            title="Delete document"
                            aria-label="Delete document"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* 2. NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="rf-ws-notes-panel">
            <form onSubmit={handleAddNote} className="rf-ws-notes__form">
              <textarea
                placeholder="Write a research note, hypothesis, or finding..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="rf-ws-notes__textarea"
                rows={2}
                id="workspace-note-input"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="rf-ws-notes__add-btn"
                id="workspace-add-note-btn"
              >
                <Plus size={14} /> Add Note
              </button>
            </form>

            {notesLoading && (
              <div className="rf-ws-left__skeleton" style={{ marginTop: '12px' }} />
            )}

            {!notesLoading && notes.length === 0 && (
              <div className="rf-ws-left__empty-tab">
                <StickyNote size={28} />
                <p>No notes yet</p>
                <span>Write findings and observations during your research.</span>
              </div>
            )}

            <ul className="rf-ws-notes__list">
              {notes.map(note => (
                <li key={note.id} className="rf-ws-notes__item">
                  {editingNoteId === note.id ? (
                    <div className="rf-ws-notes__edit-wrap">
                      <textarea
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="rf-ws-notes__textarea"
                        rows={3}
                        autoFocus
                      />
                      <div className="rf-ws-notes__edit-actions">
                        <button
                          className="rf-ws-left__btn-sm"
                          onClick={() => setEditingNoteId(null)}
                        >
                          <X size={12} /> Cancel
                        </button>
                        <button
                          className="rf-ws-left__btn-sm rf-ws-left__btn-sm--primary"
                          onClick={() => handleSaveEditNote(note.id)}
                        >
                          <Check size={12} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="rf-ws-notes__content">{note.content}</p>
                      <div className="rf-ws-notes__meta">
                        <span className="rf-ws-notes__time">
                          {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="rf-ws-notes__item-actions">
                          <button
                            className="rf-ws-notes__item-btn"
                            onClick={() => handleStartEditNote(note)}
                            title="Edit note"
                          >
                            <Edit2 size={12} />
                          </button>
                          {onDeleteNote && (
                            <button
                              className="rf-ws-notes__item-btn rf-ws-notes__item-btn--danger"
                              onClick={() => onDeleteNote(note.id)}
                              title="Delete note"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. AI AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="rf-ws-agents-panel">
            <p className="rf-ws-agents__intro">
              Run autonomous specialized AI agents directly on your indexed documents:
            </p>
            <div className="rf-ws-agents__list">
              {agentCards.map(agent => (
                <div key={agent.id} className="rf-ws-agent-card">
                  <div className="rf-ws-agent-card__header">
                    <div className="rf-ws-agent-card__icon">{agent.icon}</div>
                    <span className="rf-ws-agent-card__title">{agent.title}</span>
                  </div>
                  <p className="rf-ws-agent-card__desc">{agent.desc}</p>
                  <button
                    className="rf-ws-agent-card__btn"
                    onClick={() => handleRunAgent(agent.id, agent.prompt)}
                    disabled={runningAgentId === agent.id}
                  >
                    {runningAgentId === agent.id ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <Play size={12} fill="currentColor" /> Run Agent Task
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SOURCES TAB */}
        {activeTab === 'sources' && (
          <div className="rf-ws-sources-panel">
            {citations.length === 0 ? (
              <div className="rf-ws-left__empty-tab">
                <BookOpen size={28} />
                <p>No citations yet</p>
                <span>Ask questions in chat to generate grounded citations from your documents.</span>
              </div>
            ) : (
              <ul className="rf-ws-sources__list">
                {citations.map((cite, idx) => {
                  const docId = cite.document_id || cite.documentId || '';
                  const docName = cite.document_name || cite.documentName || 'Document';
                  const pageNum = cite.page_start ?? cite.pageNumber ?? 1;
                  const textSnippet = cite.excerpt || cite.text || '';

                  return (
                    <li key={cite.chunk_id || `${docId}_${pageNum}_${idx}`} className="rf-ws-sources__item">
                      <div className="rf-ws-sources__item-header">
                        <span className="rf-ws-sources__doc-name">{docName}</span>
                        <span className="rf-ws-sources__badge">p. {pageNum}</span>
                      </div>
                      <p className="rf-ws-sources__excerpt">"{textSnippet}"</p>
                      <button
                        className="rf-ws-sources__jump-btn"
                        onClick={() => {
                          if (onOpenSource) {
                            onOpenSource(docId, pageNum, textSnippet);
                          }
                        }}
                      >
                        <ExternalLink size={12} /> Jump to Page {pageNum}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
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
