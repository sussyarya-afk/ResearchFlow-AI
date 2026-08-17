import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Clock, ArrowRight, Star, Trash2, Edit3, X, Check } from 'lucide-react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { projectService } from '../../services/projectService';
import { favoritesManager } from '@/utils/favorites';
import type { Project } from '../../types';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
  onProjectUpdated?: () => void;
  onProjectDeleted?: (id: string) => void;
}

export function ProjectCard({ project, onProjectUpdated, onProjectDeleted }: ProjectCardProps) {
  const isActive = project.status === 'Active';
  const [isFav, setIsFav] = useState(() => favoritesManager.isFavorite(project.id));
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDesc, setEditDesc] = useState(project.description);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleFavChange = () => {
      setIsFav(favoritesManager.isFavorite(project.id));
    };
    window.addEventListener('rf_favorites_changed', handleFavChange);
    return () => window.removeEventListener('rf_favorites_changed', handleFavChange);
  }, [project.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = favoritesManager.toggleFavorite({
      id: project.id,
      type: 'project',
      name: project.name,
      description: project.description,
    });
    setIsFav(newStatus);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      await projectService.updateProject(project.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      setIsEditing(false);
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await projectService.deleteProject(project.id);
      favoritesManager.removeFavorite(project.id);
      if (onProjectDeleted) onProjectDeleted(project.id);
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error('Failed to delete project:', err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card className="rf-project-card" variant="glass" padding="md" hoverable>
      {/* ── Top ── */}
      <div className="rf-project-card__top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className={`rf-project-card__indicator ${isActive ? 'rf-project-card__indicator--active' : ''}`}
            aria-hidden="true"
          />
          <Badge variant={isActive ? 'success' : 'default'}>
            {project.status}
          </Badge>
        </div>

        <div className="rf-project-card__actions-top">
          <button
            className={`rf-project-card__action-btn ${isFav ? 'rf-project-card__action-btn--fav' : ''}`}
            onClick={handleToggleFavorite}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            title={isFav ? 'Remove from favorites' : 'Star project'}
          >
            <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
          </button>
          <button
            className="rf-project-card__action-btn"
            onClick={() => setIsEditing(!isEditing)}
            aria-label="Edit project"
            title="Edit project"
          >
            <Edit3 size={15} />
          </button>
          <button
            className="rf-project-card__action-btn rf-project-card__action-btn--danger"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete project"
            title="Delete project"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Delete Confirmation Overlay ── */}
      {showDeleteConfirm && (
        <div className="rf-project-card__delete-modal">
          <p className="rf-project-card__delete-text">Delete <strong>{project.name}</strong>?</p>
          <div className="rf-project-card__delete-btns">
            <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* ── Inline Edit Form or Normal Body ── */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="rf-project-card__edit-form">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            required
            autoFocus
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description..."
            rows={2}
            className="rf-textarea"
            style={{ fontSize: '12px', padding: '6px 10px' }}
          />
          <div className="rf-project-card__edit-actions">
            <Button size="sm" variant="ghost" type="button" onClick={() => setIsEditing(false)}>
              <X size={14} /> Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" isLoading={isSaving}>
              <Check size={14} /> Save
            </Button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="rf-project-card__title">{project.name}</h3>
          <p className="rf-project-card__description">{project.description || 'No description provided.'}</p>
        </>
      )}

      {/* ── Stats ── */}
      <div className="rf-project-card__stats">
        <div className="rf-project-card__stat" title="Documents">
          <FileText size={13} aria-hidden="true" />
          <span>{project.documents} {project.documents === 1 ? 'doc' : 'docs'}</span>
        </div>
        <div className="rf-project-card__stat" title="AI Chats">
          <MessageSquare size={13} aria-hidden="true" />
          <span>{project.chats} {project.chats === 1 ? 'chat' : 'chats'}</span>
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
          Open Workspace
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}
