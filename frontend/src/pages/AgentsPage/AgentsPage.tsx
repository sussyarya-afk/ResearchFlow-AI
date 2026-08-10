import { Bot, Zap, Plus, Activity } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import './AgentsPage.css';

const MOCK_AGENTS = [
  {
    id: 'agent_1',
    name: 'Literature Scout',
    description: 'Automatically discovers and summarizes relevant papers from arXiv, PubMed, and Semantic Scholar.',
    status: 'Active' as const,
    runs: 142,
    lastRun: '2 hours ago',
  },
  {
    id: 'agent_2',
    name: 'Citation Linker',
    description: 'Maps citation networks and identifies key references across your uploaded documents.',
    status: 'Active' as const,
    runs: 89,
    lastRun: '1 day ago',
  },
  {
    id: 'agent_3',
    name: 'Hypothesis Generator',
    description: 'Generates novel research hypotheses based on gaps identified in the literature.',
    status: 'Paused' as const,
    runs: 34,
    lastRun: '3 days ago',
  },
];

export function AgentsPage() {
  return (
    <div className="rf-agents-page animate-fade-in">
      <div className="rf-agents-page__header">
        <div className="rf-agents-page__header-info">
          <h1 className="rf-agents-page__title">AI Agents</h1>
          <p className="rf-agents-page__subtitle">
            Autonomous research assistants that work in the background.
          </p>
        </div>
        <Button>
          <Plus size={18} />
          New Agent
        </Button>
      </div>

      <div className="rf-agents-page__stats">
        <div className="rf-agents-page__stat">
          <Activity size={16} />
          <span>{MOCK_AGENTS.filter(a => a.status === 'Active').length} Active</span>
        </div>
        <div className="rf-agents-page__stat">
          <Zap size={16} />
          <span>{MOCK_AGENTS.reduce((s, a) => s + a.runs, 0)} Total Runs</span>
        </div>
      </div>

      <div className="rf-agents-page__grid">
        {MOCK_AGENTS.map(agent => (
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
              <Button variant="ghost" size="sm">Configure</Button>
              <Button variant="secondary" size="sm">
                {agent.status === 'Active' ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
