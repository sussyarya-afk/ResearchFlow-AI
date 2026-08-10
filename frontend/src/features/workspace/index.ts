// ── Public API for the workspace feature ──────────────────────

// Types
export type {
  MessageRole,
  AgentStepStatus,
  DocumentType,
  CitationConfidence,
  ChatMessage,
  AgentStep,
  AgentTimeline as AgentTimelineType,
  WorkspaceDocument,
  Citation,
  WorkspaceProject,
  WorkspaceNote,
} from './types';

// Constants
export {
  LEFT_PANEL_WIDTH,
  RIGHT_PANEL_WIDTH,
  AGENT_STEP_LABELS,
  LEFT_NAV_ITEMS,
  VIEWER_ZOOM_LEVELS,
  CONFIDENCE_COLORS,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_MB,
} from './constants';

// Mock data
export {
  MOCK_PROJECT,
  MOCK_DOCUMENTS,
  MOCK_MESSAGES,
  MOCK_CITATIONS,
} from './mockData';

// Hooks
export { useWorkspace } from './hooks';

// Services
export {
  fetchWorkspaceProject,
  fetchDocuments,
  fetchMessages,
  fetchCitations,
} from './services';

// Components
export { LeftPanel } from './components/LeftPanel';
export { ChatPanel } from './components/ChatPanel';
export { RightPanel } from './components/RightPanel';
export { MessageBubble } from './components/chat/MessageBubble';
export { ChatInput } from './components/chat/ChatInput';
export { AgentTimeline } from './components/timeline/AgentTimeline';
export { DocumentViewer } from './components/viewer/DocumentViewer';
export { CitationCard } from './components/citations/CitationCard';
export { UploadModal } from './components/upload/UploadModal';
