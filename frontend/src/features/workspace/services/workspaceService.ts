/**
 * Workspace service layer — real API calls.
 */

import type { WorkspaceProject, WorkspaceDocument, ChatMessage, Citation } from '../types';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/** Returns the Bearer token from localStorage, or null if not authenticated. */
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/** Builds headers with auth token and optional extra headers. */
function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchWorkspaceProject(projectId: string): Promise<WorkspaceProject> {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Project request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    status: data.status,
    documentCount: data.document_count ?? 0,
    chatCount: data.chat_count ?? 0,
    updatedAt: data.updated_at,
  };
}

export async function fetchDocuments(projectId: string): Promise<WorkspaceDocument[]> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Documents request failed: ${response.status}`);
  }

  const docs = await response.json();
  return docs.map((doc: any) => {
    let sizeLabel = '';
    if (doc.size < 1024) sizeLabel = `${doc.size} B`;
    else if (doc.size < 1024 * 1024) sizeLabel = `${(doc.size / 1024).toFixed(1)} KB`;
    else sizeLabel = `${(doc.size / (1024 * 1024)).toFixed(1)} MB`;

    return {
      id: doc.id,
      name: doc.name,
      type: doc.type?.includes('pdf') ? 'pdf' : 'txt',
      pages: doc.pages,
      sizeLabel,
      uploadedAt: doc.created_at,
      thumbnailColor: '#FF5722',
      status: doc.processing_status,
      chunkCount: doc.chunk_count ?? undefined,
    };
  });
}

export async function fetchMessages(projectId: string): Promise<ChatMessage[]> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/chat/history`, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Chat history request failed: ${response.status}`);
  }

  const session = await response.json();
  return (session.messages || []).map((message: any) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: new Date(message.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    hasTimeline: message.role === 'ai',
    citations: (message.citations || []).map((citation: any) => ({
      chunk_id: citation.chunk_id || '',
      document_id: citation.document_id,
      document_name: citation.document_name || 'Document',
      page_start: citation.page_start ?? citation.page_number ?? 1,
      page_end: citation.page_end ?? citation.page_number ?? 1,
      excerpt: citation.excerpt,
      similarity: citation.similarity ?? citation.confidence ?? 0,
    })),
  }));
}

export async function fetchCitations(messageId: string): Promise<Citation[]> {
  void messageId;
  return Promise.resolve([]);
}

export function buildProjectEventsUrl(projectId: string): string {
  const token = getAuthToken();
  const url = new URL(`${API_BASE}/projects/${projectId}/events`);
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
}

export async function sendChatMessage(
  projectId: string,
  query: string,
): Promise<{ answer: string; sources: Citation[] }> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/chat`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Chat request failed: ${response.status}`);
  }

  return response.json();
}

export async function streamChatMessage({
  projectId,
  query,
  signal,
  onToken,
  onSources,
  onTimelineEvent,
  onError,
  onComplete,
}: {
  projectId: string;
  query: string;
  signal: AbortSignal;
  onToken: (token: string) => void;
  onSources: (sources: Citation[]) => void;
  onTimelineEvent?: (event: any) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/projects/${projectId}/chat/stream`, {
      method: 'POST',
      // F4 fix: include Authorization header so the backend doesn't return 401
      headers: buildHeaders({
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      }),
      body: JSON.stringify({ query }),
      signal,
    });

    if (response.status === 401 || response.status === 403) {
      onError(new Error('Authentication error. Please log in again.'));
      return;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Stream request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is missing');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6);
        try {
          const data = JSON.parse(dataStr);
          if (data.type === 'token') {
            onToken(data.content);
          } else if (data.type === 'sources') {
            onSources(data.content);
          } else if (data.type === 'timeline_event' && onTimelineEvent) {
            onTimelineEvent(data.event);
          } else if (data.type === 'error') {
            onError(new Error(data.content));
          }
        } catch {
          // Malformed SSE line — skip silently
        }
      }
    }

    onComplete();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // User-initiated stop — treat as normal completion
      onComplete();
    } else {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
