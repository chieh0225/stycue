import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '通知 | StyleCue',
};

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.8 5.6L19.4 9l-5.6 1.8L12 16.4l-1.8-5.6L4.6 9l5.6-1.4z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </svg>
  );
}

export default function NotificationsPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#FDF7E9]">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-center border-b border-[#F0E4C0] bg-surface-soft px-4.5 pt-4 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <h1 className="text-[19px] font-bold tracking-[0.5px] text-text-primary">通知</h1>
      </header>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-20">
        <div className="relative mb-7 flex h-45 w-45 items-center justify-center">
          {/* Backdrop circle */}
          <div className="absolute inset-0 rounded-full bg-[#F3E8C8]" />

          {/* Decorative accents */}
          <SparkleIcon className="absolute -top-1 left-1 h-5.5 w-5.5 text-support-sage" />
          <div className="absolute top-9 left-18.5 h-1 w-1 rounded-full bg-accent-amber" />
          <div className="absolute bottom-11.5 left-4 h-2.25 w-2.25 rounded-full border-[1.5px] border-accent-amber" />
          <div className="absolute right-8.5 bottom-5.5 h-1.25 w-1.25 rounded-full bg-accent-amber" />

          {/* Notification card skeleton */}
          <div className="absolute flex h-20.5 w-58 items-center gap-3 rounded-xl bg-surface-base px-4 py-3.5 shadow-[0_10px_24px_rgba(64,58,50,0.14)]">
            <div className="h-13.5 w-13.5 shrink-0 rounded-xl bg-[#E5DDBF]" />
            <div className="flex flex-1 flex-col gap-1.75">
              <div className="h-1.75 w-full rounded-[3px] bg-[#E5DDBF]" />
              <div className="h-1.75 w-[65%] rounded-[3px] bg-[#E5DDBF]" />
              <div className="h-1.75 w-[65%] rounded-[3px] bg-[#E5DDBF]" />
            </div>
          </div>

          {/* Search badge */}
          <div className="absolute -right-4.5 bottom-4.5 flex h-12 w-12 items-center justify-center rounded-full bg-[#835500] text-surface-base shadow-[0_4px_10px_rgba(131,85,0,0.3)]">
            <SearchIcon className="h-5.5 w-5.5" />
          </div>
        </div>

        <p className="mt-2 text-lg font-bold text-text-primary">沒有通知</p>
      </div>
    </div>
  );
}
