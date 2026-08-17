import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Zap, Plus, Activity, Play, Settings, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge, Input } from '@/components/ui';
import './AgentsPage.css';

interface AgentItem {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Paused';
  runs: number;
  lastRun: string;
}

const INITIAL_AGENTS: AgentItem[] = [
  {
    id: 'agent_1',
    name: 'Literature Scout',
    description: 'Automatically discovers, indexes, and summarizes relevant papers from open-access scientific repositories.',
    status: 'Active',
    runs: 142,
    lastRun: '10 mins ago',
  },
  {
    id: 'agent_2',
    name: 'Citation Linker',
    description: 'Maps multi-hop citation networks and validates claims against empirical findings in indexed documents.',
    status: 'Active',
    runs: 89,
    lastRun: '1 hour ago',
  },
  {
    id: 'agent_3',
    name: 'Hypothesis Generator',
    description: 'Synthesizes open research questions, methodological limitations, and proposals for follow-up experimentation.',
    status: 'Active',
    runs: 45,
    lastRun: 'Yesterday',
  },
  {
    id: 'agent_4',
    name: 'Statistical Evaluator',
    description: 'Verifies sample sizes, p-values, confidence intervals, and statistical significance reported in results sections.',
    status: 'Paused',
    runs: 28,
    lastRun: '3 days ago',
  },
];

export function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentItem[]>(INITIAL_AGENTS);
  const [activeModal, setActiveModal] = useState<'create' | 'config' | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDesc, setNewAgentDesc] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const toggleAgentStatus = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Active' ? 'Paused' : 'Active';
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    const newAgent: AgentItem = {
      id: `agent_${Date.now()}`,
      name: newAgentName.trim(),
      description: newAgentDesc.trim() || 'Custom autonomous research agent workflow.',
      status: 'Active',
      runs: 0,
      lastRun: 'Just now',
    };

    setAgents(prev => [newAgent, ...prev]);
    setNewAgentName('');
    setNewAgentDesc('');
    setActiveModal(null);
    setSuccessToast(`Created new agent "${newAgent.name}"!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleLaunchInWorkspace = (agent: AgentItem) => {
    navigate(`/projects?agent=${encodeURIComponent(agent.name)}`);
  };

  return (
    <div className="rf-agents-page animate-fade-in">
      <div className="rf-agents-page__header">
        <div className="rf-agents-page__header-info">
          <h1 className="rf-agents-page__title">AI Agents</h1>
          <p className="rf-agents-page__subtitle">
            Autonomous research assistants that operate over your indexed literature.
          </p>
        </div>
        <Button onClick={() => setActiveModal('create')} leftIcon={<Plus size={16} />} variant="accent">
          New Agent
        </Button>
      </div>

      {successToast && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 16px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      <div className="rf-agents-page__stats">
        <div className="rf-agents-page__stat">
          <Activity size={16} />
          <span>{agents.filter(a => a.status === 'Active').length} Active</span>
        </div>
        <div className="rf-agents-page__stat">
          <Zap size={16} />
          <span>{agents.reduce((s, a) => s + a.runs, 0)} Total Runs</span>
        </div>
      </div>

      <div className="rf-agents-page__grid">
        {agents.map(agent => (
          <Card key={agent.id} variant="glass" padding="md" hoverable className="rf-agent-card">
            <div className="rf-agent-card__header">
              <div className="rf-agent-card__icon">
                <Bot size={20} />
              </div>
              <Badge variant={agent.status === 'Active' ? 'success' : 'default'}>
                {agent.status}
              </Badge>
            </div>
            <h3 className="rf-agent-card__name">{agent.name}</h3>
            <p className="rf-agent-card__desc">{agent.description}</p>
            <div className="rf-agent-card__meta">
              <span>{agent.runs} runs</span>
              <span>·</span>
              <span>Last run {agent.lastRun}</span>
            </div>
            <div className="rf-agent-card__actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedAgent(agent); setActiveModal('config'); }}
                leftIcon={<Settings size={13} />}
              >
                Configure
              </Button>
              <Button
                variant={agent.status === 'Active' ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => toggleAgentStatus(agent.id)}
              >
                {agent.status === 'Active' ? 'Pause' : 'Resume'}
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => handleLaunchInWorkspace(agent)}
                leftIcon={<Play size={12} fill="currentColor" />}
              >
                Run
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Create Agent Modal ── */}
      {activeModal === 'create' && (
        <div className="rf-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          <div className="rf-create-project-modal animate-scale-in">
            <div className="rf-create-project-modal__header">
              <div className="rf-create-project-modal__title-group">
                <div className="rf-create-project-modal__icon-badge">
                  <Bot size={20} />
                </div>
                <div>
                  <h2 className="rf-create-project-modal__title">Create Autonomous AI Agent</h2>
                  <p className="rf-create-project-modal__subtitle">Configure an assistant with custom research focus and goals</p>
                </div>
              </div>
              <button className="rf-create-project-modal__close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAgent} className="rf-create-project-modal__form">
              <Input
                label="Agent Name"
                placeholder="e.g. Methodology Auditor"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                fullWidth
                required
                autoFocus
              />
              <div className="rf-form-field">
                <label className="rf-form-label">Mission & Capabilities</label>
                <textarea
                  className="rf-textarea"
                  rows={3}
                  placeholder="Specify what this agent should analyze across your indexed documents..."
                  value={newAgentDesc}
                  onChange={(e) => setNewAgentDesc(e.target.value)}
                />
              </div>
              <div className="rf-create-project-modal__footer">
                <Button variant="ghost" type="button" onClick={() => setActiveModal(null)}>Cancel</Button>
                <Button variant="accent" type="submit" leftIcon={<Sparkles size={16} />}>Create Agent</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Configure Agent Modal ── */}
      {activeModal === 'config' && selectedAgent && (
        <div className="rf-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null); }}>
          <div className="rf-create-project-modal animate-scale-in">
            <div className="rf-create-project-modal__header">
              <div className="rf-create-project-modal__title-group">
                <div className="rf-create-project-modal__icon-badge">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="rf-create-project-modal__title">Configure {selectedAgent.name}</h2>
                  <p className="rf-create-project-modal__subtitle">Adjust execution parameters and triggers</p>
                </div>
              </div>
              <button className="rf-create-project-modal__close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="rf-create-project-modal__form">
              <Input
                label="Execution Schedule"
                defaultValue="On Document Upload + On Demand"
                fullWidth
              />
              <Input
                label="Temperature"
                type="number"
                defaultValue="0.2"
                fullWidth
              />
              <Input
                label="Maximum Citations per Response"
                type="number"
                defaultValue="5"
                fullWidth
              />
              <div className="rf-create-project-modal__footer">
                <Button variant="primary" type="button" onClick={() => {
                  setActiveModal(null);
                  setSuccessToast(`Saved configuration for ${selectedAgent.name}`);
                  setTimeout(() => setSuccessToast(null), 3000);
                }}>
                  Save Configuration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
