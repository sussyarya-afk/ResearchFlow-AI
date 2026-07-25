import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="rf-home">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="rf-home__nav">
        <Link to="/" className="rf-home__brand">
          <div className="rf-home__brand-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="url(#home-grad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="home-grad" x1="2" y1="2" x2="22" y2="22">
                  <stop stopColor="var(--color-primary-400)" />
                  <stop offset="1" stopColor="var(--color-accent-400)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="rf-home__brand-text">ResearchFlow AI</span>
        </Link>
        <div className="rf-home__nav-links">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="rf-home__hero">
        <div className="rf-home__hero-bg">
          <div className="rf-home__orb rf-home__orb--1" />
          <div className="rf-home__orb rf-home__orb--2" />
          <div className="rf-home__orb rf-home__orb--3" />
        </div>
        <div className="rf-home__hero-content animate-fade-in-up">
          <span className="rf-home__pill">✨ AI-Powered Research Workflows</span>
          <h1 className="rf-home__headline">
            Accelerate your research<br />
            with <span className="rf-home__gradient-text">intelligent automation</span>
          </h1>
          <p className="rf-home__subline">
            ResearchFlow AI streamlines literature reviews, data analysis, and report
            generation — so you can focus on breakthrough discoveries.
          </p>
          <div className="rf-home__cta">
            <Link to="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">View Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="rf-home__features">
        {[
          {
            icon: '🔬',
            title: 'Smart Literature Review',
            desc: 'AI reads and summarizes thousands of papers in minutes.',
          },
          {
            icon: '📊',
            title: 'Automated Analysis',
            desc: 'Statistical modeling and visualization built right in.',
          },
          {
            icon: '🤖',
            title: 'AI Research Assistant',
            desc: 'Ask questions, get cited answers from your corpus.',
          },
          {
            icon: '📝',
            title: 'Report Generation',
            desc: 'Export publication-ready reports with one click.',
          },
        ].map((f) => (
          <div className="rf-home__feature-card" key={f.title}>
            <span className="rf-home__feature-icon">{f.icon}</span>
            <h3 className="rf-home__feature-title">{f.title}</h3>
            <p className="rf-home__feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
