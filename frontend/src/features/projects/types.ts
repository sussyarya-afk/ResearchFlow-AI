export type ProjectStatus = 'Active' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  updatedAtTimestamp: number;
  documents: number;
  chats: number;
  status: ProjectStatus;
}

export type ProjectFilterOption = 'All' | 'Active' | 'Completed';
export type ProjectSortOption = 'Recently Updated' | 'Name';
