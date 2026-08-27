import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield } from 'lucide-react';
import './FinalCtaSection.css';

interface FinalCtaProps {
  onDemoLaunch: () => Promise<void>;
  demoLoading: boolean;
}

export function FinalCtaSection({ onDemoLaunch, demoLoading }: FinalCtaProps) {
  return (
    <section className="an-final-cta">
      {/* Ambient background glow */}
      <div className="an-final-cta__ambient">
        <div className="an-final-cta__glow an-final-cta__glow--cyan" />
        <div className="an-final-cta__glow an-final-cta__glow--indigo" />
      </div>

      <div className="an-final-cta__container">
        {/* ── Main Callout Box ── */}
        <div className="an-final-cta__card glass-panel">
          <div className="an-final-cta__pill">
            <Sparkles size={13} />
            <span>Transform Your Research Workflow</span>
          </div>

          <h2 className="an-final-cta__headline">
            <span>YOUR NEXT</span>
            <span className="an-headline-grad">BREAKTHROUGH</span>
            <span>STARTS WITH A QUESTION.</span>
          </h2>

          <p className="an-final-cta__subline">
            Turn dense scientific literature, clinical papers, and complex documentation
            into connected, citation-backed intelligence.
          </p>

          <div className="an-final-cta__actions">
            <Link to="/register" className="an-btn-cta-lg" id="final-cta-open-btn">
              <span>Open AgentNotebook</span>
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              className="an-btn-cta-demo"
              onClick={onDemoLaunch}
              disabled={demoLoading}
              id="final-cta-demo-btn"
            >
              <Sparkles size={16} />
              <span>{demoLoading ? 'Launching Demo...' : 'Instant 1-Click Demo'}</span>
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="an-footer">
          <div className="an-footer__grid">
            <div className="an-footer__brand-col">
              <div className="an-footer__logo">
                <div className="an-nav__logo-mark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
                      stroke="url(#footer-brand-grad)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="footer-brand-grad" x1="4" y1="2" x2="20" y2="22">
                        <stop stopColor="#38bdf8" />
                        <stop offset="1" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="an-footer__brand-name">AgentNotebook AI</span>
              </div>
              <p className="an-footer__tagline">Research. Think. Connect.</p>
              <p className="an-footer__mission">
                An intelligent research notebook that turns your documents, questions, and sources into connected knowledge.
              </p>
            </div>

            <div className="an-footer__links-col">
              <span className="an-footer__col-title">Product</span>
              <ul className="an-footer__list">
                <li><a href="#hero">Overview</a></li>
                <li><a href="#pipeline">RAG Engine</a></li>
                <li><a href="#timeline">Live Agent Trace</a></li>
                <li><a href="#citations">Citation Provenance</a></li>
              </ul>
            </div>

            <div className="an-footer__links-col">
              <span className="an-footer__col-title">Workspace</span>
              <ul className="an-footer__list">
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Create Account</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/settings">Provider Settings</Link></li>
              </ul>
            </div>

            <div className="an-footer__links-col">
              <span className="an-footer__col-title">Intelligence</span>
              <ul className="an-footer__list">
                <li><a href="#providers">NVIDIA NIM</a></li>
                <li><a href="#providers">Google Gemini</a></li>
                <li><a href="#providers">Ollama On-Premises</a></li>
                <li><a href="#technology">ChromaDB Vectors</a></li>
              </ul>
            </div>
          </div>

          <div className="an-footer__bottom">
            <span className="an-footer__copy">
              © {new Date().getFullYear()} AgentNotebook AI. All rights reserved. Built for researchers, engineers, and scientists.
            </span>
            <div className="an-footer__socials">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="an-footer__social-link" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <span className="an-footer__status-badge">
                <Shield size={12} color="var(--color-success)" />
                Zero Data Retention Verified
              </span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
