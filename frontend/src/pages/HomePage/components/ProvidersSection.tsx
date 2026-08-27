import { useState } from 'react';
import { Cpu, Sparkles, Server, CheckCircle2, Lock } from 'lucide-react';
import './ProvidersSection.css';

interface ProviderCardData {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  model: string;
  specs: string[];
  icon: React.ReactNode;
  color: string;
  accentBg: string;
}

export function ProvidersSection() {
  const [selectedProvider, setSelectedProvider] = useState<string>('nvidia');

  const PROVIDERS: ProviderCardData[] = [
    {
      id: 'nvidia',
      name: 'NVIDIA NIM',
      badge: 'High-Throughput Acceleration',
      tagline: 'Enterprise-grade microservices for ultra-low latency inference.',
      model: 'meta/llama-3.3-70b-instruct',
      specs: [
        'Optimized TensorRT-LLM execution',
        'State-of-the-art multi-step reasoning',
        '70B parameter frontier capability',
        'Direct NIM API integration',
      ],
      icon: <Cpu size={24} />,
      color: '#76b900',
      accentBg: 'rgba(118, 185, 0, 0.08)',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      badge: 'Extreme Context & Speed',
      tagline: 'Massive multi-modal context with sub-second generation.',
      model: 'gemini-1.5-flash',
      specs: [
        '1M+ token context window support',
        'Instant multi-paper synthesis',
        'Native scientific formatting',
        'Low latency streaming tokens',
      ],
      icon: <Sparkles size={24} />,
      color: '#38bdf8',
      accentBg: 'rgba(56, 189, 248, 0.08)',
    },
    {
      id: 'ollama',
      name: 'Ollama Local LLM',
      badge: '100% Air-Gapped Privacy',
      tagline: 'Zero cloud dependencies. Run completely on-premises.',
      model: 'llama3 / mistral / qwen',
      specs: [
        'Complete local privacy compliance',
        'Offline air-gapped laboratory support',
        'Custom local hardware quantization',
        'Zero per-token cloud costs',
      ],
      icon: <Server size={24} />,
      color: '#c084fc',
      accentBg: 'rgba(192, 132, 252, 0.08)',
    },
  ];

  return (
    <section className="an-providers-sec" id="providers">
      <div className="an-providers__container">
        {/* ── Header ── */}
        <div className="an-providers__header">
          <div className="an-providers__pill">
            <Cpu size={13} />
            <span>Modular Provider Architecture</span>
          </div>
          <h2 className="an-providers__title">
            Choose your <span className="text-gradient-cyan">intelligence.</span>
          </h2>
          <p className="an-providers__desc">
            Switch seamlessly between cutting-edge accelerated cloud models and 100% private
            local LLMs. Your data stays under your control.
          </p>
        </div>

        {/* ── Provider 3-Card Grid ── */}
        <div className="an-providers__grid">
          {PROVIDERS.map((p) => {
            const isSelected = p.id === selectedProvider;
            return (
              <div
                key={p.id}
                className={`an-provider-card glass-panel ${isSelected ? 'an-provider-card--selected' : ''}`}
                onClick={() => setSelectedProvider(p.id)}
              >
                <div className="an-provider-card__top">
                  <div className="an-provider-card__icon" style={{ color: p.color, backgroundColor: p.accentBg }}>
                    {p.icon}
                  </div>
                  <span className="an-provider-card__badge" style={{ color: p.color, borderColor: `${p.color}40` }}>
                    {p.badge}
                  </span>
                </div>

                <h3 className="an-provider-card__name">{p.name}</h3>
                <p className="an-provider-card__tagline">{p.tagline}</p>

                <div className="an-provider-card__model-box">
                  <span className="an-provider-card__model-label">Default Model:</span>
                  <code className="an-provider-card__model-code">{p.model}</code>
                </div>

                <ul className="an-provider-card__specs">
                  {p.specs.map((spec) => (
                    <li key={spec} className="an-spec-item">
                      <CheckCircle2 size={13} color="var(--color-success)" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>

                <div className="an-provider-card__footer">
                  <span className="an-provider-card__status-dot" />
                  <span>Configurable in Settings</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Privacy & Guardrail Callout ── */}
        <div className="an-providers__callout glass-panel">
          <div className="an-providers__callout-content">
            <Lock size={20} color="#34d399" />
            <div>
              <h4 className="an-callout-title">Zero Data Retention & Self-Host Ready</h4>
              <p className="an-callout-desc">
                AgentNotebook AI does not train models on your uploaded research corpus.
                Switch to Ollama at any time for total air-gapped isolation in classified or clinical environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
