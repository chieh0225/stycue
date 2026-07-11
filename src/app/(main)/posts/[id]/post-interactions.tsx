'use client';

import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PostInteractions({
  postId,
  initialLikes,
  comments,
}: {
  postId: string;
  initialLikes: number;
  comments: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarked, setBookmarked] = useState(false);

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikes((prev) => prev + (next ? 1 : -1));
    // Mock write — replace with the real posts API once it exists.
    void fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked: next }),
    }).catch(() => {});
  }

  function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    void fetch(`/api/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked: next }),
    }).catch(() => {});
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
      <Link href={`/posts/${postId}/comments`} className="flex items-center gap-1.5">
        <MessageCircle className="h-5 w-5" />
        <span className="sr-only">留言</span>
        <span className="text-label-md">{comments}</span>
      </Link>
      <button
        type="button"
        onClick={toggleBookmark}
        aria-label="收藏"
        aria-pressed={bookmarked}
        className={`ml-auto ${bookmarked ? 'text-accent-amber' : ''}`}
      >
        <Bookmark fill={bookmarked ? 'currentColor' : 'none'} className="h-5 w-5" />
      </button>
    </div>
  );
}
