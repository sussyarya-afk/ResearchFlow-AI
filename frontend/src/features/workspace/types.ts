// ── Workspace Types ───────────────────────────────────────────

export type MessageRole = 'user' | 'ai';
export type AgentStepStatus = 'pending' | 'running' | 'done';
export type DocumentType = 'pdf' | 'docx' | 'txt';
export type CitationConfidence = 'high' | 'medium' | 'low';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  /** If role === 'ai', an agent timeline may follow */
  hasTimeline?: boolean;
  citations?: Citation[];
}

export interface AgentStep {
  id: string;
  eventType: string;
  title: string;
  timestamp: string;
  status: 'pending' | 'running' | 'done' | 'error';
  durationMs?: number;
  metadata?: Record<string, any>;
}

export interface AgentTimeline {
  messageId?: string;
  steps: AgentStep[];
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  type: DocumentType;
  pages: number;
  sizeLabel: string;
  uploadedAt: string;
  thumbnailColor: string; /** CSS color used as thumbnail placeholder */
  status: string;
  chunkCount?: number;
}

export interface Citation {
  chunk_id: string;
  document_id: string;
  document_name: string;
  page_start: number;
  page_end: number;
  excerpt: string;
  similarity: number;
  // Aliases for convenience
  documentId?: string;
  documentName?: string;
  pageNumber?: number;
  text?: string;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Completed';
  documentCount: number;
  chatCount: number;
  updatedAt: string;
}

export interface WorkspaceNote {
  id: string;
  content: string;
  createdAt: string;
}
