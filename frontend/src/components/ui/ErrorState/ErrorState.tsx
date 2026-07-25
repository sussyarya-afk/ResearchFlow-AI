import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import './ErrorState.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  icon,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  return (
    <div className="rf-error animate-fade-in-up">
      {icon && <div className="rf-error__icon">{icon}</div>}
      {!icon && (
        <div className="rf-error__icon rf-error__icon--default">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      )}
      <h3 className="rf-error__title">{title}</h3>
      <p className="rf-error__message">{message}</p>
      {onRetry && (
        <div className="rf-error__action">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
