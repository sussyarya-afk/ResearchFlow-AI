const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'An error occurred during the request');
  }

  if (response.status === 204) {
    return null; // No content
  }

  return response.json();
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  get: (endpoint: string, options?: RequestInit) => 
    fetchWithAuth(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined) 
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) => 
    fetchWithAuth(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined) 
    }),
    
  delete: (endpoint: string, options?: RequestInit) => 
    fetchWithAuth(endpoint, { ...options, method: 'DELETE' }),

  // Auth
  login: (formData: FormData) => fetchWithAuth('/auth/login', { method: 'POST', body: formData }),
  demoLogin: () => fetchWithAuth('/auth/demo', { method: 'POST' }),
  register: (data: { email: string; password: string }) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchWithAuth('/auth/me', { method: 'GET' }),
  updateMe: (data: { email: string; password?: string }) => fetchWithAuth('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Notes
  getNotes: (projectId: string) => fetchWithAuth(`/projects/${projectId}/notes`, { method: 'GET' }),
  createNote: (projectId: string, content: string) => fetchWithAuth(`/projects/${projectId}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
  updateNote: (projectId: string, noteId: string, content: string) => fetchWithAuth(`/projects/${projectId}/notes/${noteId}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  deleteNote: (projectId: string, noteId: string) => fetchWithAuth(`/projects/${projectId}/notes/${noteId}`, { method: 'DELETE' }),

  // Documents
  getAllDocuments: () => fetchWithAuth('/documents', { method: 'GET' }),
  getDocumentPage: (documentId: string, page: number) => fetchWithAuth(`/documents/${documentId}/page/${page}`, { method: 'GET' }),
  getDocumentDownloadUrl: (documentId: string) => `${API_BASE_URL}/documents/${documentId}/download`,
  getDocumentFileUrl: (documentId: string) => `${API_BASE_URL}/documents/${documentId}/file`,

  // Settings
  getLLMSettings: () => fetchWithAuth('/settings/llm', { method: 'GET' }),
  setLLMProvider: (provider: string) => 
    fetchWithAuth('/settings/llm/provider', { 
      method: 'POST', 
      body: JSON.stringify({ provider }) 
    }),
  updateLLMConfig: (provider: string, keyOrUrl: string) =>
    fetchWithAuth('/settings/llm/config', {
      method: 'POST',
      body: JSON.stringify({ provider, key_or_url: keyOrUrl })
    }),
};
