import Link from 'next/link';

function UserIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function ChevronRightIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

// Bottom bar on the commission post detail page. It is deliberately NOT styled
// like the composer's input pill: no text field, no send/attach buttons — just a
// prompt and a trailing chevron, so it reads unmistakably as an entry that opens
// the full comments list (where typing and the outfit template actually live).
export default function CommentLauncher({ postId }: { postId: string }) {
  return (
    <Link
      href={`/posts/${postId}/comments`}
      aria-label="查看並加入留言討論"
      className="sticky bottom-0 z-10 flex items-center gap-2.5 border-t border-border-default bg-surface-base px-4.5 py-3.5"
    >
      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
        <UserIcon className="h-4 w-4" />
      </div>
      <span className="min-w-0 flex-1 truncate text-[13.5px] text-text-muted">
        查看並加入留言討論…
      </span>
      <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-text-primary" />
    </Link>
  );
}
