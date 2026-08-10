import { Link } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import { Play } from 'lucide-react';
import './ContinueWorking.css';

interface ContinueWorkingProps {
  project: {
    id: string;
    name: string;
    updatedAt: string;
  };
  progress: number;
}

export function ContinueWorking({ project, progress }: ContinueWorkingProps) {
  return (
    <Card className="rf-continue-working" variant="glass" padding="lg">
      <div className="rf-continue-working__content">
        <h2 className="rf-continue-working__title">Continue Working</h2>
        <p className="rf-continue-working__subtitle">
          Pick up where you left off in <strong>{project.name}</strong>.
        </p>
        <div className="rf-continue-working__meta">
          <span>Last opened {project.updatedAt}</span>
        </div>
        
        <div className="rf-continue-working__progress">
          <div className="rf-continue-working__progress-bar">
            <div 
              className="rf-continue-working__progress-fill" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className="rf-continue-working__progress-text">{progress}% Complete</span>
        </div>
      </div>
      
      <div className="rf-continue-working__action">
        <Link to={`/workspace/${project.id}`}>
          <Button size="lg" className="rf-continue-working__btn">
            <Play size={18} />
            Continue
          </Button>
        </Link>
      </div>
    </Card>
  );
}
