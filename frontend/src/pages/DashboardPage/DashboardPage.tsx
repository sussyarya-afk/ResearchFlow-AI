import { Link } from 'react-router-dom';
import { Card, Button, EmptyState } from '@/components/ui';
import './DashboardPage.css';

const STATS = [
  { label: 'Active Projects', value: '12', change: '+3', trend: 'up' },
  { label: 'Papers Analyzed', value: '1,847', change: '+124', trend: 'up' },
  { label: 'AI Queries', value: '432', change: '+56', trend: 'up' },
  { label: 'Reports Generated', value: '28', change: '+5', trend: 'up' },
];

export function DashboardPage() {
  return (
    <div className="rf-dashboard-page animate-fade-in">
      <div className="rf-dashboard-page__header">
        <div>
          <h1 className="rf-dashboard-page__title">Dashboard</h1>
          <p className="rf-dashboard-page__subtitle">Welcome back — here's your research overview</p>
        </div>
        <Link to="/workspace/new">
          <Button>
            <span>+</span> New Project
          </Button>
        </Link>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────── */}
      <div className="rf-dashboard-page__stats">
        {STATS.map((stat) => (
          <Card key={stat.label} variant="glass" padding="md" hoverable>
            <div className="rf-stat">
              <span className="rf-stat__label">{stat.label}</span>
              <span className="rf-stat__value">{stat.value}</span>
              <span className={`rf-stat__change rf-stat__change--${stat.trend}`}>
                {stat.change} this week
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Recent Projects ─────────────────────────────────── */}
      <section className="rf-dashboard-page__section">
        <h2 className="rf-dashboard-page__section-title">Recent Projects</h2>
        <EmptyState
          title="No projects yet"
          description="Create your first research project to get started with AI-powered analysis."
          action={
            <Link to="/workspace/new">
              <Button size="sm">Create Project</Button>
            </Link>
          }
        />
      </section>
    </div>
  );
}
