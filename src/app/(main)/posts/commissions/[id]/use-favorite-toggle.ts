'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { favoriteCommission, unfavoriteCommission } from '@/lib/favorite-api';

// Mirrors post-interactions.tsx's inline toggleLike (optimistic update,
// rollback on failure, reconcile with the backend's authoritative state) as a
// reusable hook so a future favorite button just calls toggleFavorite().
export function useFavoriteToggle(
  commissionId: string,
  initialFavorited: boolean,
  initialCount: number,
  isLoggedIn: boolean,
) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);

  async function toggleFavorite() {
    if (!isLoggedIn) {
      toast('請先登入才能收藏');
      return;
    }
    const wasFavorited = isFavorited;
    const next = !wasFavorited;
    setIsFavorited(next);
    setFavoriteCount((prev) => prev + (next ? 1 : -1));

    const result = wasFavorited
      ? await unfavoriteCommission(commissionId)
      : await favoriteCommission(commissionId);
    if (!result.success || !result.data) {
      setIsFavorited(wasFavorited);
      setFavoriteCount((prev) => prev + (wasFavorited ? 1 : -1));
      return;
    }
    setIsFavorited(result.data.isFavorited);
    setFavoriteCount(result.data.favoriteCount);
  }

  return { isFavorited, favoriteCount, toggleFavorite };
}
