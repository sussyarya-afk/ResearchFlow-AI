import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { streamChatMessage } from '../services/workspaceService';
import {
  MOCK_PROJECT,
  MOCK_MESSAGES,
  MOCK_CITATIONS,
} from '../mockData';
import type {
  ChatMessage,
  WorkspaceDocument,
  Citation,
  AgentTimeline,
  AgentStep,
} from '../types';

export function useWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string>('');
  const [activePageNumber, setActivePageNumber] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [leftTab, setLeftTab] = useState<'documents' | 'notes' | 'agents' | 'sources'>('documents');
  const [timeline, setTimeline] = useState<AgentTimeline>({ steps: [] });
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

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

    const eventSource = new EventSource(`/api/v1/projects/${projectId}/events`);
    
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

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const selectedDocument = documents.find(d => d.id === activeDocumentId) ?? documents[0];
  const citations: Citation[] = MOCK_CITATIONS;

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

  const openDocument = useCallback((documentId: string, pageNumber: number) => {
    setActiveDocumentId(documentId);
    setActivePageNumber(pageNumber);
  }, []);

  return {
    // Project
    project: MOCK_PROJECT,
    documents,
    documentsLoading,
    documentsError,
    selectedDocument,
    fetchDocuments,

    // Chat
    messages,
    inputValue,
    setInputValue,
    isGenerating,
    sendMessage,
    stopGeneration,
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
    openDocument,

    // Left panel nav
    leftTab,
    setLeftTab,
  };
}
