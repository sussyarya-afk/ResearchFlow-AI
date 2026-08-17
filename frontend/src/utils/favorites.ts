export interface FavoriteItem {
  id: string;
  type: 'project' | 'document';
  name: string;
  description?: string;
  projectId?: string;
  pinnedAt: string;
}

const FAVORITES_KEY = 'rf_user_favorites';

export const favoritesManager = {
  getFavorites: (): FavoriteItem[] => {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite: (id: string): boolean => {
    const favs = favoritesManager.getFavorites();
    return favs.some(f => f.id === id);
  },

  toggleFavorite: (item: Omit<FavoriteItem, 'pinnedAt'>): boolean => {
    const favs = favoritesManager.getFavorites();
    const existingIndex = favs.findIndex(f => f.id === item.id);
    let updated: FavoriteItem[];
    let isNowFav: boolean;

    if (existingIndex >= 0) {
      updated = favs.filter(f => f.id !== item.id);
      isNowFav = false;
    } else {
      const newItem: FavoriteItem = {
        ...item,
        pinnedAt: 'Just now',
      };
      updated = [newItem, ...favs];
      isNowFav = true;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('rf_favorites_changed'));
    return isNowFav;
  },

  removeFavorite: (id: string): void => {
    const favs = favoritesManager.getFavorites();
    const updated = favs.filter(f => f.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('rf_favorites_changed'));
  },
};
