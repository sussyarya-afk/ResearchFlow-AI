import { Search } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="rf-search-bar">
      <Search className="rf-search-bar__icon" size={16} aria-hidden="true" />
      <input
        id="projects-search"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rf-search-bar__input"
        aria-label="Search projects"
        autoComplete="off"
      />
      {value && (
        <button
          className="rf-search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
