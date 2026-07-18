'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { favoritePost, unfavoritePost } from '@/lib/favorite-api';

// Same as posts/commissions/[id]/use-favorite-toggle.ts, kept as its own
// copy per the share-post convention (see plan notes).
export function useFavoriteToggle(
  postId: string,
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

    const result = wasFavorited ? await unfavoritePost(postId) : await favoritePost(postId);
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
