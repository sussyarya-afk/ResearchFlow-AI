// ── Workspace Constants ───────────────────────────────────────

export const LEFT_PANEL_WIDTH = '280px';
export const RIGHT_PANEL_WIDTH = '320px';

export const AGENT_STEP_LABELS = [
  'Reading PDF',
  'Chunking',
  'Creating Embeddings',
  'Searching',
  'Ranking Sources',
  'Generating Answer',
  'Completed',
] as const;

export const LEFT_NAV_ITEMS = [
  { id: 'documents', label: 'Documents' },
  { id: 'notes', label: 'Notes' },
  { id: 'agents', label: 'AI Agents' },
  { id: 'sources', label: 'Sources' },
] as const;

export const VIEWER_ZOOM_LEVELS = [50, 75, 100, 125, 150, 200] as const;

export const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'var(--color-success)',
  medium: 'var(--color-warning)',
  low: 'var(--color-error)',
};

export const ACCEPTED_FILE_TYPES = ['.pdf', '.docx', '.txt'];
export const MAX_FILE_SIZE_MB = 50;
