import React, { useState } from 'react';
import { apiClient } from '@/services/api';
import './SearchPanel.css';

interface SearchResult {
  chunk_id: string;
  document_id: string;
  page_start: number;
  page_end: number;
  similarity_score: number;
  text: string;
}

interface SearchPanelProps {
  projectId: string;
}

export function SearchPanel({ projectId }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(`/projects/${projectId}/search`, { query });
      setResults(response.results || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to perform search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rf-search-panel">
      <div className="rf-search-panel__header">
        <h2>Semantic Search</h2>
        <p>Find relevant text chunks across all documents in this project.</p>
      </div>

      <form className="rf-search-panel__form" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question or enter keywords..."
          className="rf-search-panel__input"
          disabled={loading}
        />
        <button type="submit" className="rf-search-panel__button" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="rf-search-panel__error">{error}</div>}

      <div className="rf-search-panel__results">
        {!loading && results.length === 0 && !error && query && (
          <div className="rf-search-panel__empty">No matches found.</div>
        )}
        
        {results.map((result, idx) => (
          <div key={result.chunk_id || idx} className="rf-search-panel__result-card">
            <div className="rf-search-panel__result-meta">
              <span className="rf-search-panel__result-score">
                {(result.similarity_score * 100).toFixed(1)}% Match
              </span>
              <span className="rf-search-panel__result-pages">
                Pages {result.page_start} - {result.page_end}
              </span>
            </div>
            <div className="rf-search-panel__result-text">
              {result.text}
            </div>
            <div className="rf-search-panel__result-doc-id">
              Document ID: {result.document_id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
