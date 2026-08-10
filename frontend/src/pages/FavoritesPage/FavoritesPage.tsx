import { Star, FolderKanban, FileText } from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import './FavoritesPage.css';

const MOCK_FAVORITES = [
  {
    id: 'fav_1',
    type: 'project' as const,
    name: 'Quantum Computing Optimization',
    description: 'Analyzing recent breakthroughs in error correction for superconducting qubits.',
    pinnedAt: '2 hours ago',
  },
  {
    id: 'fav_2',
    type: 'document' as const,
    name: 'IPCC AR6 WGI Summary for Policymakers.pdf',
    description: 'Key climate data document from the Climate Change Models 2026 project.',
    pinnedAt: '1 day ago',
  },
  {
    id: 'fav_3',
    type: 'project' as const,
    name: 'CRISPR Cas9 Off-target Effects',
    description: 'Evaluating precision of recent gene editing techniques in vivo.',
    pinnedAt: '1 week ago',
  },
];

const TYPE_CONFIG = {
  project: { icon: <FolderKanban size={18} />, label: 'Project', color: 'var(--color-primary-400)' },
  document: { icon: <FileText size={18} />, label: 'Document', color: 'var(--color-accent-400)' },
};

export function FavoritesPage() {
  return (
    <div className="rf-favorites-page animate-fade-in">
      <div className="rf-favorites-page__header">
        <div>
          <h1 className="rf-favorites-page__title">Favorites</h1>
          <p className="rf-favorites-page__subtitle">
            Quickly access your pinned projects and documents.
          </p>
        </div>
      </div>

      {MOCK_FAVORITES.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Star any project or document to pin it here for quick access."
        />
      ) : (
        <div className="rf-favorites-page__grid">
          {MOCK_FAVORITES.map(fav => {
            const config = TYPE_CONFIG[fav.type];
            return (
              <Card key={fav.id} variant="glass" padding="md" hoverable className="rf-fav-card">
                <div className="rf-fav-card__header">
                  <div
                    className="rf-fav-card__icon"
                    style={{ color: config.color, borderColor: `${config.color}30` }}
                  >
                    {config.icon}
                  </div>
                  <div className="rf-fav-card__badges">
                    <Badge variant="default">{config.label}</Badge>
                    <button className="rf-fav-card__star" aria-label="Remove from favorites">
                      <Star size={14} fill="currentColor" />
                    </button>
                  </div>
                </div>
                <h3 className="rf-fav-card__name">{fav.name}</h3>
                <p className="rf-fav-card__desc">{fav.description}</p>
                <div className="rf-fav-card__footer">
                  <span className="rf-fav-card__date">Pinned {fav.pinnedAt}</span>
                  <Button variant="ghost" size="sm">Open</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
