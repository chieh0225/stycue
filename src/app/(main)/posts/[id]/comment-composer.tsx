'use client';

import Link from 'next/link';
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

function ImageIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

export default function CommentComposer({
  onSubmit,
  templateHref,
}: {
  // The parent handles the optimistic UI update and persistence; the composer
  // just clears itself after handing off the text.
  onSubmit?: (text: string) => void;
  // When provided, a hint row + button is shown above the input linking to the
  // dedicated commission-comment template (text + tagged outfit images).
  templateHref?: string;
}) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  function submit() {
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setText('');
  }

  return (
    <footer className="sticky bottom-0 z-10 flex items-center gap-2.5 border-t border-border-default bg-surface-base px-4.5 py-3">
      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
        <UserIcon className="h-4 w-4" />
      </div>
      {/* Input pill — text field plus, when a template is available, an image
          button that opens the dedicated commission-comment template */}
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full border border-border-default bg-[#FDF7E9] pr-2 pl-4">
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
          placeholder={templateHref ? '加入討論，或附上圖片' : '加入討論...'}
          aria-label="加入討論"
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-[#B8AF9E] focus:outline-none"
        />
        {templateHref ? (
          <Link
            href={templateHref}
            aria-label="用穿搭推薦模板附上圖片"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-text-muted"
          >
            <ImageIcon className="h-[17px] w-[17px]" />
          </Link>
        ) : null}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!trimmed}
        aria-label="送出留言"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)] disabled:opacity-40"
      >
        <SendIcon />
      </button>
    </footer>
  );
}
