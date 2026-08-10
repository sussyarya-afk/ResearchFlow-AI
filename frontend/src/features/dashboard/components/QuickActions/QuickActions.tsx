import { Card } from '@/components/ui';
import { PlusCircle, Upload, Sparkles } from 'lucide-react';
import './QuickActions.css';

const ACTIONS = [
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Start a blank research workspace',
    icon: <PlusCircle size={24} />,
    color: 'primary'
  },
  {
    id: 'upload-pdf',
    title: 'Upload PDF',
    description: 'Analyze documents with AI',
    icon: <Upload size={24} />,
    color: 'success'
  },
  {
    id: 'ask-ai',
    title: 'Ask AI',
    description: 'Chat with your knowledge base',
    icon: <Sparkles size={24} />,
    color: 'accent'
  }
];

export function QuickActions() {
  return (
    <div className="rf-quick-actions">
      {ACTIONS.map((action) => (
        <Card key={action.id} className="rf-quick-action-card" variant="glass" hoverable>
          <button className="rf-quick-action-card__btn">
            <div className={`rf-quick-action-card__icon rf-quick-action-card__icon--${action.color}`}>
              {action.icon}
            </div>
            <div className="rf-quick-action-card__content">
              <h3 className="rf-quick-action-card__title">{action.title}</h3>
              <p className="rf-quick-action-card__description">{action.description}</p>
            </div>
          </button>
        </Card>
      ))}
    </div>
  );
}
