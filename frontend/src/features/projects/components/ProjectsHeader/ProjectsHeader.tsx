import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import './ProjectsHeader.css';

interface ProjectsHeaderProps {
  count: number;
}

export function ProjectsHeader({ count }: ProjectsHeaderProps) {
  return (
    <div className="rf-projects-header">
      <div className="rf-projects-header__info">
        <h1 className="rf-projects-header__title">Projects</h1>
        <span className="rf-projects-header__count">{count} {count === 1 ? 'project' : 'projects'}</span>
      </div>
      <Button className="rf-projects-header__btn">
        <Plus size={18} />
        Create Project
      </Button>
    </div>
  );
}
