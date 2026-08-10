/**
 * Projects service layer.
 *
 * Currently wraps mock data only.
 * Replace these functions with real API calls when the backend is ready.
 */

import { MOCK_PROJECTS } from '../mockData';
import type { Project } from '../types';

/**
 * Returns all projects.
 * Future: GET /api/projects
 */
export async function fetchProjects(): Promise<Project[]> {
  return Promise.resolve([...MOCK_PROJECTS]);
}

/**
 * Returns a single project by ID.
 * Future: GET /api/projects/:id
 */
export async function fetchProjectById(id: string): Promise<Project | undefined> {
  return Promise.resolve(MOCK_PROJECTS.find(p => p.id === id));
}
