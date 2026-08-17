import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FolderKanban, FileText, ArrowRight } from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { favoritesManager, type FavoriteItem } from '@/utils/favorites';
import './FavoritesPage.css';

const TYPE_CONFIG = {
  project: { icon: <FolderKanban size={18} />, label: 'Project', color: 'var(--color-primary-400)' },
  document: { icon: <FileText size={18} />, label: 'Document', color: 'var(--color-accent-400)' },
};

export function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => favoritesManager.getFavorites());

  useEffect(() => {
    const updateFavorites = () => {
      setFavorites(favoritesManager.getFavorites());
    };
    window.addEventListener('rf_favorites_changed', updateFavorites);
    return () => window.removeEventListener('rf_favorites_changed', updateFavorites);
  }, []);

  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    favoritesManager.removeFavorite(id);
  };

  const handleOpen = (item: FavoriteItem) => {
    if (item.type === 'project') {
      navigate(`/workspace/${item.id}`);
    } else if (item.projectId) {
      navigate(`/workspace/${item.projectId}`);
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="rf-favorites-page animate-fade-in">
      <div className="rf-favorites-page__header">
        <div>
          <h1 className="rf-favorites-page__title">Favorites</h1>
          <p className="rf-favorites-page__subtitle">
            Quickly access your pinned projects and documents ({favorites.length} pinned).
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Star any project or document from the dashboard or projects page to pin it here for quick access."
          action={
            <Button onClick={() => navigate('/projects')} variant="primary">Browse Projects</Button>
          }
        />
      ) : (
        <div className="rf-favorites-page__grid">
          {favorites.map(fav => {
            const config = TYPE_CONFIG[fav.type] || TYPE_CONFIG.project;
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
                    <button
                      className="rf-fav-card__star"
                      aria-label="Remove from favorites"
                      onClick={(e) => handleRemoveFavorite(fav.id, e)}
                      title="Remove from favorites"
                    >
                      <Star size={14} fill="currentColor" />
                    </button>
                  </div>
                </div>
                <h3 className="rf-fav-card__name">{fav.name}</h3>
                <p className="rf-fav-card__desc">{fav.description || 'Pinned research item.'}</p>
                <div className="rf-fav-card__footer">
                  <span className="rf-fav-card__date">Pinned {fav.pinnedAt}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpen(fav)}
                    rightIcon={<ArrowRight size={13} />}
                  >
                    Open
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
