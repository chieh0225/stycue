import type { Metadata } from 'next';
import EmptyNotifications from './empty-notifications';

export const metadata: Metadata = {
  title: '通知 | StyCue',
};

export default function NotificationsPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#FDF7E9]">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-center border-b border-[#F0E4C0] bg-surface-soft px-4.5 pt-4 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <h1 className="text-[19px] font-bold tracking-[0.5px] text-text-primary">通知</h1>
      </header>

      <EmptyNotifications />
    </div>
  );
}
