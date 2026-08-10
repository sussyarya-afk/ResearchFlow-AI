import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { FILTER_OPTIONS, SORT_OPTIONS } from '../../constants';
import type { ProjectFilterOption, ProjectSortOption } from '../../types';
import './ProjectsToolbar.css';

interface ProjectsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentFilter: ProjectFilterOption;
  onFilterChange: (filter: ProjectFilterOption) => void;
  currentSort: ProjectSortOption;
  onSortChange: (sort: ProjectSortOption) => void;
}

export function ProjectsToolbar({
  searchQuery,
  onSearchChange,
  currentFilter,
  onFilterChange,
  currentSort,
  onSortChange
}: ProjectsToolbarProps) {
  return (
    <div className="rf-projects-toolbar">
      <div className="rf-projects-toolbar__search">
        <Search className="rf-projects-toolbar__icon" size={18} />
        <input
          type="text"
          placeholder="Search projects by name or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rf-projects-toolbar__input"
        />
      </div>
      
      <div className="rf-projects-toolbar__actions">
        <div className="rf-projects-toolbar__select-wrapper">
          <Filter className="rf-projects-toolbar__select-icon" size={16} />
          <select 
            value={currentFilter}
            onChange={(e) => onFilterChange(e.target.value as ProjectFilterOption)}
            className="rf-projects-toolbar__select"
            aria-label="Filter projects"
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        
        <div className="rf-projects-toolbar__select-wrapper">
          <ArrowUpDown className="rf-projects-toolbar__select-icon" size={16} />
          <select 
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as ProjectSortOption)}
            className="rf-projects-toolbar__select"
            aria-label="Sort projects"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
