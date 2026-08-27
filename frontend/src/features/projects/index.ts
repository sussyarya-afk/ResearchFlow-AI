// ── Public API for the projects feature ──────────────────────

// Types
export type { Project, ProjectStatus, ProjectFilterOption, ProjectSortOption } from './types';

// Constants
export { FILTER_OPTIONS, SORT_OPTIONS } from './constants';

// Hooks
export { useProjects } from './hooks';


// Components
export { ProjectHeader } from './components/ProjectHeader';
export { ProjectCard } from './components/ProjectCard';
export { SearchBar } from './components/SearchBar';
export { FilterTabs } from './components/FilterTabs';
export { EmptyState as ProjectsEmptyState } from './components/EmptyState';
export { ProjectsList } from './components/ProjectsList';
