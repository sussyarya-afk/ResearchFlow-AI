import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { Project } from '../../types';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isActive = project.status === 'Active';

  return (
    <Card className="rf-project-card" variant="glass" padding="md" hoverable>
      {/* ── Top ── */}
      <div className="rf-project-card__top">
        <div
          className={`rf-project-card__indicator ${isActive ? 'rf-project-card__indicator--active' : ''}`}
          aria-hidden="true"
        />
        <Badge variant={isActive ? 'success' : 'default'}>
          {project.status}
        </Badge>
      </div>

      {/* ── Body ── */}
      <h3 className="rf-project-card__title">{project.name}</h3>
      <p className="rf-project-card__description">{project.description}</p>

      {/* ── Stats ── */}
      <div className="rf-project-card__stats">
        <div className="rf-project-card__stat" title="Documents">
          <FileText size={13} aria-hidden="true" />
          <span>{project.documents}</span>
        </div>
        <div className="rf-project-card__stat" title="AI Chats">
          <MessageSquare size={13} aria-hidden="true" />
          <span>{project.chats}</span>
        </div>
        <div className="rf-project-card__stat rf-project-card__stat--time" title="Last updated">
          <Clock size={13} aria-hidden="true" />
          <span>{project.updatedAt}</span>
        </div>
      </div>

      {/* ── Action ── */}
      <div className="rf-project-card__footer">
        <Link
          to={`/workspace/${project.id}`}
          className="rf-project-card__open-btn"
          aria-label={`Open ${project.name} workspace`}
        >
          Open
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
