import type { Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    name: 'Quantum Computing Optimization',
    description: 'Analyzing recent breakthroughs in error correction for superconducting qubits.',
    updatedAt: '2 hours ago',
    updatedAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    documents: 24,
    chats: 12,
    status: 'Active',
  },
  {
    id: 'proj_2',
    name: 'Climate Change Models 2026',
    description: 'Synthesizing IPCC reports and recent climate modeling papers.',
    updatedAt: '1 day ago',
    updatedAtTimestamp: Date.now() - 24 * 60 * 60 * 1000,
    documents: 86,
    chats: 45,
    status: 'Active',
  },
  {
    id: 'proj_3',
    name: 'LLM Context Windows',
    description: 'Literature review on infinite context scaling architectures.',
    updatedAt: '3 days ago',
    updatedAtTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    documents: 15,
    chats: 8,
    status: 'Completed',
  },
  {
    id: 'proj_4',
    name: 'CRISPR Cas9 Off-target Effects',
    description: 'Evaluating precision of recent gene editing techniques in vivo.',
    updatedAt: '1 week ago',
    updatedAtTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    documents: 42,
    chats: 19,
    status: 'Active',
  },
  {
    id: 'proj_5',
    name: 'Solid State Batteries',
    description: 'Material science review for next-gen EV power storage solutions.',
    updatedAt: '2 weeks ago',
    updatedAtTimestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    documents: 110,
    chats: 53,
    status: 'Completed',
  }
];
