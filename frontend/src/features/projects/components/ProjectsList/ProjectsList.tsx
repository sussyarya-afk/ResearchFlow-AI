import { ProjectCard } from '../ProjectCard';
import { EmptyState } from '../EmptyState';
import type { Project } from '../../types';
import './ProjectsList.css';

interface ProjectsListProps {
  projects: Project[];
  isFiltered: boolean;
  onClearFilters: () => void;
  onProjectUpdated?: () => void;
  onNewProject?: () => void;
}

export function ProjectsList({ projects, isFiltered, onClearFilters, onProjectUpdated, onNewProject }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        filtered={isFiltered}
        onClear={onClearFilters}
        onCreateProject={onNewProject}
      />
    );
  }

  return (
    <div className="rf-projects-list" role="list">
      {projects.map(project => (
        <div key={project.id} role="listitem">
          <ProjectCard project={project} onProjectUpdated={onProjectUpdated} />
        </div>
      ))}
    </div>
  );
}
