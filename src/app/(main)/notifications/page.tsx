import type { Metadata } from 'next';
import { TopBar } from '@/components/ui/top-bar';
import EmptyNotifications from './empty-notifications';

export const metadata: Metadata = {
  title: '通知 | StyCue',
};

export default function NotificationsPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#FDF7E9]">
      {/* Header */}
      <TopBar title="通知" className="py-4" />

      <EmptyNotifications />
    </div>
  );
}
