import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rf-empty animate-fade-in-up">
      {icon && <div className="rf-empty__icon">{icon}</div>}
      {!icon && (
        <div className="rf-empty__icon rf-empty__icon--default">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        </div>
      )}
      <h3 className="rf-empty__title">{title}</h3>
      {description && <p className="rf-empty__description">{description}</p>}
      {action && <div className="rf-empty__action">{action}</div>}
    </div>
  );
}
