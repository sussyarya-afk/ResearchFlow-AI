import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/store';
import './DashboardLayout.css';

import { LayoutDashboard, FolderKanban, Bot, FileText, Star, Settings } from 'lucide-react';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: <FolderKanban size={20} />,
  },
  {
    label: 'AI Agents',
    to: '/agents',
    icon: <Bot size={20} />,
  },
  {
    label: 'Documents',
    to: '/documents',
    icon: <FileText size={20} />,
  },
  {
    label: 'Favorites',
    to: '/favorites',
    icon: <Star size={20} />,
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: <Settings size={20} />,
  },
];

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const displayName = user?.fullName || (user?.email ? user.email.split('@')[0] : 'User');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`rf-dashboard ${sidebarCollapsed ? 'rf-dashboard--collapsed' : ''}`}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="rf-sidebar">
        <div className="rf-sidebar__header">
          <Link to="/dashboard" className="rf-sidebar__logo">
            <div className="rf-sidebar__logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="url(#sidebar-grad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="sidebar-grad" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="var(--color-primary-400)" />
                    <stop offset="1" stopColor="var(--color-accent-400)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="rf-sidebar__logo-text">ResearchFlow</span>
          </Link>

          <button
            className="rf-sidebar__toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="rf-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rf-sidebar__link ${isActive ? 'rf-sidebar__link--active' : ''}`
              }
            >
              <span className="rf-sidebar__link-icon">{item.icon}</span>
              <span className="rf-sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="rf-sidebar__footer">
          <Link to="/profile" className="rf-sidebar__user" style={{ textDecoration: 'none' }}>
            <div className="rf-sidebar__avatar">{userInitial}</div>
            <div className="rf-sidebar__user-info">
              <span className="rf-sidebar__user-name">{displayName}</span>
              <span className="rf-sidebar__user-role">{user?.organization || 'Research AI'}</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="rf-dashboard__main">
        <DashboardHeader />
        <div className="rf-dashboard__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
