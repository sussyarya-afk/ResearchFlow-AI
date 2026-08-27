import { useRef, useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, FileText, ArrowUpRight } from 'lucide-react';
import { sound } from '@/utils/soundEngine';
import './ExperimentsReel.css';

interface ExperimentItem {
  id: string;
  code: string;
  title: string;
  category: string;
  metric: string;
  metricLabel: string;
  abstract: string;
  docSource: string;
  pageTarget: string;
  color: string;
}

export function ExperimentsReel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const EXPERIMENTS: ExperimentItem[] = [
    {
      id: 'exp_1',
      code: 'EXP_01 // QUANTUM',
      title: 'Topological Surface Code Thresholds',
      category: 'SUPERCONDUCTING QUBITS',
      metric: '< 0.75%',
      metricLabel: 'PHYSICAL ERROR TOLERANCE',
      abstract: 'Exponential syndrome error suppression verified on cryogenic dilution setups at 14.8 mK.',
      docSource: 'Quantum_Fault_Tolerance_2024.pdf',
      pageTarget: 'Page 14 · Chunk #42',
      color: '#38bdf8',
    },
    {
      id: 'exp_2',
      code: 'EXP_02 // TRANSFORMERS',
      title: 'Subquadratic Attention Kernels',
      category: 'INFERENCE EFFICIENCY',
      metric: '4.8x',
      metricLabel: 'VRAM ALLOCATION REDUCTION',
      abstract: 'Linearized attention factors maintain full perplexity parity across 128k token context windows.',
      docSource: 'Linear_Attention_Transformers.pdf',
      pageTarget: 'Page 6 · Table 2',
      color: '#818cf8',
    },
    {
      id: 'exp_3',
      code: 'EXP_03 // CLIMATE',
      title: 'Decadal Ocean Energy Imbalance',
      category: 'RADIATIVE EQUILIBRIUM',
      metric: '+1.24 W/m²',
      metricLabel: 'NET THERMAL STORAGE FLUX',
      abstract: 'Combined satellite radiometry with ARGO float profiling proves persistent heat absorption.',
      docSource: 'Decadal_Climate_Dynamics.pdf',
      pageTarget: 'Pages 8–10 · Section 3.2',
      color: '#34d399',
    },
    {
      id: 'exp_4',
      code: 'EXP_04 // GENOMICS',
      title: 'Dense Chromatin Accessibility Mesh',
      category: 'DEEP REGULATORY MAPS',
      metric: '0.94',
      metricLabel: 'CROSS-CELL REPLICABILITY',
      abstract: 'HNSW vector indexes align non-coding genetic variants with downstream transcription phenotypes.',
      docSource: 'Regulatory_Genomics_Atlas.pdf',
      pageTarget: 'Page 22 · Figure 4',
      color: '#c084fc',
    },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollToIndex = (idx: number) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 380 + 24;
    scrollContainerRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
    setActiveCard(idx);
    sound.playClick();
  };

  return (
    <section className="an-reel-sec" id="experiments">
      <div className="an-reel__container">
        {/* ── Section Header ── */}
        <div className="an-reel__header">
          <div className="an-reel__header-left">
            <div className="an-reel__pill">
              <Sparkles size={12} />
              <span>Interactive Research Reel</span>
            </div>
            <h2 className="an-reel__title">
              Breakthroughs in <span className="text-gradient-cyan">motion.</span>
            </h2>
          </div>

          <div className="an-reel__controls">
            <span className="an-reel__index-tag">[ {String(activeCard + 1).padStart(2, '0')} / {String(EXPERIMENTS.length).padStart(2, '0')} ]</span>
            <div className="an-reel__nav-btns">
              <button
                type="button"
                className="an-reel__arrow-btn"
                onClick={() => scrollToIndex(Math.max(0, activeCard - 1))}
                aria-label="Previous experiment"
                data-cursor-label="PREV"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="an-reel__arrow-btn"
                onClick={() => scrollToIndex(Math.min(EXPERIMENTS.length - 1, activeCard + 1))}
                aria-label="Next experiment"
                data-cursor-label="NEXT"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Draggable Filmstrip Track ── */}
        <div
          ref={scrollContainerRef}
          className={`an-reel__track ${isDragging ? 'an-reel__track--dragging' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {EXPERIMENTS.map((exp, idx) => {
            const isCurrent = idx === activeCard;
            return (
              <div
                key={exp.id}
                className={`an-exp-card glass-panel ${isCurrent ? 'an-exp-card--active' : ''}`}
                onClick={() => setActiveCard(idx)}
                data-cursor-label="VIEW EXP"
              >
                {/* Top Code Badge */}
                <div className="an-exp-card__top">
                  <span className="an-exp-card__code" style={{ color: exp.color }}>{exp.code}</span>
                  <span className="an-exp-card__cat">{exp.category}</span>
                </div>

                {/* Big Metric Display */}
                <div className="an-exp-card__metric-box">
                  <span className="an-exp-card__metric-val" style={{ color: exp.color }}>{exp.metric}</span>
                  <span className="an-exp-card__metric-lbl">{exp.metricLabel}</span>
                </div>

                {/* Title and Abstract */}
                <div className="an-exp-card__info">
                  <h3 className="an-exp-card__title">{exp.title}</h3>
                  <p className="an-exp-card__abstract">{exp.abstract}</p>
                </div>

                {/* Provenance Grounding Footer */}
                <div className="an-exp-card__footer">
                  <div className="an-exp-card__doc-info">
                    <FileText size={12} style={{ color: exp.color }} />
                    <span className="an-exp-card__doc">{exp.docSource}</span>
                  </div>
                  <div className="an-exp-card__coords">
                    <span>{exp.pageTarget}</span>
                    <ArrowUpRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
