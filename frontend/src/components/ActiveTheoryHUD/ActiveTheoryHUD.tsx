import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Activity, Compass, Clock } from 'lucide-react';
import { sound } from '@/utils/soundEngine';
import './ActiveTheoryHUD.css';

export function ActiveTheoryHUD() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [fps, setFps] = useState<number>(60);
  const [utcTime, setUtcTime] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);

  useEffect(() => {
    // 1. Mouse coordinates
    const onMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMouseMove);

    // 2. FPS Calculation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let animId: number;

    const calcFps = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);

    // 3. UTC Clock
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // 4. Initial sound state
    setIsAudioMuted(sound.getIsMuted());

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
      clearInterval(clockInterval);
    };
  }, []);

  const handleAudioToggle = () => {
    const isNowActive = sound.toggle();
    setIsAudioMuted(!isNowActive);
  };

  const padNum = (n: number) => String(n).padStart(4, '0');

  return (
    <aside className="an-hud" aria-hidden="true">
      {/* ── 4 Precision Technical Framing Brackets ─────────────── */}
      <div className="an-hud__bracket an-hud__bracket--tl">
        <span className="an-hud__crosshair">+</span>
        <span className="an-hud__tag">AN_LAB // 01</span>
      </div>

      <div className="an-hud__bracket an-hud__bracket--tr">
        <span className="an-hud__tag">EDITION // 2026.1</span>
        <span className="an-hud__crosshair">+</span>
      </div>

      <div className="an-hud__bracket an-hud__bracket--bl">
        <span className="an-hud__crosshair">+</span>
        <span className="an-hud__tag">HNSW_384D // SYNC</span>
      </div>

      <div className="an-hud__bracket an-hud__bracket--br">
        <span className="an-hud__tag">LATENCY // 12ms</span>
        <span className="an-hud__crosshair">+</span>
      </div>

      {/* ── Vertical Side Telemetry Labels ─────────────────────── */}
      <div className="an-hud__side an-hud__side--left">
        <span>[ SYSTEM // AGENTNOTEBOOK 2.4 ]</span>
        <span className="an-hud__side-divider" />
        <span>[ TOPOLOGY // CHROMADB MESH ]</span>
      </div>

      <div className="an-hud__side an-hud__side--right">
        <span>[ LLM CORE // MULTI-PROVIDER ]</span>
        <span className="an-hud__side-divider" />
        <span>[ CITATIONS // STRICT PROVENANCE ]</span>
      </div>

      {/* ── Fixed Bottom Telemetry Console Bar ─────────────────── */}
      <div className="an-hud__bottom-bar">
        {/* Coordinates */}
        <div className="an-hud__stat-item">
          <Compass size={11} className="an-hud__icon" />
          <span>POS [ X: {padNum(coords.x)} · Y: {padNum(coords.y)} ]</span>
        </div>

        {/* FPS Meter */}
        <div className="an-hud__stat-item">
          <Activity size={11} className="an-hud__icon an-hud__icon--pulse" />
          <span>{fps}.0 FPS // RENDERING</span>
        </div>

        {/* UTC Clock */}
        <div className="an-hud__stat-item an-hud__stat-item--clock">
          <Clock size={11} className="an-hud__icon" />
          <span>{utcTime}</span>
        </div>

        {/* Audio Equalizer & Sound Toggle */}
        <button
          type="button"
          className={`an-hud__audio-btn ${!isAudioMuted ? 'an-hud__audio-btn--active' : ''}`}
          onClick={handleAudioToggle}
          title={isAudioMuted ? 'Unmute procedural sound design' : 'Mute sound design'}
          data-cursor-label="AUDIO"
        >
          {!isAudioMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
          <span className="an-hud__audio-label">{!isAudioMuted ? 'AUDIO: ON' : 'AUDIO: OFF'}</span>

          {/* 5-bar animated audio equalizer */}
          <div className={`an-hud__eq ${!isAudioMuted ? 'an-hud__eq--playing' : ''}`}>
            <span className="an-eq-bar" />
            <span className="an-eq-bar" />
            <span className="an-eq-bar" />
            <span className="an-eq-bar" />
            <span className="an-eq-bar" />
          </div>
        </button>
      </div>
    </aside>
  );
}
