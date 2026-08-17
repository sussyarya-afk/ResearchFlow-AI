import { apiClient } from '@/services/api';
import type { Project, ProjectStatus } from '../types';

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

// Maps backend ProjectResponse to frontend Project
const mapProject = (data: any): Project => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    updatedAt: new Date(data.updated_at).toLocaleDateString(),
    updatedAtTimestamp: new Date(data.updated_at).getTime(),
    status: data.status as ProjectStatus,
    documents: data.document_count ?? 0,
    chats: data.chat_count ?? 0,
  };
};

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const data = await apiClient.get('/projects');
    return data.map(mapProject);
  },

  getProject: async (id: string): Promise<Project> => {
    const data = await apiClient.get(`/projects/${id}`);
    return mapProject(data);
  },

  createProject: async (projectIn: ProjectCreate): Promise<Project> => {
    const data = await apiClient.post('/projects', projectIn);
    return mapProject(data);
  },

  updateProject: async (id: string, projectIn: ProjectUpdate): Promise<Project> => {
    const data = await apiClient.put(`/projects/${id}`, projectIn);
    return mapProject(data);
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
