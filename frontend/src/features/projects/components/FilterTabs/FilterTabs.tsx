import type { ProjectFilterOption } from '../../types';
import { FILTER_OPTIONS } from '../../constants';
import './FilterTabs.css';

interface FilterTabsProps {
  activeFilter: ProjectFilterOption;
  onChange: (filter: ProjectFilterOption) => void;
  counts: Record<ProjectFilterOption, number>;
}

export function FilterTabs({ activeFilter, onChange, counts }: FilterTabsProps) {
  return (
    <div className="rf-filter-tabs" role="tablist" aria-label="Filter projects">
      {FILTER_OPTIONS.map((filter) => (
        <button
          key={filter}
          role="tab"
          aria-selected={activeFilter === filter}
          className={`rf-filter-tabs__tab ${activeFilter === filter ? 'rf-filter-tabs__tab--active' : ''}`}
          onClick={() => onChange(filter)}
          id={`filter-tab-${filter.toLowerCase()}`}
        >
          {filter}
          <span className="rf-filter-tabs__count">{counts[filter]}</span>
        </button>
      ))}
    </div>
  );
}
