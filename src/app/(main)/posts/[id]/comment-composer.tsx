'use client';

import { useState } from 'react';

function UserIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function SendIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

export default function CommentComposer({
  postId,
  onSubmit,
}: {
  postId: string;
  // When provided, the parent handles the optimistic UI update; the composer
  // just clears itself and still fires the (mock) network write.
  onSubmit?: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const trimmed = text.trim();

  function submit() {
    if (!trimmed || submitting) return;
    const value = trimmed;
    setText('');
    onSubmit?.(value);
    setSubmitting(true);
    // Mock write — replace with the real comments API once it exists.
    void fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: value }),
    })
      .catch(() => {})
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <footer className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center gap-2.5 border-t border-border-default bg-surface-base px-4.5 py-3">
      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
        <UserIcon className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="加入討論..."
        aria-label="加入討論"
        className="h-10 flex-1 rounded-full border border-border-default bg-[#FDF7E9] px-4 text-[13.5px] text-text-primary placeholder:text-[#B8AF9E] focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!trimmed || submitting}
        aria-label="送出留言"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)] disabled:opacity-40"
      >
        <SendIcon />
      </button>
    </footer>
  );
}
