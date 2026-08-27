import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store';
import { CustomCursor } from '@/components/CustomCursor/CustomCursor';
import { ActiveTheoryHUD } from '@/components/ActiveTheoryHUD/ActiveTheoryHUD';
import {
  Navbar,
  HeroSection,
  ProblemSection,
  RagPipelineSection,
  AgentTimelineSection,
  ExperimentsReel,
  KnowledgeGalaxySection,
  DocumentExperienceSection,
  ChatDemoSection,
  CitationsSection,
  WorkspacePreviewSection,
  ProvidersSection,
  ArchitectureSection,
  FinalCtaSection,
} from './components';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLaunch = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      console.warn('Demo login redirected to login fallback', err);
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="an-landing-page">
      {/* ── Active Theory Dual-Layer Custom Magnetic Cursor ── */}
      <CustomCursor />

      {/* ── Active Theory Studio HUD & Telemetry Layer ── */}
      <ActiveTheoryHUD />

      {/* ── Minimalist Glass Navigation ── */}
      <Navbar onDemoLaunch={handleDemoLaunch} demoLoading={demoLoading} />

      {/* ── Kinetic Typography & 3D Vector Canvas Hero ── */}
      <HeroSection onDemoLaunch={handleDemoLaunch} demoLoading={demoLoading} />

      {/* ── Paradigm Shift (The 30 Tabs Problem) ── */}
      <ProblemSection />

      {/* ── 3D Interactive Knowledge Galaxy Sphere ── */}
      <KnowledgeGalaxySection />

      {/* ── Draggable Active Theory Experiments Reel ── */}
      <ExperimentsReel />

      {/* ── 8-Stage RAG Intelligence Pipeline ── */}
      <RagPipelineSection />

      {/* ── Live AI Agent Timeline Stream ── */}
      <AgentTimelineSection />

      {/* ── Floating Document Hub Experience ── */}
      <DocumentExperienceSection />

      {/* ── Grounded Chat Simulator & Provenance Inspector ── */}
      <ChatDemoSection />

      {/* ── Advanced Citations Engine ── */}
      <CitationsSection />

      {/* ── 3-Pane Research Operating System Preview ── */}
      <WorkspacePreviewSection />

      {/* ── Modular Intelligence Providers (NVIDIA, Gemini, Ollama) ── */}
      <ProvidersSection />

      {/* ── Full Technical Architecture Topology ── */}
      <ArchitectureSection />

      {/* ── Final Editorial CTA & Footer ── */}
      <FinalCtaSection onDemoLaunch={handleDemoLaunch} demoLoading={demoLoading} />
    </div>
  );
}
