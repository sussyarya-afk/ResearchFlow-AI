// ── Public API for the projects feature ──────────────────────

// Types
export type { Project, ProjectStatus, ProjectFilterOption, ProjectSortOption } from './types';

// Constants
export { FILTER_OPTIONS, SORT_OPTIONS } from './constants';

// Mock data
export { MOCK_PROJECTS } from './mockData';

// Hooks
export { useProjects } from './hooks';

// Services
export { fetchProjects, fetchProjectById } from './services';

// Components
export { ProjectHeader } from './components/ProjectHeader';
export { ProjectCard } from './components/ProjectCard';
export { SearchBar } from './components/SearchBar';
export { FilterTabs } from './components/FilterTabs';
export { EmptyState as ProjectsEmptyState } from './components/EmptyState';
export { ProjectsList } from './components/ProjectsList';
