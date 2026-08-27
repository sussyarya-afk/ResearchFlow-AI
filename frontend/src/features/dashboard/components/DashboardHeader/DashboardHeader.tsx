import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Moon, Sun, User as UserIcon, LogOut, Settings, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { useAuth } from '@/store';
import './DashboardHeader.css';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('rf_theme') as 'dark' | 'light') || 'dark';
  });
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rf_theme', theme);
  }, [theme]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/projects?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.fullName || (user?.email ? user.email.split('@')[0] : 'Research User');
  const userInitial = displayName.charAt(0).toUpperCase();

  const notifications = [
    { id: '1', title: 'ChromaDB Vector Store Connected', time: 'Just now', icon: <Check size={14} color="var(--color-success)" /> },
    { id: '2', title: 'Active LLM: Gemini 1.5 Flash', time: '10m ago', icon: <Sparkles size={14} color="var(--color-accent-400)" /> },
    { id: '3', title: 'System Healthy & All APIs Ready', time: '1h ago', icon: <ShieldCheck size={14} color="var(--color-primary-400)" /> },
  ];

  return (
    <header className="rf-dashboard-header">
      {/* ── Search Bar ── */}
      <div className="rf-dashboard-header__search">
        <Search className="rf-dashboard-header__search-icon" size={18} />
        <input
          type="text"
          placeholder="Search projects, documents, or chats... (Press Enter)"
          className="rf-dashboard-header__search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          id="dashboard-search-input"
        />
      </div>

      {/* ── Actions ── */}
      <div className="rf-dashboard-header__actions">
        {/* Notifications */}
        <div className="rf-dashboard-header__popover-container" ref={notifRef}>
          <button
            className={`rf-dashboard-header__action-btn ${notificationsOpen ? 'rf-dashboard-header__action-btn--active' : ''}`}
            aria-label="Notifications"
            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileMenuOpen(false); }}
            id="header-notif-btn"
          >
            <Bell size={19} />
            <span className="rf-dashboard-header__notification-badge" />
          </button>

          {notificationsOpen && (
            <div className="rf-dashboard-header__dropdown rf-dashboard-header__dropdown--notifs animate-scale-in">
              <div className="rf-notifs-header">
                <span className="rf-notifs-title">Notifications</span>
                <span className="rf-notifs-count">{notifications.length} new</span>
              </div>
              <ul className="rf-notifs-list">
                {notifications.map(n => (
                  <li key={n.id} className="rf-notifs-item">
                    <div className="rf-notifs-icon">{n.icon}</div>
                    <div className="rf-notifs-content">
                      <p className="rf-notifs-text">{n.title}</p>
                      <span className="rf-notifs-time">{n.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          className="rf-dashboard-header__action-btn"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onClick={toggleTheme}
          id="header-theme-btn"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Profile Dropdown */}
        <div className="rf-dashboard-header__popover-container" ref={profileRef}>
          <div
            className="rf-dashboard-header__profile"
            onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotificationsOpen(false); }}
            role="button"
            tabIndex={0}
            id="header-profile-btn"
          >
            <div className="rf-dashboard-header__avatar">
              {userInitial}
            </div>
            <span className="rf-dashboard-header__user-name">{displayName}</span>
          </div>

          {profileMenuOpen && (
            <div className="rf-dashboard-header__dropdown rf-dashboard-header__dropdown--profile animate-scale-in">
              <div className="rf-profile-menu__header">
                <p className="rf-profile-menu__name">{displayName}</p>
                <p className="rf-profile-menu__email">{user?.email || 'demo@agentnotebook.ai'}</p>
                <span className="rf-profile-menu__org">{user?.organization || 'AgentNotebook Research Lab'}</span>
              </div>
              <div className="rf-profile-menu__divider" />
              <Link
                to="/profile"
                className="rf-profile-menu__item"
                onClick={() => setProfileMenuOpen(false)}
              >
                <UserIcon size={16} />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                className="rf-profile-menu__item"
                onClick={() => setProfileMenuOpen(false)}
              >
                <Settings size={16} />
                <span>Settings & Providers</span>
              </Link>
              <div className="rf-profile-menu__divider" />
              <button
                className="rf-profile-menu__item rf-profile-menu__item--danger"
                onClick={handleLogout}
                id="header-logout-btn"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
