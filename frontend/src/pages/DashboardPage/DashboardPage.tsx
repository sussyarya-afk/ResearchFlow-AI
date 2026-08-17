import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { ProjectCard } from '@/features/dashboard/components/ProjectCard';
import { ContinueWorking } from '@/features/dashboard/components/ContinueWorking';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal/CreateProjectModal';
import { UploadModal } from '@/features/workspace/components/upload/UploadModal';
import { projectService } from '@/features/projects/services/projectService';
import { useAuth } from '@/store';
import type { Project } from '@/features/projects/types';
import { FolderKanban, FileText, MessageSquare, Bot } from 'lucide-react';
import './DashboardPage.css';

const STAT_ICONS = {
  'Total Projects': <FolderKanban size={20} />,
  'Uploaded Documents': <FileText size={20} />,
  'AI Chats': <MessageSquare size={20} />,
  'AI Agents': <Bot size={20} />
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState<string>('');

  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard.');
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const stats = useMemo(() => ([
    {
      id: 'projects',
      title: 'Total Projects',
      count: projects.length,
      description: 'Research workspaces',
    },
    {
      id: 'documents',
      title: 'Uploaded Documents',
      count: projects.reduce((sum, project) => sum + project.documents, 0),
      description: 'Indexed source files',
    },
    {
      id: 'chats',
      title: 'AI Chats',
      count: projects.reduce((sum, project) => sum + project.chats, 0),
      description: 'Saved research chats',
    },
    {
      id: 'agents',
      title: 'AI Agents',
      count: 3,
      description: 'Live agent assistants',
    },
  ]), [projects]);

  const hasProjects = projects.length > 0;
  const recentProjects = projects.slice(0, 4);

  const handleQuickUpload = () => {
    if (projects.length > 0) {
      setUploadProjectId(projects[0].id);
      setUploadModalOpen(true);
    } else {
      setCreateModalOpen(true);
    }
  };

  const handleQuickAskAI = () => {
    if (projects.length > 0) {
      navigate(`/workspace/${projects[0].id}`);
    } else {
      setCreateModalOpen(true);
    }
  };

  return (
    <div className="rf-dashboard-page animate-fade-in">
      {/* ── Welcome Section ─────────────────────────────────── */}
      <div className="rf-dashboard-page__header">
        <h1 className="rf-dashboard-page__title">
          Welcome back, {user?.fullName || (user?.email ? user.email.split('@')[0] : 'Researcher')} 👋
        </h1>
        <p className="rf-dashboard-page__subtitle">Ready to continue your research? Here's what's happening today.</p>
      </div>

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className="rf-dashboard-page__grid">
        <div className="rf-dashboard-page__main-col">
          {hasProjects && (
            <div className="rf-dashboard-page__continue">
              <ContinueWorking 
                project={projects[0]}
              />
            </div>
          )}

          {/* ── Stats ─────────────────────────────────────────── */}
          <div className="rf-dashboard-page__stats">
            {stats.map((stat) => (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="rf-dashboard-page__section-title" style={{ margin: 0 }}>Recent Projects</h2>
              {hasProjects && (
                <button
                  className="rf-dashboard-view-all"
                  onClick={() => navigate('/projects')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary-400)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}
                >
                  View all ({projects.length}) →
                </button>
              )}
            </div>

            {error && (
              <EmptyState
                title="Dashboard unavailable"
                description={error}
              />
            )}
            
            {!error && hasProjects ? (
              <div className="rf-dashboard-page__projects">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onProjectUpdated={loadProjects}
                  />
                ))}
              </div>
            ) : !error ? (
              <EmptyState
                title="No projects yet"
                description="Create your first research project to get started with AI-powered analysis."
              />
            ) : null}
          </section>
        </div>

        {/* ── Sidebar Column ────────────────────────────────── */}
        <div className="rf-dashboard-page__side-col">
          <section className="rf-dashboard-page__section">
            <h2 className="rf-dashboard-page__section-title">Quick Actions</h2>
            <QuickActions
              onNewProject={() => setCreateModalOpen(true)}
              onUploadDoc={handleQuickUpload}
              onAskAI={handleQuickAskAI}
            />
          </section>
        </div>
      </div>

      {/* ── Create Project Modal ── */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={() => {
          setCreateModalOpen(false);
          loadProjects();
        }}
      />

      {/* ── Upload Modal ── */}
      {uploadProjectId && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          projectId={uploadProjectId}
          onUploadSuccess={() => {
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
