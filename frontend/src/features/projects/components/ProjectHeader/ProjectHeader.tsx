import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import './ProjectHeader.css';

interface ProjectHeaderProps {
  /** Total number of projects (unfiltered) */
  count: number;
  onNewProject?: () => void;
}

export function ProjectHeader({ count, onNewProject }: ProjectHeaderProps) {
  return (
    <div className="rf-project-header">
      <div className="rf-project-header__info">
        <h1 className="rf-project-header__title">Projects</h1>
        <span className="rf-project-header__count">
          {count} {count === 1 ? 'project' : 'projects'}
        </span>
      </div>
      <Button id="new-project-btn" className="rf-project-header__btn" onClick={onNewProject}>
        <Plus size={18} aria-hidden="true" />
        New Project
      </Button>
    </div>
  );
}
