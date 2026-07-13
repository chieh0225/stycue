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
import { useState } from 'react';
import { clearAuthed, getAuthedUser } from '../../auth';

export default function ProfilePage() {
  const router = useRouter();

  function handleLogout() {
    clearAuthed();
    router.push('/login');
  }

  const [nickname] = useState(() => {
    try {
      return localStorage.getItem('stycue-profile-nickname') || getAuthedUser()?.nickName || '';
    } catch {
      return getAuthedUser()?.nickName || '';
    }
  });
  const avatarInitial = nickname.charAt(0).toUpperCase();

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 flex shrink-0 items-center justify-center border-b border-[#f0e4c0] bg-[#fff9e8] px-4.5 pt-4 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <span className="text-[19px] font-bold tracking-[0.5px] text-[#403a32]">個人</span>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto bg-[#fdf7e9]">
        {/* Profile header */}
        <div className="flex items-center gap-3.5 px-4.5 pt-6 pb-5">
          <div className="relative flex h-17 w-17 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#fffdf7] bg-[#f6d978] shadow-[0_4px_12px_rgba(217,154,61,0.16)]">
            <span className="text-[26px] font-bold text-[#835500]">{avatarInitial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-[19px] leading-[1.3] font-bold text-[#403a32]">
              {nickname}
            </div>
            <span className="inline-flex items-center gap-1">
              <Eye width="14" height="14" stroke="#835500" strokeWidth="2" />
              <span className="text-[12.5px] font-semibold text-[#835500]">查看個人主頁</span>
            </span>
          </div>
          <Link
            href="/profile/edit"
            className="shrink-0 rounded-lg border-[1.5px] border-[#e5ddbf] bg-[#fffdf7] px-4 py-2.25"
          >
            <span className="text-[13.5px] font-semibold text-[#403a32]">編輯個人資料</span>
          </Link>
        </div>

        {/* Stats card */}
        <div className="mx-4.5 mb-6 flex items-center rounded-2xl bg-[#fffdf7] px-3 py-4.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[20px] font-bold text-[#403a32]">128</span>
            <span className="text-[12.5px] text-[#756c60]">積分</span>
          </div>
          <div className="h-8 w-px bg-[#e5ddbf]" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[20px] font-bold text-[#403a32]">42</span>
            <span className="text-[12.5px] text-[#756c60]">追蹤中</span>
          </div>
          <div className="h-8 w-px bg-[#e5ddbf]" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[20px] font-bold text-[#403a32]">67</span>
            <span className="text-[12.5px] text-[#756c60]">粉絲</span>
          </div>
        </div>

        {/* 個人功能 */}
        <div className="px-4.5 pb-2">
          <div className="mb-3.5 text-[16px] font-bold text-[#403a32]">個人功能</div>
          <div className="grid grid-cols-4 gap-2">
            <Link href="/profile/commissions/sent" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(217,154,61,0.12)]">
                <PencilLine width="21" height="21" stroke="#835500" strokeWidth="1.8" />
              </div>
              <span className="text-center text-[11.5px] font-medium text-[#403a32]">我的委託</span>
            </Link>
            <Link href="/profile/posts" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(217,154,61,0.12)]">
                <ImageIcon width="21" height="21" stroke="#835500" strokeWidth="1.8" />
              </div>
              <span className="text-center text-[11.5px] font-medium text-[#403a32]">
                我的分享文
              </span>
            </Link>
            <Link href="/profile/points/history" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(217,154,61,0.12)]">
                <Receipt width="21" height="21" stroke="#835500" strokeWidth="1.8" />
              </div>
              <span className="text-center text-[11.5px] font-medium text-[#403a32]">積分紀錄</span>
            </Link>
            <Link href="/profile/favorites" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(217,154,61,0.12)]">
                <Bookmark width="21" height="21" stroke="#835500" strokeWidth="1.8" />
              </div>
              <span className="text-center text-[11.5px] font-medium text-[#403a32]">我的收藏</span>
            </Link>
          </div>
        </div>

        {/* 支援 */}
        <div className="px-4.5 pt-6 pb-7">
          <div className="mb-1.5 text-[16px] font-bold text-[#403a32]">支援</div>
          <div className="overflow-hidden rounded-xl bg-[#fffdf7]">
            <Link
              href="/profile/settings"
              className="flex items-center justify-between border-b border-[#f0e4c0] px-4 py-3.75"
            >
              <span className="text-[14.5px] text-[#403a32]">設定</span>
              <ChevronRight width="16" height="16" stroke="#7d7766" strokeWidth="2" />
            </Link>
            <Link
              href="/disclaimer"
              className="flex items-center justify-between border-b border-[#f0e4c0] px-4 py-3.75"
            >
              <span className="text-[14.5px] text-[#403a32]">免責聲明</span>
              <ChevronRight width="16" height="16" stroke="#7d7766" strokeWidth="2" />
            </Link>
            <div className="flex items-center justify-between border-b border-[#f0e4c0] px-4 py-3.75">
              <span className="text-[14.5px] text-[#403a32]">問題回報</span>
              <ChevronRight width="16" height="16" stroke="#7d7766" strokeWidth="2" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.75">
              <span className="text-[14.5px] text-[#403a32]">版本</span>
              <span className="text-[13px] text-[#9a9080]">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4.5 pb-8">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#f0d8d4] bg-[#fffdf7] px-4 py-3.75"
          >
            <LogOut width="18" height="18" stroke="#ba1a1a" strokeWidth="1.8" />
            <span className="text-[14.5px] font-semibold text-[#ba1a1a]">登出</span>
          </button>
        </div>
      </div>
    </div>
  );
}
