import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import type { Project } from '../../types';
import { FileText, MessageSquare, Clock } from 'lucide-react';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="rf-project-card" variant="glass" padding="md" hoverable>
      <div className="rf-project-card__header">
        <h3 className="rf-project-card__title">{project.name}</h3>
        <Badge variant={project.status === 'Active' ? 'success' : 'default'}>
          {project.status}
        </Badge>
      </div>
      
      <p className="rf-project-card__description">{project.description}</p>
      
      <div className="rf-project-card__meta">
        <div className="rf-project-card__meta-item">
          <FileText size={14} />
          <span>{project.documents} docs</span>
        </div>
        <div className="rf-project-card__meta-item">
          <MessageSquare size={14} />
          <span>{project.chats} chats</span>
        </div>
        <div className="rf-project-card__meta-item">
          <Clock size={14} />
          <span>{project.updatedAt}</span>
        </div>
      </div>
      
      <div className="rf-project-card__actions">
        <Link to={`/workspace/${project.id}`}>
          <Button variant="secondary" size="sm" className="rf-project-card__btn">
            Open Workspace
          </Button>
        </Link>
      </div>
    </Card>
  );
}
