import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { apiClient } from '@/services/api';
import { buildProjectEventsUrl, fetchMessages, fetchWorkspaceProject, streamChatMessage } from '../services/workspaceService';
import type {
  ChatMessage,
  WorkspaceDocument,
  Citation,
  AgentTimeline,
  AgentStep,
  WorkspaceProject,
} from '../types';

export interface WorkspaceNote {
  id: string;
  project_id?: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export function useWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<WorkspaceProject>({
    id: projectId || '',
    name: 'Workspace',
    description: '',
    status: 'Active',
    documentCount: 0,
    chatCount: 0,
    updatedAt: '',
  });
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string>('');
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [highlightText, setHighlightText] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [leftTab, setLeftTab] = useState<'documents' | 'notes' | 'agents' | 'sources'>('documents');
  const [timeline, setTimeline] = useState<AgentTimeline>({ steps: [] });
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleTimelineEvent = useCallback((event: any) => {
    if (!event || !event.event_type) return;

    setTimeline(prev => {
      const existingIndex = prev.steps.findIndex(
        s => s.id === event.id || s.eventType === event.event_type
      );

      const newStep: AgentStep = {
        id: event.id || `step_${Date.now()}`,
        eventType: event.event_type,
        title: event.title || event.event_type,
        timestamp: event.timestamp || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: event.status === 'running' ? 'running' : event.status === 'done' ? 'done' : event.status === 'error' ? 'error' : 'pending',
        durationMs: event.duration_ms,
        metadata: event.metadata || {}
      };

      let updatedSteps: AgentStep[];
      if (existingIndex >= 0) {
        updatedSteps = [...prev.steps];
        updatedSteps[existingIndex] = newStep;
      } else {
        updatedSteps = [...prev.steps, newStep];
      }

      return { steps: updatedSteps };
    });
  }, []);

  // Subscribe to project-wide SSE events (e.g. document uploads)
  useEffect(() => {
    if (!projectId) return;

    const eventSource = new EventSource(buildProjectEventsUrl(projectId));
    
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'timeline_event' && data.event) {
          handleTimelineEvent(data.event);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, handleTimelineEvent]);

  useEffect(() => {
    if (!projectId) return;

    const currentProjectId = projectId;
    let cancelled = false;
    async function loadWorkspace() {
      try {
        setWorkspaceError(null);
        const [projectData, messageData] = await Promise.all([
          fetchWorkspaceProject(currentProjectId),
          fetchMessages(currentProjectId),
        ]);
        if (!cancelled) {
          setProject(projectData);
          setMessages(messageData);
        }
      } catch (err: any) {
        if (!cancelled) {
          setWorkspaceError(err?.message || 'Failed to load workspace.');
        }
      }
    }

    loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const fetchDocuments = useCallback(async () => {
    if (!projectId) return;
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const docs = await documentService.getProjectDocuments(projectId);
      setDocuments(docs);
      if (docs.length > 0 && !activeDocumentId) {
        setActiveDocumentId(docs[0].id);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to load documents. Please refresh.';
      console.error('Failed to fetch documents:', err);
      setDocumentsError(msg);
    } finally {
      setDocumentsLoading(false);
    }
  }, [projectId, activeDocumentId]);

  const fetchNotes = useCallback(async () => {
    if (!projectId) return;
    setNotesLoading(true);
    try {
      const data = await apiClient.getNotes(projectId);
      if (Array.isArray(data)) {
        setNotes(data);
      }
    } catch (err) {
      console.warn('Failed to load notes:', err);
    } finally {
      setNotesLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDocuments();
    fetchNotes();
  }, [fetchDocuments, fetchNotes]);

  const createNote = async (content: string) => {
    if (!projectId || !content.trim()) return;
    try {
      const created = await apiClient.createNote(projectId, content.trim());
      setNotes(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const updateNote = async (noteId: string, content: string) => {
    if (!projectId || !content.trim()) return;
    try {
      const updated = await apiClient.updateNote(projectId, noteId, content.trim());
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!projectId) return;
    try {
      await apiClient.deleteNote(projectId, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!projectId) return;
    try {
      await documentService.deleteDocument(projectId, documentId);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      if (activeDocumentId === documentId) {
        const remaining = documents.filter(d => d.id !== documentId);
        setActiveDocumentId(remaining.length > 0 ? remaining[0].id : '');
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const selectedDocument = documents.find(d => d.id === activeDocumentId) ?? documents[0];
  const citations: Citation[] = messages.flatMap(message => message.citations || []);

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isGenerating || !projectId) return;

    // Reset timeline for new chat query
    setTimeline({ steps: [] });

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsGenerating(true);

    const aiMsgId = `msg_ai_${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      hasTimeline: true,
      citations: []
    };
    setMessages(prev => [...prev, aiMsg]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await streamChatMessage({
        projectId,
        query: trimmed,
        signal: abortController.signal,
        onToken: (token) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, content: msg.content + token } : msg
            )
          );
        },
        onSources: (sources) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, citations: sources } : msg
            )
          );
        },
        onTimelineEvent: (event) => {
          handleTimelineEvent(event);
        },
        onError: (error) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, content: msg.content + `\n\n[Error: ${error.message}]` } : msg
            )
          );
        },
        onComplete: () => {
          setIsGenerating(false);
          abortControllerRef.current = null;
        }
      });
    } catch (error) {
      console.error('Unexpected streaming error:', error);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [inputValue, isGenerating, projectId, handleTimelineEvent]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setTimeline({ steps: [] });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const zoomIn = useCallback(() => setZoomLevel(z => Math.min(z + 25, 200)), []);
  const zoomOut = useCallback(() => setZoomLevel(z => Math.max(z - 25, 50)), []);

  const openDocument = useCallback((documentId: string, pageNumber: number, excerpt?: string) => {
    setActiveDocumentId(documentId);
    setActivePageNumber(pageNumber);
    if (excerpt) {
      setHighlightText(excerpt);
    }
  }, []);

  return {
    // Project
    project,
    workspaceError,
    documents,
    documentsLoading,
    documentsError,
    selectedDocument,
    fetchDocuments,
    deleteDocument,

    // Notes
    notes,
    notesLoading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,

    // Chat
    messages,
    inputValue,
    setInputValue,
    isGenerating,
    sendMessage,
    stopGeneration,
    clearChat,
    handleKeyDown,
    chatEndRef,

    // Timeline & citations
    timeline,
    citations,

    // Viewer
    zoomLevel,
    zoomIn,
    zoomOut,
    activeDocumentId,
    setActiveDocumentId,
    activePageNumber,
    setActivePageNumber,
    highlightText,
    setHighlightText,
    openDocument,

    // Left panel nav
    leftTab,
    setLeftTab,
  };
}
