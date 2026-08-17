import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FolderPlus, Sparkles, AlertCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { projectService } from '../../services/projectService';
import type { Project } from '../../types';
import './CreateProjectModal.css';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a project name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await projectService.createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setName('');
      setDescription('');
      onClose();

      if (onProjectCreated) {
        onProjectCreated(created);
      }

      navigate(`/workspace/${created.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rf-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="rf-create-project-modal animate-scale-in">
        <div className="rf-create-project-modal__header">
          <div className="rf-create-project-modal__title-group">
            <div className="rf-create-project-modal__icon-badge">
              <FolderPlus size={20} />
            </div>
            <div>
              <h2 id="create-project-modal-title" className="rf-create-project-modal__title">
                Create Research Project
              </h2>
              <p className="rf-create-project-modal__subtitle">
                Set up a dedicated workspace for your documents and AI research
              </p>
            </div>
          </div>
          <button
            className="rf-create-project-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="rf-create-project-modal__error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rf-create-project-modal__form">
          <Input
            label="Project Name"
            placeholder="e.g. CRISPR Off-Target Effects Analysis"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            id="create-project-name"
          />

          <div className="rf-form-field">
            <label htmlFor="create-project-desc" className="rf-form-label">
              Description <span className="rf-form-label__optional">(optional)</span>
            </label>
            <textarea
              id="create-project-desc"
              rows={3}
              placeholder="Briefly describe the research scope, hypothesis, or objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rf-textarea"
            />
          </div>

          <div className="rf-create-project-modal__footer">
            <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="accent"
              type="submit"
              disabled={loading || !name.trim()}
              isLoading={loading}
              leftIcon={<Sparkles size={16} />}
              id="submit-create-project-btn"
            >
              {loading ? 'Creating Workspace…' : 'Create & Open Workspace'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
