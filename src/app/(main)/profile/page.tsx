'use client';

import {
  Bookmark,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  LogOut,
  PencilLine,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { TopBar } from '@/components/ui/top-bar';
import { getPointWallet } from '@/lib/points-api';
import { cn } from '@/lib/utils';
import { clearAuthed, getAuthedUser } from '../../auth';
import { clearDraftState } from '../posts/commissions/new/draft';

export default function ProfilePage() {
  const router = useRouter();

  function handleLogout() {
    clearAuthed();
    clearDraftState();
    router.push('/login');
  }

  const [nickname] = useState(() => {
    try {
      return localStorage.getItem('stycue-profile-nickname') || getAuthedUser()?.nickName || '';
    } catch {
      return getAuthedUser()?.nickName || '';
    }
  });
  const [avatarUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('stycue-profile-avatar');
    } catch {
      return null;
    }
  });
  const avatarInitial = nickname.charAt(0).toUpperCase();

  const [points, setPoints] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    getPointWallet()
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) setPoints(res.data.currentPoints);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <TopBar title="個人" className="py-4" />

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto bg-muted">
        {/* Profile header */}
        <div className="flex items-center gap-3.5 px-4.5 pt-6 pb-5">
          <div className="relative flex h-17 w-17 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-background bg-primary shadow-[0_4px_12px_rgba(217,154,61,0.16)]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-headline-md font-bold text-gold-dark">{avatarInitial}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-headline-sm font-bold text-text-primary">{nickname}</div>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-gold-dark" strokeWidth={2} />
              <span className="text-label-md font-semibold text-gold-dark">查看個人主頁</span>
            </span>
          </div>
          <Link
            href="/profile/edit"
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
          >
            編輯個人資料
          </Link>
        </div>

        {/* Stats card */}
        <div className="mx-4.5 mb-6 flex items-center rounded-panel bg-popover px-3 py-4.5 shadow-card">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-headline-sm font-bold text-text-primary">{points ?? '—'}</span>
            <span className="text-label-md text-text-muted">積分</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-headline-sm font-bold text-text-primary">42</span>
            <span className="text-label-md text-text-muted">追蹤中</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-headline-sm font-bold text-text-primary">67</span>
            <span className="text-label-md text-text-muted">粉絲</span>
          </div>
        </div>

        {/* 個人功能 */}
        <div className="px-4.5 pb-2">
          <div className="mb-3.5 text-body-lg font-bold text-text-primary">個人功能</div>
          <div className="grid grid-cols-4 gap-2">
            <Link href="/profile/commissions/sent" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-panel bg-gold/12">
                <PencilLine width="21" height="21" className="text-gold-dark" strokeWidth={1.8} />
              </div>
              <span className="text-center text-label-md font-medium text-text-primary">
                我的委託
              </span>
            </Link>
            <Link href="/profile/posts" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-panel bg-gold/12">
                <ImageIcon width="21" height="21" className="text-gold-dark" strokeWidth={1.8} />
              </div>
              <span className="text-center text-label-md font-medium text-text-primary">
                我的分享文
              </span>
            </Link>
            <Link href="/profile/points/history" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-panel bg-gold/12">
                <Receipt width="21" height="21" className="text-gold-dark" strokeWidth={1.8} />
              </div>
              <span className="text-center text-label-md font-medium text-text-primary">
                積分紀錄
              </span>
            </Link>
            <Link href="/profile/favorites" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-panel bg-gold/12">
                <Bookmark width="21" height="21" className="text-gold-dark" strokeWidth={1.8} />
              </div>
              <span className="text-center text-label-md font-medium text-text-primary">
                我的收藏
              </span>
            </Link>
          </div>
        </div>

        {/* 支援 */}
        <div className="px-4.5 pt-6 pb-7">
          <div className="mb-1.5 text-body-lg font-bold text-text-primary">支援</div>
          <div className="overflow-hidden rounded-xl bg-popover">
            <Link
              href="/profile/settings"
              className="flex items-center justify-between border-b border-border-subtle px-4 py-3.75"
            >
              <span className="text-body-md text-text-primary">設定</span>
              <ChevronRight width="16" height="16" className="text-text-muted" strokeWidth={2} />
            </Link>
            <Link
              href="/disclaimer"
              className="flex items-center justify-between border-b border-border-subtle px-4 py-3.75"
            >
              <span className="text-body-md text-text-primary">免責聲明</span>
              <ChevronRight width="16" height="16" className="text-text-muted" strokeWidth={2} />
            </Link>
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3.75">
              <span className="text-body-md text-text-primary">問題回報</span>
              <ChevronRight width="16" height="16" className="text-text-muted" strokeWidth={2} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.75">
              <span className="text-body-md text-text-primary">版本</span>
              <span className="text-label-md text-text-tertiary">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4.5 pb-8">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-popover px-4 py-3.75"
          >
            <LogOut width="18" height="18" className="text-destructive" strokeWidth={1.8} />
            <span className="text-body-md font-semibold text-destructive">登出</span>
          </button>
        </div>
      </div>
    </div>
  );
}
