import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { apiClient } from '@/services/api';
import { Cpu, CheckCircle2, AlertCircle, RefreshCw, Server, Sparkles, ShieldAlert } from 'lucide-react';
import './SettingsPage.css';

interface ProviderOption {
  id: string;
  name: string;
  model: string;
  configured: boolean;
  status: 'connected' | 'not_configured' | 'error' | string;
  message?: string;
}

interface LLMSettingsState {
  current_provider: string;
  current_model: string;
  status: string;
  message?: string;
  providers: ProviderOption[];
}

const DEFAULT_PROVIDERS: ProviderOption[] = [
  { id: 'gemini', name: 'Gemini', model: 'gemini-1.5-flash', configured: true, status: 'connected' },
  { id: 'nvidia', name: 'NVIDIA', model: 'meta/llama-3.3-70b-instruct', configured: false, status: 'not_configured' },
  { id: 'ollama', name: 'Ollama', model: 'llama3', configured: false, status: 'not_configured' },
];

const SETTING_SECTIONS = [
  {
    title: 'Appearance',
    description: 'Customize the look and feel of your workspace',
    items: [
      { label: 'Theme', value: 'Dark', type: 'select' as const },
      { label: 'Compact mode', value: false, type: 'toggle' as const },
    ],
  },
  {
    title: 'Notifications',
    description: 'Choose what you want to be notified about',
    items: [
      { label: 'Email notifications', value: true, type: 'toggle' as const },
      { label: 'Analysis complete alerts', value: true, type: 'toggle' as const },
      { label: 'Weekly digest', value: false, type: 'toggle' as const },
    ],
  },
];

export function SettingsPage() {
  const [llmSettings, setLlmSettings] = useState<LLMSettingsState>({
    current_provider: 'gemini',
    current_model: 'gemini-1.5-flash',
    status: 'connected',
    providers: DEFAULT_PROVIDERS,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const fetchLLMSettings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getLLMSettings();
      if (data) {
        setLlmSettings(data);
      }
    } catch (err) {
      console.warn('Backend offline or settings unauthenticated, using local state fallback.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLLMSettings();
  }, []);

  const handleSelectProvider = async (providerId: string) => {
    if (providerId === llmSettings.current_provider) return;
    setSwitching(providerId);
    try {
      const updated = await apiClient.setLLMProvider(providerId);
      if (updated) {
        setLlmSettings(updated);
      } else {
        setLlmSettings((prev) => ({
          ...prev,
          current_provider: providerId,
          current_model: prev.providers.find((p) => p.id === providerId)?.model || prev.current_model,
        }));
      }
    } catch (err) {
      console.error('Failed to switch LLM provider via API:', err);
      // Fallback state mutation if backend offline
      setLlmSettings((prev) => ({
        ...prev,
        current_provider: providerId,
        current_model: prev.providers.find((p) => p.id === providerId)?.model || prev.current_model,
      }));
    } finally {
      setSwitching(null);
    }
  };

  const renderStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'connected':
        return (
          <span className="rf-status-badge rf-status-badge--connected">
            <span className="rf-status-badge__dot" />
            Connected
          </span>
        );
      case 'not_configured':
        return (
          <span className="rf-status-badge rf-status-badge--warning">
            <span className="rf-status-badge__dot" />
            Not Configured (Mock Fallback)
          </span>
        );
      case 'error':
        return (
          <span className="rf-status-badge rf-status-badge--error">
            <span className="rf-status-badge__dot" />
            Connection Error
          </span>
        );
      default:
        return (
          <span className="rf-status-badge rf-status-badge--neutral">
            <span className="rf-status-badge__dot" />
            {statusStr}
          </span>
        );
    }
  };

  const getProviderIcon = (id: string) => {
    switch (id) {
      case 'gemini':
        return <Sparkles className="rf-provider-card__icon rf-provider-card__icon--gemini" size={20} />;
      case 'nvidia':
        return <Cpu className="rf-provider-card__icon rf-provider-card__icon--nvidia" size={20} />;
      case 'ollama':
        return <Server className="rf-provider-card__icon rf-provider-card__icon--ollama" size={20} />;
      default:
        return <Cpu size={20} />;
    }
  };

  const currentProviderObj = llmSettings.providers.find((p) => p.id === llmSettings.current_provider) || {
    id: llmSettings.current_provider,
    name: llmSettings.current_provider.toUpperCase(),
    model: llmSettings.current_model,
    configured: true,
    status: llmSettings.status,
  };

  return (
    <div className="rf-settings-page animate-fade-in">
      <h1 className="rf-settings-page__title">Settings</h1>
      <p className="rf-settings-page__subtitle">
        Manage your application preferences and AI provider infrastructure
      </p>

      <div className="rf-settings-page__sections">
        {/* ── AI Provider Architecture Section ───────────────────────────── */}
        <Card variant="glass" padding="lg">
          <div className="rf-settings-section">
            <div className="rf-settings-section__header rf-settings-section__header--flex">
              <div>
                <h2 className="rf-settings-section__title">AI Provider Architecture</h2>
                <p className="rf-settings-section__desc">
                  Select which LLM provider handles your RAG pipeline queries
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchLLMSettings}
                disabled={loading}
                aria-label="Refresh Provider Status"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </Button>
            </div>

            {/* Current Active Summary Box */}
            <div className="rf-llm-active-summary">
              <div className="rf-llm-active-summary__info">
                <div className="rf-llm-active-summary__label">Active Provider</div>
                <div className="rf-llm-active-summary__value">
                  {currentProviderObj.name}
                </div>
              </div>

              <div className="rf-llm-active-summary__info">
                <div className="rf-llm-active-summary__label">Current Model</div>
                <code className="rf-llm-active-summary__model">{llmSettings.current_model}</code>
              </div>

              <div className="rf-llm-active-summary__info">
                <div className="rf-llm-active-summary__label">Connection Status</div>
                {renderStatusBadge(currentProviderObj.status || llmSettings.status)}
              </div>
            </div>

            {/* Provider Grid Selection */}
            <div className="rf-provider-grid">
              {llmSettings.providers.map((provider) => {
                const isSelected = provider.id === llmSettings.current_provider;
                const isSwitchingThis = switching === provider.id;

                return (
                  <button
                    key={provider.id}
                    type="button"
                    className={`rf-provider-card ${isSelected ? 'rf-provider-card--selected' : ''}`}
                    onClick={() => handleSelectProvider(provider.id)}
                    disabled={isSwitchingThis}
                  >
                    <div className="rf-provider-card__header">
                      <div className="rf-provider-card__title-group">
                        {getProviderIcon(provider.id)}
                        <span className="rf-provider-card__name">{provider.name}</span>
                      </div>
                      <div className="rf-provider-card__radio">
                        <span className={`rf-provider-card__radio-inner ${isSelected ? 'rf-provider-card__radio-inner--active' : ''}`} />
                      </div>
                    </div>

                    <div className="rf-provider-card__model-row">
                      <span className="rf-provider-card__model-label">Model:</span>
                      <code className="rf-provider-card__model-name">{provider.model}</code>
                    </div>

                    <div className="rf-provider-card__footer">
                      {renderStatusBadge(provider.status)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Existing Sections */}
        {SETTING_SECTIONS.map((section) => (
          <Card key={section.title} variant="glass" padding="lg">
            <div className="rf-settings-section">
              <div className="rf-settings-section__header">
                <h2 className="rf-settings-section__title">{section.title}</h2>
                <p className="rf-settings-section__desc">{section.description}</p>
              </div>

              {section.items.map((item) => (
                <div className="rf-settings-item" key={item.label}>
                  <span className="rf-settings-item__label">{item.label}</span>
                  {item.type === 'toggle' && (
                    <button
                      className={`rf-settings-toggle ${item.value ? 'rf-settings-toggle--on' : ''}`}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <span className="rf-settings-toggle__thumb" />
                    </button>
                  )}
                  {item.type === 'select' && (
                    <span className="rf-settings-item__value">{String(item.value)}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Danger Zone */}
        <Card variant="outlined" padding="lg">
          <div className="rf-settings-section">
            <div className="rf-settings-section__header">
              <h2 className="rf-settings-section__title rf-settings-section__title--danger">Danger Zone</h2>
              <p className="rf-settings-section__desc">Irreversible account actions</p>
            </div>
            <div className="rf-settings-section__danger-actions">
              <Button variant="danger" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
