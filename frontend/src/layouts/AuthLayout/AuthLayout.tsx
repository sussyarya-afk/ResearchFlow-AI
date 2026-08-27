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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
                  stroke="url(#auth-brand-grad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 7h6M9 11h6M9 15h4"
                  stroke="url(#auth-brand-grad)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="17" cy="15" r="1.5" fill="#38bdf8" />
                <defs>
                  <linearGradient id="auth-brand-grad" x1="4" y1="2" x2="20" y2="22">
                    <stop stopColor="#38bdf8" />
                    <stop offset="0.5" stopColor="#818cf8" />
                    <stop offset="1" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="rf-auth-layout__logo-text">AgentNotebook <span className="rf-auth-layout__logo-badge">AI</span></span>
          </Link>
        </div>

        <div className="rf-auth-layout__card">
          <Outlet />
        </div>

        <p className="rf-auth-layout__footer">
          © {new Date().getFullYear()} AgentNotebook AI · Research. Think. Connect.
        </p>
      </div>
    </div>
  );
}
