
import { EmptyState } from '@/components/ui';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ProjectCard } from '@/features/dashboard/components/ProjectCard';
import { ContinueWorking } from '@/features/dashboard/components/ContinueWorking';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { MOCK_STATS, MOCK_PROJECTS, MOCK_CONTINUE_WORKING } from '@/features/dashboard/mockData';
import { FolderKanban, FileText, MessageSquare, Bot } from 'lucide-react';
import './DashboardPage.css';

const STAT_ICONS = {
  'Total Projects': <FolderKanban size={20} />,
  'Uploaded Documents': <FileText size={20} />,
  'AI Chats': <MessageSquare size={20} />,
  'AI Agents': <Bot size={20} />
};

export function DashboardPage() {
  const hasProjects = MOCK_PROJECTS.length > 0;

  return (
    <div className="rf-dashboard-page animate-fade-in">
      {/* ── Welcome Section ─────────────────────────────────── */}
      <div className="rf-dashboard-page__header">
        <h1 className="rf-dashboard-page__title">Welcome back 👋</h1>
        <p className="rf-dashboard-page__subtitle">Ready to continue your research? Here's what's happening today.</p>
      </div>

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className="rf-dashboard-page__grid">
        <div className="rf-dashboard-page__main-col">
          {hasProjects && (
            <div className="rf-dashboard-page__continue">
              <ContinueWorking 
                project={MOCK_CONTINUE_WORKING.project} 
                progress={MOCK_CONTINUE_WORKING.progress} 
              />
            </div>
          )}

          {/* ── Stats ─────────────────────────────────────────── */}
          <div className="rf-dashboard-page__stats">
            {MOCK_STATS.map((stat) => (
              <StatCard 
                key={stat.id}
                title={stat.title}
                count={stat.count}
                description={stat.description}
                icon={STAT_ICONS[stat.title as keyof typeof STAT_ICONS] || <FolderKanban size={20} />}
              />
            ))}
          </div>

          {/* ── Recent Projects ───────────────────────────────── */}
          <section className="rf-dashboard-page__section">
            <h2 className="rf-dashboard-page__section-title">Recent Projects</h2>
            
            {hasProjects ? (
              <div className="rf-dashboard-page__projects">
                {MOCK_PROJECTS.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects yet"
                description="Create your first research project to get started with AI-powered analysis."
              />
            )}
          </section>
        </div>

        {/* ── Sidebar Column ────────────────────────────────── */}
        <div className="rf-dashboard-page__side-col">
          <section className="rf-dashboard-page__section">
            <h2 className="rf-dashboard-page__section-title">Quick Actions</h2>
            <QuickActions />
          </section>
        </div>
      </div>
    </div>
  );
}
