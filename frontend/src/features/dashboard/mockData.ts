import type { Project, StatItem } from './types';

export const MOCK_STATS: StatItem[] = [
  { id: '1', title: 'Total Projects', count: '12', description: '+3 from last month' },
  { id: '2', title: 'Uploaded Documents', count: '1,847', description: '+124 this week' },
  { id: '3', title: 'AI Chats', count: '432', description: '+56 this week' },
  { id: '4', title: 'AI Agents', count: '5', description: '2 currently active' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Quantum Computing Optimization',
    description: 'Analyzing recent breakthroughs in error correction for superconducting qubits.',
    updatedAt: '2 hours ago',
    documents: 24,
    chats: 12,
    status: 'Active',
  },
  {
    id: 'proj_2',
    name: 'Climate Change Models 2026',
    description: 'Synthesizing IPCC reports and recent climate modeling papers.',
    updatedAt: '1 day ago',
    documents: 86,
    chats: 45,
    status: 'Active',
  },
  {
    id: 'proj_3',
    name: 'LLM Context Windows',
    description: 'Literature review on infinite context scaling architectures.',
    updatedAt: '3 days ago',
    documents: 15,
    chats: 8,
    status: 'Completed',
  },
];

export const MOCK_CONTINUE_WORKING = {
  project: MOCK_PROJECTS[0],
  progress: 75,
};
