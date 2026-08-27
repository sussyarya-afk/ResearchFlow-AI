import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store';
import { Sparkles, ArrowRight } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  onDemoLaunch: () => Promise<void>;
  demoLoading: boolean;
}

export function Navbar({ onDemoLaunch, demoLoading }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`an-nav ${scrolled ? 'an-nav--scrolled' : ''}`}>
      <div className="an-nav__container">
        {/* ── Brand ── */}
        <Link to="/" className="an-nav__brand" aria-label="AgentNotebook AI Home">
          <div className="an-nav__logo-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
                stroke="url(#nav-brand-grad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 7h6M9 11h6M9 15h4"
                stroke="url(#nav-brand-grad)"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <circle cx="17" cy="15" r="1.5" fill="#38bdf8" />
              <defs>
                <linearGradient id="nav-brand-grad" x1="4" y1="2" x2="20" y2="22">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#818cf8" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="an-nav__brand-title">AgentNotebook <span className="an-nav__brand-badge">AI</span></span>
        </Link>

        {/* ── Nav Links ── */}
        <nav className="an-nav__menu" aria-label="Primary navigation">
          <button type="button" className="an-nav__link" onClick={() => scrollToSection('problem')}>
            Product
          </button>
          <button type="button" className="an-nav__link" onClick={() => scrollToSection('pipeline')}>
            How it Works
          </button>
          <button type="button" className="an-nav__link" onClick={() => scrollToSection('workspace-preview')}>
            Workspace
          </button>
          <button type="button" className="an-nav__link" onClick={() => scrollToSection('technology')}>
            Technology
          </button>
        </nav>

        {/* ── Actions ── */}
        <div className="an-nav__actions">
          {user ? (
            <button
              type="button"
              className="an-btn-nav-primary"
              onClick={() => navigate('/dashboard')}
            >
              <span>Go to Workspace</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="an-nav__demo-btn"
                onClick={onDemoLaunch}
                disabled={demoLoading}
                title="Launch Instant Demo Workspace without sign-in"
              >
                <Sparkles size={13} className={demoLoading ? 'an-spin' : ''} />
                <span>{demoLoading ? 'Launching…' : 'Demo'}</span>
              </button>

              <Link to="/login" className="an-nav__login-btn">
                Login
              </Link>

              <Link to="/register" className="an-btn-nav-primary">
                <span>Launch AgentNotebook</span>
                <ArrowRight size={13} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
