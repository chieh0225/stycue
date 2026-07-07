'use client';

import Link from 'next/link';
import { useState } from 'react';

function HeartIcon({ filled, className = 'h-5 w-5' }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function CommentIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3 20l1.1-4a8.4 8.4 0 0 1-1-4A8.38 8.38 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5Z" />
    </svg>
  );
}

function BookmarkIcon({ filled, className = 'h-5 w-5' }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </svg>
  );
}

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
    <div className="flex items-center gap-[22px] text-text-primary">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        className={`flex items-center gap-1.5 ${liked ? 'text-accent-amber' : ''}`}
      >
        <HeartIcon filled={liked} />
        <span className="sr-only">讚</span>
        <span className="text-[15px]">{likes}</span>
      </button>
      <Link href={`/posts/${postId}/comments`} className="flex items-center gap-1.5">
        <CommentIcon />
        <span className="sr-only">留言</span>
        <span className="text-[15px]">{comments}</span>
      </Link>
      <button
        type="button"
        onClick={toggleBookmark}
        aria-label="收藏"
        aria-pressed={bookmarked}
        className={`ml-auto ${bookmarked ? 'text-accent-amber' : ''}`}
      >
        <BookmarkIcon filled={bookmarked} className="h-5 w-5" />
      </button>
    </div>
  );
}
