'use client';

import {
  ChevronLeft,
  CircleCheck,
  Clock,
  CreditCard,
  Inbox,
  Info,
  SquareCheckBig,
  Star,
  TrendingUp,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/ui/top-bar';
import { getPointTransactions, getPointWallet } from '@/lib/points-api';
import type { PointTransactionResponse, PointTransactionType } from '@/types/points';

type RecordDirection = 'earn' | 'spend';
type RecordKind =
  | 'star'
  | 'undo'
  | 'circleCheck'
  | 'boost'
  | 'checkBadge'
  | 'card'
  | 'clock'
  | 'info';

type PointsHistoryRecord = {
  dir: RecordDirection;
  kind: RecordKind;
  title: string;
  meta?: string;
  amount: number;
  month: string;
};

const TRANSACTION_TYPE_KIND: Record<PointTransactionType, RecordKind> = {
  1: 'checkBadge', // 註冊贈送
  2: 'checkBadge', // 每日登入
  3: 'clock', // 建立委託
  4: 'boost', // 積分加碼
  5: 'star', // 最佳留言積分
  6: 'star', // 讚數最高留言積分
  7: 'undo', // 退還積分
  8: 'circleCheck', // 積分手續費
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatMonth(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

const DEFAULT_KIND: RecordKind = 'info';

function mapTransactionToRecord(tx: PointTransactionResponse): PointsHistoryRecord {
  return {
    dir: tx.amount > 0 ? 'earn' : 'spend',
    kind: TRANSACTION_TYPE_KIND[tx.transactionType] ?? DEFAULT_KIND,
    title: tx.description,
    meta: formatDateTime(tx.createdAt),
    amount: tx.amount,
    month: formatMonth(tx.createdAt),
  };
}

const FILTER_TABS: { key: 'all' | 'earn' | 'spend'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'earn', label: '獲得' },
  { key: 'spend', label: '支出' },
];

function RecordIcon({ kind, className }: { kind: RecordKind; className: string }) {
  const props = { width: 18, height: 18, strokeWidth: 1.8, className };
  switch (kind) {
    case 'star':
      return <Star {...props} />;
    case 'undo':
      return <Undo2 {...props} />;
    case 'circleCheck':
      return <CircleCheck {...props} />;
    case 'boost':
      return <TrendingUp {...props} />;
    case 'checkBadge':
      return <SquareCheckBig {...props} />;
    case 'card':
      return <CreditCard {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'info':
      return <Info {...props} />;
  }
}

export default function PointsHistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend'>('all');
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<PointTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'unauthorized' | 'error' | null>(null);

  useEffect(() => {
    getPointWallet()
      .then((res) => {
        if (res.success && res.data) {
          setCurrentPoints(res.data.currentPoints);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getPointTransactions({ page: 1, pageSize: 20 })
      .then((res) => {
        if (res.success && res.data) {
          setTransactions(res.data.items);
        } else {
          setError(res.errorCode === 'NO_TOKEN' ? 'unauthorized' : 'error');
        }
      })
      .catch(() => setError('error'))
      .finally(() => setLoading(false));
  }, []);

  const visibleRecords = transactions
    .map(mapTransactionToRecord)
    .filter((r) => filter === 'all' || filter === r.dir)
    .map((record, index, arr) => ({
      ...record,
      showMonthHeader: index === 0 || record.month !== arr[index - 1].month,
    }));

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <TopBar
        left={
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="返回"
            className="flex h-8 w-8 items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5 text-text-primary" strokeWidth={2} />
          </button>
        }
        title="積分紀錄"
        className="py-4"
      />

      {/* Scroll body */}
      <div className="flex-1 overflow-visible bg-muted">
        {/* Balance card */}
        <div className="relative mx-4.5 mt-5 mb-6 overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,var(--primary)_0%,#f0c458_100%)] px-5 py-5.5 shadow-[0_8px_20px_rgba(217,154,61,0.24)]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="absolute top-4 right-4.5 text-gold-dark opacity-50"
          >
            <path d="M12 2l2.2 7.2L22 12l-7.8 2.8L12 22l-2.2-7.2L2 12l7.8-2.8z" />
          </svg>
          <div className="mb-1.5 text-label-md font-semibold text-gold-deep">目前可用積分</div>
          <div className="text-[34px] leading-[1.1] font-extrabold text-text-primary">
            {currentPoints === null ? '-' : currentPoints}
          </div>
          <Link
            href="/profile/points/buy"
            className="mt-4 flex items-center justify-center rounded-[10px] bg-foreground py-3.25 shadow-[0_4px_10px_rgba(64,58,50,0.22)]"
          >
            <span className="text-label-md font-bold text-background">前往儲值積分</span>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="mx-4.5 mb-4 flex rounded-[10px] border border-border bg-popover p-0.75">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`flex-1 rounded-lg py-2 text-center ${active ? 'bg-gold' : ''}`}
              >
                <span
                  className={
                    active
                      ? 'text-label-md font-bold text-background'
                      : 'text-label-md font-medium text-text-muted'
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
          {loading && <div className="py-14 text-center text-body-md text-text-muted">載入中…</div>}

          {!loading && error && (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-gold/12">
                <Inbox width="26" height="26" className="text-gold" strokeWidth={1.8} />
              </div>
              <span className="text-body-md font-semibold text-text-muted">
                {error === 'unauthorized' ? '請先登入查看積分紀錄' : '發生錯誤，請稍後再試'}
              </span>
            </div>
          )}

          {!loading &&
            !error &&
            visibleRecords.map((record, index) => {
              const isLast = index === visibleRecords.length - 1;
              const iconBg = record.dir === 'earn' ? 'bg-sage/16' : 'bg-gold/14';
              const iconColor = record.dir === 'earn' ? 'text-tag-green' : 'text-gold-dark';
              const amountColor = record.dir === 'earn' ? 'text-tag-green' : 'text-destructive';
              const amountLabel = record.amount > 0 ? `+${record.amount}` : `${record.amount}`;
              return (
                <div key={`${record.month}-${index}`}>
                  {record.showMonthHeader && (
                    <div className="px-1 pt-4 pb-2 text-label-md font-semibold text-text-tertiary">
                      {record.month}
                    </div>
                  )}
                  <div
                    className={`flex items-center gap-3 px-1 py-3.5 ${isLast ? '' : 'border-b border-border-subtle'}`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                    >
                      <RecordIcon kind={record.kind} className={iconColor} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-body-md font-semibold text-text-primary">
                        {record.title}
                      </div>
                      {record.meta && (
                        <div className="mt-0.5 truncate text-label-md text-text-tertiary">
                          {record.meta}
                        </div>
                      )}
                    </div>
                    <span className={`shrink-0 text-body-lg font-bold ${amountColor}`}>
                      {amountLabel}
                    </span>
                  </div>
                </div>
              );
            })}

          {!loading && !error && visibleRecords.length === 0 && (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-gold/12">
                <Inbox width="26" height="26" className="text-gold" strokeWidth={1.8} />
              </div>
              <span className="text-body-md font-semibold text-text-muted">目前尚無支出紀錄</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
