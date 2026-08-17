import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { apiClient } from '@/services/api';
import { Cpu, RefreshCw, Server, Sparkles, Key, CheckCircle2, AlertCircle } from 'lucide-react';
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

export function SettingsPage() {
  const [llmSettings, setLlmSettings] = useState<LLMSettingsState>({
    current_provider: 'gemini',
    current_model: 'gemini-1.5-flash',
    status: 'connected',
    providers: DEFAULT_PROVIDERS,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [switching, setSwitching] = useState<string | null>(null);

  // Config inputs
  const [configProvider, setConfigProvider] = useState<string>('gemini');
  const [configValue, setConfigValue] = useState<string>('');
  const [configSaving, setConfigSaving] = useState<boolean>(false);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  // Preferences
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('rf_theme') as 'dark' | 'light') || 'dark';
  });
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

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
      setLlmSettings((prev) => ({
        ...prev,
        current_provider: providerId,
        current_model: prev.providers.find((p) => p.id === providerId)?.model || prev.current_model,
      }));
    } finally {
      setSwitching(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configValue.trim()) return;

    setConfigSaving(true);
    setConfigSuccess(null);
    setConfigError(null);

    try {
      await apiClient.updateLLMConfig(configProvider, configValue.trim());
      setConfigSuccess(`Successfully updated configuration for ${configProvider.toUpperCase()}!`);
      setConfigValue('');
      await fetchLLMSettings();
      setTimeout(() => setConfigSuccess(null), 4000);
    } catch (err: any) {
      setConfigError(err?.message || 'Failed to update provider configuration.');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('rf_theme', newTheme);
  };

  const renderStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'connected':
        return (
          <span className="rf-status-badge rf-status-badge--connected">
            <span className="rf-status-badge__dot" />
            Connected & Ready
          </span>
        );
      case 'not_configured':
        return (
          <span className="rf-status-badge rf-status-badge--warning">
            <span className="rf-status-badge__dot" />
            Fallback Mode
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
                  Select which LLM provider handles your RAG pipeline queries (automatic grounded fallback active if credentials missing)
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

            {/* Dynamic API Key & URL Configuration */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Update API Key / Endpoint URL
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginBottom: '16px' }}>
                Configure your personal credentials dynamically at runtime without restarting the server.
              </p>

              {configSuccess && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 14px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontSize: 'var(--font-size-xs)', marginBottom: '16px' }}>
                  <CheckCircle2 size={16} />
                  <span>{configSuccess}</span>
                </div>
              )}

              {configError && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginBottom: '16px' }}>
                  <AlertCircle size={16} />
                  <span>{configError}</span>
                </div>
              )}

              <form onSubmit={handleSaveConfig} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="config-provider-select" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Provider</label>
                  <select
                    id="config-provider-select"
                    value={configProvider}
                    onChange={(e) => setConfigProvider(e.target.value)}
                    style={{ padding: '8px 12px', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)', outline: 'none' }}
                  >
                    <option value="gemini">Google Gemini API Key</option>
                    <option value="nvidia">NVIDIA NIM API Key</option>
                    <option value="ollama">Ollama Server Base URL</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <Input
                    label={configProvider === 'ollama' ? 'Server URL (e.g. http://localhost:11434)' : 'API Key'}
                    type={configProvider === 'ollama' ? 'text' : 'password'}
                    placeholder={configProvider === 'ollama' ? 'http://localhost:11434' : 'Paste API Key here...'}
                    value={configValue}
                    onChange={(e) => setConfigValue(e.target.value)}
                    fullWidth
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={configSaving || !configValue.trim()}
                  isLoading={configSaving}
                  leftIcon={<Key size={14} />}
                >
                  Save Config
                </Button>
              </form>
            </div>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card variant="glass" padding="lg">
          <div className="rf-settings-section">
            <div className="rf-settings-section__header">
              <h2 className="rf-settings-section__title">Appearance</h2>
              <p className="rf-settings-section__desc">Customize the look and feel of your workspace</p>
            </div>

            <div className="rf-settings-item">
              <span className="rf-settings-item__label">Theme Mode</span>
              <button
                className="rf-settings-toggle rf-settings-toggle--on"
                onClick={handleToggleTheme}
                aria-label="Toggle theme"
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary-400)' }}>
                  {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </span>
              </button>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card variant="glass" padding="lg">
          <div className="rf-settings-section">
            <div className="rf-settings-section__header">
              <h2 className="rf-settings-section__title">Notifications</h2>
              <p className="rf-settings-section__desc">Choose what you want to be notified about</p>
            </div>

            <div className="rf-settings-item">
              <span className="rf-settings-item__label">Email notifications</span>
              <button
                className={`rf-settings-toggle ${emailNotifs ? 'rf-settings-toggle--on' : ''}`}
                onClick={() => setEmailNotifs(!emailNotifs)}
                aria-label="Toggle Email notifications"
              >
                <span className="rf-settings-toggle__thumb" />
              </button>
            </div>

            <div className="rf-settings-item">
              <span className="rf-settings-item__label">Analysis complete alerts</span>
              <button
                className={`rf-settings-toggle ${alerts ? 'rf-settings-toggle--on' : ''}`}
                onClick={() => setAlerts(!alerts)}
                aria-label="Toggle Analysis complete alerts"
              >
                <span className="rf-settings-toggle__thumb" />
              </button>
            </div>

            <div className="rf-settings-item">
              <span className="rf-settings-item__label">Weekly digest</span>
              <button
                className={`rf-settings-toggle ${weeklyDigest ? 'rf-settings-toggle--on' : ''}`}
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                aria-label="Toggle Weekly digest"
              >
                <span className="rf-settings-toggle__thumb" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
