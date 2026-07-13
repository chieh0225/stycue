'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuthed } from '../../auth';

export default function ProfilePage() {
  const router = useRouter();

  function handleLogout() {
    clearAuthed();
    router.push('/login');
  }

  const nickname = 'Mao';
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#835500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
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
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#835500"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                </svg>
              </div>
              <span className="text-center text-[11.5px] font-medium text-[#403a32]">我的委託</span>
            </Link>
            <Link href="/profile/posts" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(217,154,61,0.12)]">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#835500"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <span className="text-center text-[11.5px] font-medium text-[#403a32]">
                我的分享文
              </span>
            </Link>
            <Link href="/profile/points/history" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(217,154,61,0.12)]">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#835500"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3h12a1 1 0 011 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 011-1z" />
                  <path d="M8 8h8M8 12h8M8 16h4" />
                </svg>
              </div>
              <span className="text-center text-[11.5px] font-medium text-[#403a32]">積分紀錄</span>
            </Link>
            <Link href="/profile/favorites" className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[rgba(217,154,61,0.12)]">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#835500"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7d7766"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <Link
              href="/disclaimer"
              className="flex items-center justify-between border-b border-[#f0e4c0] px-4 py-3.75"
            >
              <span className="text-[14.5px] text-[#403a32]">免責聲明</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7d7766"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
            <div className="flex items-center justify-between border-b border-[#f0e4c0] px-4 py-3.75">
              <span className="text-[14.5px] text-[#403a32]">問題回報</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7d7766"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
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
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ba1a1a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span className="text-[14.5px] font-semibold text-[#ba1a1a]">登出</span>
          </button>
        </div>
      </div>
    </div>
  );
}
