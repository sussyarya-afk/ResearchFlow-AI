import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, FileText, Cpu, Search, Brain, CheckCircle, Zap } from 'lucide-react';
import './HeroSection.css';

interface HeroSectionProps {
  onDemoLaunch: () => Promise<void>;
  demoLoading: boolean;
}

interface NodePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  label: string;
  stage: number;
  size: number;
  color: string;
}

export function HeroSection({ onDemoLaunch, demoLoading }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, vx: 0, vy: 0, lastX: 0, lastY: 0, active: false });

  const STAGES = [
    { title: 'Documents', desc: 'PDFs, papers, multi-page data', icon: <FileText size={14} />, color: '#38bdf8' },
    { title: 'Understanding', desc: 'PyMuPDF structure & layout OCR', icon: <Cpu size={14} />, color: '#60a5fa' },
    { title: 'Retrieval', desc: 'Vector search & dense embeddings', icon: <Search size={14} />, color: '#818cf8' },
    { title: 'Reasoning', desc: 'Multi-hop context & synthesis', icon: <Brain size={14} />, color: '#a78bfa' },
    { title: 'Knowledge', desc: 'Verifiable answers with citations', icon: <CheckCircle size={14} />, color: '#34d399' },
  ];

  // 3D perspective tilt effect on mouse move
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / rect.height) * 8;
    const rotY = (x / rect.width) * 8;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize network nodes along the pipeline flow
    const nodeLabels = [
      { label: 'PDF Corpi', stage: 0, color: '#38bdf8' },
      { label: 'Extraction', stage: 1, color: '#60a5fa' },
      { label: 'ChromaDB', stage: 2, color: '#818cf8' },
      { label: 'RAG Context', stage: 3, color: '#a78bfa' },
      { label: 'Grounded Output', stage: 4, color: '#34d399' },
      { label: 'Citation Links', stage: 4, color: '#38bdf8' },
      { label: 'Embeddings', stage: 2, color: '#818cf8' },
      { label: 'Hypothesis', stage: 3, color: '#c084fc' },
    ];

    const nodes: NodePoint[] = nodeLabels.map((n, i) => {
      const colX = (width * 0.15) + ((width * 0.7) / 5) * n.stage + (Math.random() - 0.5) * 40;
      const rowY = (height * 0.25) + ((i % 3) * (height * 0.25)) + (Math.random() - 0.5) * 30;
      return {
        x: colX,
        y: rowY,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        label: n.label,
        stage: n.stage,
        size: Math.random() * 2.5 + 3,
        color: n.color,
      };
    });

    // Background floating particle dust
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let stepCycle = 0;

    const render = () => {
      stepCycle += 0.008;
      // Auto cycle active stage every ~3 seconds
      const currentStageIndex = Math.floor(stepCycle * 0.8) % 5;
      setActiveStage(currentStageIndex);

      // Smooth mouse follow
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle background particles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
        ctx.fill();
      });

      // 2. Draw connections between nodes with glowing energy pulses
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const isStageConnected = Math.abs(nodes[i].stage - nodes[j].stage) <= 1;
            const alpha = (1 - dist / 180) * (isStageConnected ? 0.35 : 0.1);
            
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = isStageConnected ? 1.2 : 0.6;
            ctx.stroke();

            // Energy packet along line
            if (isStageConnected && (i + j) % 2 === 0) {
              const t = (Math.sin(stepCycle * 2 + i) + 1) / 2;
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = '#38bdf8';
              ctx.fill();
            }
          }
        }
      }

      // 3. Draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounding bounce
        if (node.x < width * 0.05 || node.x > width * 0.95) node.vx *= -1;
        if (node.y < height * 0.1 || node.y > height * 0.9) node.vy *= -1;

        // Subtle mouse repulsion / attraction
        if (mousePos.current.active) {
          const mdx = node.x - mousePos.current.x;
          const mdy = node.y - mousePos.current.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            node.x += (mdx / mdist) * 0.8;
            node.y += (mdy / mdist) * 0.8;
          }
        }

        const isCurrentStage = node.stage === currentStageIndex;

        // Outer glow circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, isCurrentStage ? node.size * 3 : node.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentStage ? 'rgba(56, 189, 248, 0.22)' : 'rgba(129, 140, 248, 0.08)';
        ctx.fill();

        // Node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, isCurrentStage ? node.size + 1.5 : node.size, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentStage ? '#38bdf8' : node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isCurrentStage ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node label
        ctx.font = '10px "Space Grotesk", sans-serif';
        ctx.fillStyle = isCurrentStage ? '#ffffff' : 'rgba(203, 213, 225, 0.7)';
        ctx.fillText(node.label, node.x + 8, node.y + 3);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current.targetX = e.clientX - rect.left;
      mousePos.current.targetY = e.clientY - rect.top;
      mousePos.current.active = true;
    };

    const handleMouseLeave = () => {
      mousePos.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section className="an-hero" id="hero">
      {/* ── Background Atmospheric Glow ── */}
      <div className="an-hero__ambient">
        <div className="an-hero__glow an-hero__glow--cyan" />
        <div className="an-hero__glow an-hero__glow--indigo" />
        <div className="an-hero__glow an-hero__glow--violet" />
      </div>

      <div className="an-hero__container">
        {/* ── Top Capsule Pill ── */}
        <div className="an-hero__pill-wrapper animate-fade-in">
          <div className="an-hero__pill">
            <span className="an-hero__pill-dot" />
            <span className="an-hero__pill-text">Autonomous Research Laboratory & Connected Knowledge OS</span>
            <Zap size={12} className="an-hero__pill-icon" />
          </div>
        </div>

        {/* ── Large Editorial Typography ── */}
        <div className="an-hero__kicker-group">
          <h1 className="an-hero__headline">
            <span className="an-hero__word an-hero__word--1">RESEARCH.</span>
            <span className="an-hero__word an-hero__word--2">THINK.</span>
            <span className="an-hero__word an-hero__word--3">CONNECT.</span>
          </h1>
          <div className="an-hero__product-title">
            <span>AgentNotebook</span> <span className="an-hero__product-ai">AI</span>
          </div>
        </div>

        {/* ── Supporting Lead ── */}
        <p className="an-hero__subline">
          Your AI-powered research notebook for understanding documents, discovering connections,
          and getting answers with evidence.
        </p>

        {/* ── Call to Actions ── */}
        <div className="an-hero__cta-group">
          <Link to="/register" className="an-cta-primary" id="hero-start-btn">
            <span>Start Researching</span>
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            className="an-cta-secondary"
            onClick={onDemoLaunch}
            disabled={demoLoading}
            id="hero-explore-btn"
          >
            <Sparkles size={16} className={demoLoading ? 'an-spin' : ''} />
            <span>{demoLoading ? 'Launching Workspace...' : 'Explore the Workspace'}</span>
          </button>
        </div>

        {/* ── Interactive Pipeline Visual Showcase with 3D Tilt ── */}
        <div
          ref={cardRef}
          className="an-hero__visual-card glass-panel"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="an-hero__visual-header">
            <div className="an-hero__visual-dots">
              <span className="an-dot an-dot--red" />
              <span className="an-dot an-dot--yellow" />
              <span className="an-dot an-dot--green" />
            </div>
            <div className="an-hero__visual-title">
              <span className="an-hero__pulse-indicator" />
              <span>LIVE KNOWLEDGE GRAPH ENGINE · REAL-TIME RAG TOPOLOGY</span>
            </div>
            <div className="an-hero__visual-status">60 FPS · ACTIVE</div>
          </div>

          <div className="an-hero__canvas-container">
            <canvas ref={canvasRef} className="an-hero__canvas" />
          </div>

          {/* 5-Step Pipeline Stages Bar */}
          <div className="an-hero__pipeline-bar">
            {STAGES.map((s, idx) => {
              const isActive = idx === activeStage;
              return (
                <button
                  key={s.title}
                  type="button"
                  className={`an-pipeline-step ${isActive ? 'an-pipeline-step--active' : ''}`}
                  onClick={() => setActiveStage(idx)}
                >
                  <div className="an-pipeline-step__icon-box" style={{ color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="an-pipeline-step__info">
                    <span className="an-pipeline-step__title">{s.title}</span>
                    <span className="an-pipeline-step__desc">{s.desc}</span>
                  </div>
                  {idx < STAGES.length - 1 && <div className="an-pipeline-step__connector" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
