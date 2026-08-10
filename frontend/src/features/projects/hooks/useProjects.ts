import { useState, useMemo, useEffect } from 'react';
import type { Project, ProjectFilterOption, ProjectSortOption } from '../types';
import { projectService } from '../services/projectService';

export function useProjects() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ProjectFilterOption>('All');
  const [sort, setSort] = useState<ProjectSortOption>('Recently Updated');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects();
      setProjectsData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  /** Per-tab counts, always computed against the full dataset ignoring filter but respecting search */
  const filterCounts = useMemo<Record<ProjectFilterOption, number>>(() => {
    const base = searchQuery.trim()
      ? projectsData.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : projectsData;

    return {
      All: base.length,
      Active: base.filter(p => p.status === 'Active').length,
      Completed: base.filter(p => p.status === 'Completed').length,
    };
  }, [searchQuery, projectsData]);

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projectsData];

    // 1. Filter by status
    if (filter !== 'All') {
      result = result.filter(project => project.status === filter);
    }

    // 2. Filter by search query
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(project =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sort === 'Recently Updated') {
        return b.updatedAtTimestamp - a.updatedAtTimestamp;
      } else if (sort === 'Name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [searchQuery, filter, sort, projectsData]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('All');
    setSort('Recently Updated');
  };

  return {
    projects: filteredAndSortedProjects,
    totalCount: projectsData.length,
    filterCounts,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    sort,
    setSort,
    clearFilters,
    loading,
    error,
    refreshProjects: fetchProjects
  };
}
