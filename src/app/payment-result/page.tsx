'use client';

import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { TopBar } from '@/components/ui/top-bar';
import { getPointWallet } from '@/lib/points-api';

// GET /api/points/purchases/{orderId} doesn't exist on the backend yet (see
// ai-preview/Points.md), so the real order status can't be queried — this
// literally mirrors the mock's default state (`result: 'success'`), with the
// fail branch fully built but currently unreachable through real UI.
const result: 'success' | 'fail' = 'success';

// orderNo/planLabel/amountLabel have no real order to read from yet — mirrors
// the mock's own hardcoded mock strings verbatim.
const orderNo = 'SC20260715A031';
const planLabel = '500 積分';
const amountLabel = 'NT$199';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') === 'comment' ? 'comment' : 'mall';
  const returnTo = searchParams.get('returnTo');

  const [currentPoints, setCurrentPoints] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getPointWallet()
      .then((res) => {
        if (active && res.success && res.data) {
          setCurrentPoints(res.data.currentPoints);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const isSuccess = result === 'success';

  const primaryLabel = source === 'comment' ? '返回留言，選擇最佳留言' : '前往積分商城';
  const primaryHref = source === 'comment' && returnTo ? returnTo : '/profile/points/mall';

  return (
    <div className="flex flex-1 flex-col bg-muted">
      {/* Header */}
      <TopBar title="儲值結果" className="px-4.5 py-4" />

      {/* Result icon block */}
      <div className="flex flex-col items-center px-6 pt-14 pb-8 text-center">
        {isSuccess ? (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-tag-green-bg">
            <Check className="h-8.5 w-8.5 text-tag-green" strokeWidth={2.4} />
          </div>
        ) : (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7dcdc]">
            <X className="h-8.5 w-8.5 text-[#b3453e]" strokeWidth={2.4} />
          </div>
        )}

        <h2 className="mb-2 text-headline-sm font-extrabold text-foreground">
          {isSuccess ? '儲值成功' : '付款失敗'}
        </h2>
        <p className="text-body-md leading-[1.6] whitespace-pre-line text-text-tertiary">
          {isSuccess
            ? '已完成付款，積分將立即存入您的帳戶'
            : '交易未完成，您的積分尚未儲值\n請確認付款資訊後再試一次'}
        </p>
      </div>

      {/* Order detail card */}
      <div className="mx-4.5 mb-8 flex flex-col rounded-panel border border-border bg-popover px-4.5 py-4">
        <div className="flex items-center justify-between border-b border-border-subtle py-2.5">
          <span className="text-label-md text-text-tertiary">訂單編號</span>
          <span className="text-label-md font-bold text-foreground">{orderNo}</span>
        </div>
        <div className="flex items-center justify-between border-b border-border-subtle py-2.5">
          <span className="text-label-md text-text-tertiary">儲值方案</span>
          <span className="text-label-md font-bold text-foreground">{planLabel}</span>
        </div>
        <div
          className={`flex items-center justify-between py-2.5 ${isSuccess ? 'border-b border-border-subtle' : ''}`}
        >
          <span className="text-label-md text-text-tertiary">付款金額</span>
          <span className="text-label-md font-bold text-foreground">{amountLabel}</span>
        </div>
        <div
          className={`flex items-center justify-between py-2.5 ${isSuccess ? 'border-b border-border-subtle' : ''}`}
        >
          <span className="text-label-md text-text-tertiary">付款方式</span>
          <span className="text-label-md font-bold text-foreground">信用卡・綠界金流</span>
        </div>
        {isSuccess ? (
          <div className="flex items-center justify-between py-2.5">
            <span className="text-label-md text-text-tertiary">目前可用積分</span>
            <span className="text-body-lg font-extrabold text-gold-dark">
              {currentPoints === null ? '-' : currentPoints}
            </span>
          </div>
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="flex flex-1 flex-col justify-end gap-2.5 px-4.5 pb-6">
        {isSuccess ? (
          <Link
            href={primaryHref}
            className="flex items-center justify-center rounded-card bg-foreground py-4"
          >
            <span className="text-label-md font-bold text-background">{primaryLabel}</span>
          </Link>
        ) : (
          <Link
            href="/profile/points/buy"
            className="flex items-center justify-center rounded-card bg-foreground py-4"
          >
            <span className="text-label-md font-bold text-background">重新選擇方案</span>
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center justify-center rounded-card border-[1.5px] border-border py-4"
        >
          <span className="text-label-md font-bold text-foreground">回首頁</span>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={null}>
      <PaymentResultContent />
    </Suspense>
  );
}
