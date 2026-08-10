import { type ReactNode } from 'react';
import { Card } from '@/components/ui';
import './StatCard.css';

interface StatCardProps {
  title: string;
  count: string | number;
  description: string;
  icon: ReactNode;
}

export function StatCard({ title, count, description, icon }: StatCardProps) {
  return (
    <Card className="rf-stat-card" variant="glass" padding="md" hoverable>
      <div className="rf-stat-card__header">
        <div className="rf-stat-card__icon-wrapper">{icon}</div>
      </div>
      <div className="rf-stat-card__content">
        <h3 className="rf-stat-card__title">{title}</h3>
        <p className="rf-stat-card__count">{count}</p>
        <p className="rf-stat-card__description">{description}</p>
      </div>
    </Card>
  );
}
