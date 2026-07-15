'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPointWallet } from '@/lib/points-api';

type RecordDirection = 'earn' | 'spend';
type RecordKind = 'star' | 'undo' | 'circleCheck' | 'boost' | 'checkBadge' | 'card' | 'clock';

type PointsHistoryRecord = {
  dir: RecordDirection;
  kind: RecordKind;
  title: string;
  meta?: string;
  amount: number;
  month: string;
};

const ALL_RECORDS: PointsHistoryRecord[] = [
  {
    dir: 'spend',
    kind: 'star',
    title: '委託者選擇最佳留言給予積分',
    meta: '2026/07/09 21:42・想請大家幫我搭配韓系穿搭',
    amount: -75,
    month: '2026 年 7 月',
  },
  {
    dir: 'spend',
    kind: 'star',
    title: '委託到期自動給予最高讚留言積分',
    meta: '2026/07/09 20:00・想找一雙適合的白鞋',
    amount: -50,
    month: '2026 年 7 月',
  },
  {
    dir: 'earn',
    kind: 'undo',
    title: '提前關閉委託退還積分',
    meta: '2026/07/09 10:30・想找一雙適合的白鞋',
    amount: 47,
    month: '2026 年 7 月',
  },
  {
    dir: 'spend',
    kind: 'circleCheck',
    title: '退還積分手續費',
    meta: '2026/07/09 10:30・想找一雙適合的白鞋',
    amount: -3,
    month: '2026 年 7 月',
  },
  {
    dir: 'spend',
    kind: 'boost',
    title: '委託加碼積分、延長時間',
    meta: '2026/07/09 09:20・想找一雙適合的白鞋',
    amount: -25,
    month: '2026 年 7 月',
  },
  {
    dir: 'earn',
    kind: 'checkBadge',
    title: '每日簽到',
    meta: '2026/07/09 09:16',
    amount: 10,
    month: '2026 年 7 月',
  },
  {
    dir: 'spend',
    kind: 'clock',
    title: '發佈委託扣除積分',
    meta: '2026/07/09 09:10・想找一雙適合的白鞋',
    amount: -50,
    month: '2026 年 7 月',
  },
  {
    dir: 'earn',
    kind: 'card',
    title: '儲值積分',
    meta: '2026/07/09 09:05',
    amount: 150,
    month: '2026 年 7 月',
  },
  {
    dir: 'spend',
    kind: 'clock',
    title: '發佈委託扣除積分',
    meta: '2026/07/08 20:03・想請大家幫我搭配韓系穿搭',
    amount: -50,
    month: '2026 年 7 月',
  },
  {
    dir: 'earn',
    kind: 'checkBadge',
    title: '首次登入每日簽到',
    meta: '2026/06/20 10:00',
    amount: 10,
    month: '2026 年 6 月',
  },
  {
    dir: 'earn',
    kind: 'checkBadge',
    title: '新手註冊獎勵',
    meta: '2026/06/20 10:00',
    amount: 50,
    month: '2026 年 6 月',
  },
];

const FILTER_TABS: { key: 'all' | 'earn' | 'spend'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'earn', label: '獲得' },
  { key: 'spend', label: '支出' },
];

function RecordIcon({ kind, stroke }: { kind: RecordKind; stroke: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (kind) {
    case 'star':
      return (
        <svg {...props}>
          <path d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 16.9l-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z" />
        </svg>
      );
    case 'undo':
      return (
        <svg {...props}>
          <path d="M9 14l-4-4 4-4" />
          <path d="M5 10h9a5 5 0 015 5v1" />
        </svg>
      );
    case 'circleCheck':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'boost':
      return (
        <svg {...props}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </svg>
      );
    case 'checkBadge':
      return (
        <svg {...props}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case 'card':
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="13" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
  }
}

export default function PointsHistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend'>('all');
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);

  useEffect(() => {
    getPointWallet()
      .then((res) => {
        if (res.success && res.data) {
          setCurrentPoints(res.data.currentPoints);
        }
      })
      .catch(() => {});
  }, []);

  const visibleRecords = ALL_RECORDS.filter((r) => filter === 'all' || filter === r.dir).map(
    (record, index, arr) => ({
      ...record,
      showMonthHeader: index === 0 || record.month !== arr[index - 1].month,
    }),
  );

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="static z-20 flex items-center justify-center border-b border-[#f0e4c0] bg-[#fff9e8] px-4.5 pt-4 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4.5 flex h-8 w-8 items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#403a32"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-[19px] font-bold tracking-[0.5px] text-[#403a32]">積分紀錄</span>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-visible bg-[#fdf7e9]">
        {/* Balance card */}
        <div className="relative mx-4.5 mt-5 mb-6 overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#f6d978_0%,#f0c458_100%)] px-5 py-5.5 shadow-[0_8px_20px_rgba(217,154,61,0.24)]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#835500"
            className="absolute top-4 right-4.5 opacity-50"
          >
            <path d="M12 2l2.2 7.2L22 12l-7.8 2.8L12 22l-2.2-7.2L2 12l7.8-2.8z" />
          </svg>
          <div className="mb-1.5 text-[13px] font-semibold text-[#6b4a18]">目前可用積分</div>
          <div className="text-[34px] leading-[1.1] font-extrabold text-[#403a32]">
            {currentPoints === null ? '-' : currentPoints}
          </div>
          <Link
            href="/profile/points/buy"
            className="mt-4 flex items-center justify-center rounded-[10px] bg-[#403a32] py-2.75 shadow-[0_4px_10px_rgba(64,58,50,0.22)]"
          >
            <span className="text-[14px] font-bold text-[#fffdf7]">前往儲值積分</span>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="mx-4.5 mb-4 flex rounded-[10px] border border-[#e5ddbf] bg-[#fffdf7] p-0.75">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`flex-1 rounded-lg py-2 text-center ${active ? 'bg-[#d99a3d]' : ''}`}
              >
                <span
                  className={
                    active
                      ? 'text-[13px] font-bold text-[#fffdf7]'
                      : 'text-[13px] font-medium text-[#756c60]'
                  }
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Records */}
        <div className="flex flex-col px-4.5 pb-8">
          {visibleRecords.map((record, index) => {
            const isLast = index === visibleRecords.length - 1;
            const iconBg =
              record.dir === 'earn' ? 'rgba(169,184,142,0.16)' : 'rgba(217,154,61,0.14)';
            const iconStroke = record.dir === 'earn' ? '#4e6b45' : '#835500';
            const amountColor = record.dir === 'earn' ? '#4e6b45' : '#ba1a1a';
            const amountLabel = record.amount > 0 ? `+${record.amount}` : `${record.amount}`;
            return (
              <div key={`${record.month}-${index}`}>
                {record.showMonthHeader && (
                  <div className="px-1 pt-4 pb-2 text-[12.5px] font-semibold text-[#9a9080]">
                    {record.month}
                  </div>
                )}
                <div
                  className={`flex items-center gap-3 px-1 py-3.5 ${isLast ? '' : 'border-b border-[#f0e4c0]'}`}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: iconBg }}
                  >
                    <RecordIcon kind={record.kind} stroke={iconStroke} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-[#403a32]">{record.title}</div>
                    {record.meta && (
                      <div className="mt-0.5 truncate text-[12px] text-[#9a9080]">
                        {record.meta}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-[15px] font-bold" style={{ color: amountColor }}>
                    {amountLabel}
                  </span>
                </div>
              </div>
            );
          })}

          {visibleRecords.length === 0 && (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(217,154,61,0.12)]">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d99a3d"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 10h18" />
                  <path d="M8 3v4" />
                  <path d="M16 3v4" />
                </svg>
              </div>
              <span className="text-[14.5px] font-semibold text-[#756c60]">目前尚無支出紀錄</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
