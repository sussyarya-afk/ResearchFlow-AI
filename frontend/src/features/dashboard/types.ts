export interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  documents: number;
  chats: number;
  status: "Active" | "Completed";
}

export interface StatItem {
  id: string;
  title: string;
  count: string;
  description: string;
}
