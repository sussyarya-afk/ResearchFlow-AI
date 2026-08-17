import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  description?: string;
  filtered?: boolean;
  onClear?: () => void;
  onCreateProject?: () => void;
}

export function EmptyState({
  title,
  description,
  filtered = false,
  onClear,
  onCreateProject,
}: EmptyStateProps) {
  const defaultTitle = filtered ? 'No matching projects' : 'No projects yet';
  const defaultDesc = filtered
    ? 'Try adjusting your search or filters.'
    : 'Create your first project to start AI-powered research.';

  return (
    <div className="rf-projects-empty">
      <div className="rf-projects-empty__icon-wrap" aria-hidden="true">
        <FolderKanban size={36} />
      </div>
      <h2 className="rf-projects-empty__title">{title ?? defaultTitle}</h2>
      <p className="rf-projects-empty__desc">{description ?? defaultDesc}</p>
      {filtered && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
      {!filtered && onCreateProject && (
        <Button variant="primary" size="md" onClick={onCreateProject} leftIcon={<Plus size={16} />}>
          Create First Project
        </Button>
      )}
    </div>
  );
}
