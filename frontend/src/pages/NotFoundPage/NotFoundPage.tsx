import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <div className="rf-404 animate-fade-in-up">
      <div className="rf-404__content">
        <span className="rf-404__code">404</span>
        <h1 className="rf-404__title">Page not found</h1>
        <p className="rf-404__description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
