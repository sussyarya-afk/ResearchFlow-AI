import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import './ProjectHeader.css';

interface ProjectHeaderProps {
  /** Total number of projects (unfiltered) */
  count: number;
}

export function ProjectHeader({ count }: ProjectHeaderProps) {
  return (
    <div className="rf-project-header">
      <div className="rf-project-header__info">
        <h1 className="rf-project-header__title">Projects</h1>
        <span className="rf-project-header__count">
          {count} {count === 1 ? 'project' : 'projects'}
        </span>
      </div>
      <Button id="new-project-btn" className="rf-project-header__btn">
        <Plus size={18} aria-hidden="true" />
        New Project
      </Button>
    </div>
  );
}
