import { apiClient } from '../../../services/api';
import type { WorkspaceDocument } from '../types';

interface DocumentResponse {
  id: string;
  project_id: string;
  name: string;
  type: string;
  pages: number;
  size: number;
  s3_key: string | null;
  processing_status: string;
  processed_at: string | null;
  created_at: string;
  chunk_count: number | null;
}

const mapDocument = (doc: DocumentResponse): WorkspaceDocument => {
  let sizeLabel = '';
  if (doc.size < 1024) sizeLabel = `${doc.size} B`;
  else if (doc.size < 1024 * 1024) sizeLabel = `${(doc.size / 1024).toFixed(1)} KB`;
  else sizeLabel = `${(doc.size / (1024 * 1024)).toFixed(1)} MB`;

  return {
    id: doc.id,
    name: doc.name,
    type: (doc.type.includes('pdf') ? 'pdf' : 'txt') as any,
    pages: doc.pages,
    sizeLabel,
    uploadedAt: doc.created_at,
    thumbnailColor: '#FF5722', // placeholder color for PDF
    status: doc.processing_status,
    chunkCount: doc.chunk_count ?? undefined,
  };
};

export const documentService = {
  getProjectDocuments: async (projectId: string): Promise<WorkspaceDocument[]> => {
    const data = await apiClient.get(`/projects/${projectId}/documents`) as DocumentResponse[];
    return data.map(mapDocument);
  },

  uploadDocument: async (projectId: string, file: File): Promise<WorkspaceDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const data = await apiClient.post(`/projects/${projectId}/documents`, formData) as DocumentResponse;
    return mapDocument(data);
  },

  deleteDocument: async (projectId: string, documentId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/documents/${documentId}`);
  }
};

