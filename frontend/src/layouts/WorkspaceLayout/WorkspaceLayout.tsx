import { Outlet, useParams, Link, NavLink } from 'react-router-dom';
import './WorkspaceLayout.css';

const WORKSPACE_TABS = [
  { label: 'Overview', path: '' },
  { label: 'Research', path: 'research' },
  { label: 'Analysis', path: 'analysis' },
  { label: 'Reports', path: 'reports' },
];

export function WorkspaceLayout() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="rf-workspace">
      {/* ── Workspace Header ────────────────────────────────── */}
      <header className="rf-workspace__header">
        <div className="rf-workspace__header-top">
          <Link to="/dashboard" className="rf-workspace__back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </Link>
          <div className="rf-workspace__meta">
            <h1 className="rf-workspace__title">Project {projectId}</h1>
            <span className="rf-workspace__badge">Active</span>
          </div>
        </div>

        <nav className="rf-workspace__tabs">
          {WORKSPACE_TABS.map((tab) => (
            <NavLink
              key={tab.label}
              to={tab.path ? `/workspace/${projectId}/${tab.path}` : `/workspace/${projectId}`}
              end={!tab.path}
              className={({ isActive }) =>
                `rf-workspace__tab ${isActive ? 'rf-workspace__tab--active' : ''}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── Workspace Content ───────────────────────────────── */}
      <div className="rf-workspace__content">
        <Outlet />
      </div>
    </div>
  );
}
