import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="rf-auth-layout">
      {/* ── Ambient background ──────────────────────────────── */}
      <div className="rf-auth-layout__bg">
        <div className="rf-auth-layout__orb rf-auth-layout__orb--primary" />
        <div className="rf-auth-layout__orb rf-auth-layout__orb--accent" />
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="rf-auth-layout__container animate-fade-in-up">
        <div className="rf-auth-layout__brand">
          <Link to="/" className="rf-auth-layout__logo">
            <div className="rf-auth-layout__logo-mark">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="url(#auth-logo-grad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="auth-logo-grad" x1="2" y1="2" x2="22" y2="22">
                    <stop stopColor="var(--color-primary-400)" />
                    <stop offset="1" stopColor="var(--color-accent-400)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="rf-auth-layout__logo-text">ResearchFlow AI</span>
          </Link>
        </div>

        <div className="rf-auth-layout__card">
          <Outlet />
        </div>

        <p className="rf-auth-layout__footer">
          © {new Date().getFullYear()} ResearchFlow AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
