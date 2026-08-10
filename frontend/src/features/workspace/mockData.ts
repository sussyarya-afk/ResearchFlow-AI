import type {
  ChatMessage,
  WorkspaceDocument,
  Citation,
  WorkspaceProject,
} from './types';

// ── Project ───────────────────────────────────────────────────
export const MOCK_PROJECT: WorkspaceProject = {
  id: 'proj_1',
  name: 'Quantum Computing Optimization',
  description: 'Analyzing recent breakthroughs in error correction for superconducting qubits.',
  status: 'Active',
  documentCount: 24,
  chatCount: 12,
  updatedAt: '2 hours ago',
};

// ── Documents ─────────────────────────────────────────────────
export const MOCK_DOCUMENTS: WorkspaceDocument[] = [
  {
    id: 'doc_1',
    name: 'Surface Codes — Error Correction.pdf',
    type: 'pdf',
    pages: 32,
    sizeLabel: '2.4 MB',
    uploadedAt: '2 hours ago',
    thumbnailColor: 'linear-gradient(135deg, #3b7bf4, #6729d4)',
    status: 'Completed',
  },
  {
    id: 'doc_2',
    name: 'Superconducting Qubit Review 2025.pdf',
    type: 'pdf',
    pages: 58,
    sizeLabel: '5.1 MB',
    uploadedAt: '1 day ago',
    thumbnailColor: 'linear-gradient(135deg, #8b47f6, #3b7bf4)',
    status: 'Completed',
  },
  {
    id: 'doc_3',
    name: 'Fault Tolerant Quantum Gates.pdf',
    type: 'pdf',
    pages: 24,
    sizeLabel: '1.8 MB',
    uploadedAt: '3 days ago',
    thumbnailColor: 'linear-gradient(135deg, #22c55e, #3b82f6)',
    status: 'Completed',
  },
  {
    id: 'doc_4',
    name: 'Quantum Volume Benchmarks.pdf',
    type: 'pdf',
    pages: 16,
    sizeLabel: '980 KB',
    uploadedAt: '1 week ago',
    thumbnailColor: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    status: 'Completed',
  },
];

// ── Chat Messages ─────────────────────────────────────────────
export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    role: 'user',
    content: 'What are the main approaches to quantum error correction described in the uploaded papers?',
    timestamp: '10:24 AM',
  },
  {
    id: 'msg_2',
    role: 'ai',
    content:
      'Based on your uploaded documents, three main approaches to quantum error correction are discussed:\n\n**1. Surface Codes** — The most promising near-term approach. They require ~1,000 physical qubits per logical qubit but have high fault-tolerance thresholds (~1% error rate). The Fowler et al. paper provides an extensive lattice surgery implementation.\n\n**2. Concatenated Codes** — An older technique using recursive encoding. Less hardware-efficient than surface codes but easier to analyze theoretically.\n\n**3. Bosonic Codes** — Encode quantum information in harmonic oscillators (e.g., cat qubits, GKP states). IBM and AWS are actively pursuing this approach for potential hardware efficiency gains.\n\nThe consensus across your documents is that surface codes are closest to practical implementation with current NISQ hardware.',
    timestamp: '10:24 AM',
    hasTimeline: true,
  },
  {
    id: 'msg_3',
    role: 'user',
    content: 'What error rate threshold does the surface code approach require?',
    timestamp: '10:26 AM',
  },
  {
    id: 'msg_4',
    role: 'ai',
    content:
      'According to the **Surface Codes — Error Correction.pdf** (page 14), the surface code fault-tolerance threshold is approximately **~1% per gate operation**. Current leading hardware (Google Sycamore, IBM Eagle) achieves 0.1–0.5% two-qubit gate error rates, placing them within the threshold but requiring significant qubit overhead to achieve practical logical error rates below 10⁻¹².',
    timestamp: '10:26 AM',
    hasTimeline: true,
  },
];



// ── Citations ─────────────────────────────────────────────────
export const MOCK_CITATIONS: Citation[] = [
  {
    chunk_id: 'cit_1',
    document_id: 'doc_1',
    document_name: 'Surface Codes — Error Correction.pdf',
    page_start: 14,
    page_end: 14,
    excerpt:
      'The fault-tolerance threshold for the surface code is approximately 1% per gate operation under independent depolarizing noise models.',
    similarity: 0.96,
  },
  {
    chunk_id: 'cit_2',
    document_id: 'doc_2',
    document_name: 'Superconducting Qubit Review 2025.pdf',
    page_start: 27,
    page_end: 27,
    excerpt:
      'Leading superconducting platforms now achieve two-qubit gate fidelities of 99.5–99.9%, approaching the surface code threshold.',
    similarity: 0.88,
  },
  {
    chunk_id: 'cit_3',
    document_id: 'doc_3',
    document_name: 'Fault Tolerant Quantum Gates.pdf',
    page_start: 8,
    page_end: 9,
    excerpt:
      'Resource estimation indicates ~1,000 physical qubits per logical qubit at the surface code threshold, requiring millions of physical qubits for practical computation.',
    similarity: 0.74,
  },
];
