'use client';

import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { likeCommission, unlikeCommission } from '@/lib/like-api';
import { useFavoriteToggle } from './use-favorite-toggle';

export default function PostInteractions({
  postId,
  initialLikes,
  initialLiked,
  initialFavorites,
  initialFavorited,
  comments,
  isLoggedIn,
}: {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
  initialFavorites: number;
  initialFavorited: boolean;
  comments: number;
  isLoggedIn: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const { isFavorited, toggleFavorite } = useFavoriteToggle(
    postId,
    initialFavorited,
    initialFavorites,
    isLoggedIn,
  );

  async function toggleLike() {
    if (!isLoggedIn) {
      toast('請先登入才能按讚');
      return;
    }
    const wasLiked = liked;
    const next = !wasLiked;
    setLiked(next);
    setLikes((prev) => prev + (next ? 1 : -1));

    const result = wasLiked ? await unlikeCommission(postId) : await likeCommission(postId);
    if (!result.success || !result.data) {
      // Roll back the optimistic update on failure.
      setLiked(wasLiked);
      setLikes((prev) => prev + (wasLiked ? 1 : -1));
      return;
    }
    // Reconcile with the backend's authoritative state (e.g. a duplicate
    // like/unlike is a no-op there, not a count change).
    setLiked(result.data.isLiked);
    setLikes(result.data.likeCount);
  }

  return (
    <div className="flex items-center gap-5.5 text-text-primary">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        className={`flex items-center gap-1.5 ${liked ? 'text-accent-amber' : ''}`}
      >
        <Heart fill={liked ? 'currentColor' : 'none'} className="h-5 w-5" />
        <span className="sr-only">讚</span>
        <span className="text-label-md">{likes}</span>
      </button>
      <Link href={`/posts/commissions/${postId}/comments`} className="flex items-center gap-1.5">
        <MessageCircle className="h-5 w-5" />
        <span className="sr-only">留言</span>
        <span className="text-label-md">{comments}</span>
      </Link>
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label="收藏"
        aria-pressed={isFavorited}
        className={`ml-auto ${isFavorited ? 'text-accent-amber' : ''}`}
      >
        <Bookmark fill={isFavorited ? 'currentColor' : 'none'} className="h-5 w-5" />
      </button>
    </div>
  );
}
