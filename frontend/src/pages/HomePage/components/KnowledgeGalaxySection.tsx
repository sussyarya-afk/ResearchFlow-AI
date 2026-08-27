import { useEffect, useRef, useState } from 'react';
import { Orbit } from 'lucide-react';
import { sound } from '@/utils/soundEngine';
import './KnowledgeGalaxySection.css';

interface ClusterTopic {
  name: string;
  count: number;
  color: string;
  desc: string;
}

export function KnowledgeGalaxySection() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeCluster, setActiveCluster] = useState<number>(0);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0.2, y: 0.4 });
  const autoRotate = useRef(true);

  const CLUSTERS: ClusterTopic[] = [
    { name: 'Quantum Information', count: 1420, color: '#38bdf8', desc: 'Fault-tolerant surface codes, topological braids, and cryogenic qubits' },
    { name: 'Subquadratic Attention', count: 980, color: '#818cf8', desc: 'Linearized KV-cache factoring and multi-hop reasoning transformers' },
    { name: 'Planetary Radiometry', count: 750, color: '#34d399', desc: 'Ocean heat uptake balances and multi-sensor atmospheric models' },
    { name: 'Regulatory Genomics', count: 946, color: '#c084fc', desc: 'Chromatin accessibility peaks and non-coding variant pathogenicity' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 460);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 460;
    };
    window.addEventListener('resize', handleResize);

    // Generate 3D sphere points (Fibonacci sphere distribution)
    const numPoints = 140;
    const radius = Math.min(width, height) * 0.38;
    const points: Array<{ x: number; y: number; z: number; color: string; size: number; cluster: number }> = [];

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const clusterIndex = i % CLUSTERS.length;
      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        color: CLUSTERS[clusterIndex].color,
        size: Math.random() * 2 + 2,
        cluster: clusterIndex,
      });
    }

    const render = () => {
      if (autoRotate.current) {
        rotation.current.y += 0.003;
        rotation.current.x += 0.001;
      }

      ctx.clearRect(0, 0, width, height);

      const cosX = Math.cos(rotation.current.x);
      const sinX = Math.sin(rotation.current.x);
      const cosY = Math.cos(rotation.current.y);
      const sinY = Math.sin(rotation.current.y);

      // Projected points
      const projected = points.map((p) => {
        // Rotate around Y
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 400;
        const scale = fov / (fov + z2);
        const px = width / 2 + x1 * scale;
        const py = height / 2 + y2 * scale;

        return { px, py, scale, z: z2, color: p.color, size: p.size, cluster: p.cluster };
      });

      // Sort by Z for proper depth
      projected.sort((a, b) => b.z - a.z);

      // 1. Draw interconnected neural graph lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 65) {
            const isSameCluster = projected[i].cluster === projected[j].cluster;
            const alpha = (1 - dist / 65) * (isSameCluster ? 0.25 : 0.08);

            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // 2. Draw 3D nodes
      projected.forEach((p) => {
        const isClusterMatch = p.cluster === activeCluster;
        const radius = p.size * p.scale * (isClusterMatch ? 1.6 : 1);
        const alpha = Math.max(0.15, (p.scale - 0.4) * 1.2);

        // Halo
        if (isClusterMatch) {
          ctx.beginPath();
          ctx.arc(p.px, p.py, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, 0.15)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = isClusterMatch ? '#ffffff' : p.color;
        ctx.globalAlpha = isClusterMatch ? 1 : alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = isClusterMatch ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse rotation drag handlers
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      autoRotate.current = false;
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      rotation.current.y += dx * 0.008;
      rotation.current.x += dy * 0.008;
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging.current = false;
      setTimeout(() => {
        autoRotate.current = true;
      }, 1500);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeCluster]);

  return (
    <section className="an-galaxy-sec" id="knowledge-galaxy">
      <div className="an-galaxy__container">
        {/* ── Section Header ── */}
        <div className="an-galaxy__header">
          <div className="an-galaxy__pill">
            <Orbit size={13} />
            <span>3D Multi-Dimensional Retrieval</span>
          </div>
          <h2 className="an-galaxy__title">
            The multi-dimensional <span className="text-gradient-cyan">knowledge sphere.</span>
          </h2>
          <p className="an-galaxy__desc">
            Drag to rotate the 3D embedding sphere. All papers, claims, and datasets are unified
            into a continuous high-dimensional vector space powered by ChromaDB.
          </p>
        </div>

        {/* ── Interactive 3D Sphere Box ── */}
        <div className="an-galaxy__box glass-panel">
          <div className="an-galaxy__top-bar">
            <div className="an-galaxy__status">
              <span className="an-dot an-dot--green" />
              <span>HNSW VECTOR TOPOLOGY · 384 DIMENSIONS · INTERACTIVE 3D MESH</span>
            </div>
            <span className="an-galaxy__hint">DRAG SPHERE TO ROTATE IN 3D</span>
          </div>

          <div className="an-galaxy__grid">
            {/* Left: 3D Canvas */}
            <div className="an-galaxy__canvas-col">
              <canvas ref={canvasRef} className="an-galaxy__canvas" />
            </div>

            {/* Right: Cluster Selector List */}
            <div className="an-galaxy__clusters-col">
              <span className="an-galaxy__col-tag">SEMANTIC CLUSTER SELECTION</span>
              <div className="an-galaxy__clusters-list">
                {CLUSTERS.map((c, idx) => {
                  const isSelected = idx === activeCluster;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      className={`an-cluster-item ${isSelected ? 'an-cluster-item--active' : ''}`}
                      onClick={() => {
                        setActiveCluster(idx);
                        sound.playClick();
                      }}
                      data-cursor-label="CLUSTER"
                    >
                      <div className="an-cluster-item__top">
                        <div className="an-cluster-item__name-row">
                          <span className="an-cluster-dot" style={{ backgroundColor: c.color }} />
                          <span className="an-cluster-item__name">{c.name}</span>
                        </div>
                        <span className="an-cluster-item__count">{c.count} Vectors</span>
                      </div>
                      <p className="an-cluster-item__desc">{c.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
