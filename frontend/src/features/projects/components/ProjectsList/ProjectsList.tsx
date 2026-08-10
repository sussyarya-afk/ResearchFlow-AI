import { ProjectCard } from '../ProjectCard';
import { EmptyState } from '../EmptyState';
import type { Project } from '../../types';
import './ProjectsList.css';

interface ProjectsListProps {
  projects: Project[];
  isFiltered: boolean;
  onClearFilters: () => void;
}

export function ProjectsList({ projects, isFiltered, onClearFilters }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        filtered={isFiltered}
        onClear={onClearFilters}
      />
    );
  }

  return (
    <div className="rf-projects-list" role="list">
      {projects.map(project => (
        <div key={project.id} role="listitem">
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
