import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown } from 'lucide-react';
import { ProjectHeader } from '@/features/projects/components/ProjectHeader';
import { SearchBar } from '@/features/projects/components/SearchBar';
import { FilterTabs } from '@/features/projects/components/FilterTabs';
import { ProjectsList } from '@/features/projects/components/ProjectsList';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal/CreateProjectModal';
import { useProjects } from '@/features/projects/hooks';
import { SORT_OPTIONS } from '@/features/projects/constants';
import { Loader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/ui/ErrorState';
import './ProjectsPage.css';

export function ProjectsPage() {
  const [searchParams] = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const {
    projects,
    totalCount,
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
    refreshProjects,
  } = useProjects();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams, setSearchQuery]);

  const isFiltered = searchQuery.trim() !== '' || filter !== 'All';

  if (error) {
    return (
      <div className="rf-projects-page animate-fade-in">
        <ErrorState 
          title="Failed to Load Projects" 
          message={error}
          retryLabel="Retry"
          onRetry={refreshProjects}
        />
      </div>
    );
  }

  return (
    <div className="rf-projects-page animate-fade-in">
      {/* ── Header ── */}
      <ProjectHeader count={totalCount} onNewProject={() => setCreateModalOpen(true)} />

      {/* ── Toolbar: Search + Tabs + Sort ── */}
      <div className="rf-projects-page__toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search projects by name or description..."
        />

        <FilterTabs
          activeFilter={filter}
          onChange={setFilter}
          counts={filterCounts}
        />

        <div className="rf-projects-page__sort">
          <ArrowUpDown size={14} className="rf-projects-page__sort-icon" aria-hidden="true" />
          <select
            id="projects-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rf-projects-page__sort-select"
            aria-label="Sort projects"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results count (when filtered) ── */}
      {isFiltered && !loading && (
        <p className="rf-projects-page__result-count">
          {projects.length} result{projects.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* ── Projects Grid ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader size="lg" label="Loading projects..." />
        </div>
      ) : (
        <ProjectsList
          projects={projects}
          isFiltered={isFiltered}
          onClearFilters={clearFilters}
          onProjectUpdated={refreshProjects}
          onNewProject={() => setCreateModalOpen(true)}
        />
      )}

      {/* ── Create Project Modal ── */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={() => {
          setCreateModalOpen(false);
          refreshProjects();
        }}
      />
    </div>
  );
}
