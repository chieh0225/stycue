'use client';

import { AlertCircle, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { TopBar } from '@/components/ui/top-bar';
import {
  getPointPurchase,
  getPointWallet,
  PENDING_POINT_PURCHASE_ORDER_ID_KEY,
} from '@/lib/points-api';
import type { PointPurchaseResponse } from '@/types/points';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') === 'comment' ? 'comment' : 'mall';
  const returnTo = searchParams.get('returnTo');

  const [currentPoints, setCurrentPoints] = useState<number | null>(null);
  const [order, setOrder] = useState<PointPurchaseResponse | null>(null);
  const [queryError, setQueryError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // ECPay 的 ClientBackURL 是後端寫死的裸網址，不會帶 orderId query string，
  // 所以要靠儲值頁在導去 ECPay 前存進 sessionStorage 的值；query string 當備援，
  // 之後後端若改成會帶 orderId 也能直接吃到。
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderIdResolved, setOrderIdResolved] = useState(false);

  useEffect(() => {
    // Deferred to a microtask so this doesn't setState synchronously within
    // the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      const fromQuery = searchParams.get('orderId');
      const fromStorage = sessionStorage.getItem(PENDING_POINT_PURCHASE_ORDER_ID_KEY);
      const raw = fromQuery ?? fromStorage;
      const parsed = raw !== null ? Number(raw) : null;
      setOrderId(parsed !== null && !Number.isNaN(parsed) ? parsed : null);
      setOrderIdResolved(true);
      if (fromStorage) sessionStorage.removeItem(PENDING_POINT_PURCHASE_ORDER_ID_KEY);
    });
  }, [searchParams]);

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

  useEffect(() => {
    if (orderId === null) return;
    let active = true;
    const startedAt = Date.now();

    const poll = async () => {
      const res = await getPointPurchase(orderId);
      if (!active) return;
      if (res.success && res.data) {
        setOrder(res.data);
        if (res.data.paidAt === null) {
          if (Date.now() - startedAt < POLL_TIMEOUT_MS) {
            setTimeout(poll, POLL_INTERVAL_MS);
          } else {
            setTimedOut(true);
          }
        }
      } else {
        setQueryError(true);
      }
    };
    poll();

    return () => {
      active = false;
    };
  }, [orderId]);

  const isPaid = order?.paidAt != null;

  const primaryLabel = source === 'comment' ? '返回留言，選擇最佳留言' : '前往積分商城';
  const primaryHref = source === 'comment' && returnTo ? returnTo : '/profile/points/mall';

  if (orderIdResolved && orderId === null) {
    return (
      <div className="flex flex-1 flex-col bg-muted">
        <TopBar title="儲值結果" className="px-4.5 py-4" />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-body-md text-text-tertiary">缺少訂單編號</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-muted">
      {/* Header */}
      <TopBar title="儲值結果" className="px-4.5 py-4" />

      {/* Result icon block */}
      <div className="flex flex-col items-center px-6 pt-14 pb-8 text-center">
        {isPaid ? (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-tag-green-bg">
            <Check className="h-8.5 w-8.5 text-tag-green" strokeWidth={2.4} />
          </div>
        ) : queryError ? (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7dcdc]">
            <AlertCircle className="h-8.5 w-8.5 text-[#b3453e]" strokeWidth={2.4} />
          </div>
        ) : (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#fbe9b8]">
            <Clock className="h-8.5 w-8.5 text-gold-dark" strokeWidth={2.4} />
          </div>
        )}

        <h2 className="mb-2 text-headline-sm font-extrabold text-foreground">
          {isPaid
            ? '儲值成功'
            : queryError
              ? '查詢失敗'
              : timedOut
                ? '確認中，請稍後查看'
                : '確認付款結果中…'}
        </h2>
        <p className="text-body-md leading-[1.6] whitespace-pre-line text-text-tertiary">
          {isPaid
            ? '已完成付款，積分將立即存入您的帳戶'
            : queryError
              ? '無法查詢訂單狀態，請稍後至積分紀錄查看'
              : timedOut
                ? '付款結果確認時間較長，請稍後至積分紀錄查看最新狀態'
                : '正在確認您的付款結果，請稍候'}
        </p>
      </div>

      {/* Order detail card */}
      {order && (
        <div className="mx-4.5 mb-8 flex flex-col rounded-panel border border-border bg-popover px-4.5 py-4">
          <div className="flex items-center justify-between border-b border-border-subtle py-2.5">
            <span className="text-label-md text-text-tertiary">訂單編號</span>
            <span className="text-label-md font-bold text-foreground">{order.merchantTradeNo}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border-subtle py-2.5">
            <span className="text-label-md text-text-tertiary">儲值方案</span>
            <span className="text-label-md font-bold text-foreground">{order.productName}</span>
          </div>
          <div
            className={`flex items-center justify-between py-2.5 ${isPaid ? 'border-b border-border-subtle' : ''}`}
          >
            <span className="text-label-md text-text-tertiary">付款金額</span>
            <span className="text-label-md font-bold text-foreground">NT${order.amountTwd}</span>
          </div>
          <div
            className={`flex items-center justify-between py-2.5 ${isPaid ? 'border-b border-border-subtle' : ''}`}
          >
            <span className="text-label-md text-text-tertiary">付款方式</span>
            <span className="text-label-md font-bold text-foreground">信用卡・綠界金流</span>
          </div>
          {isPaid ? (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-label-md text-text-tertiary">目前可用積分</span>
              <span className="text-body-lg font-extrabold text-gold-dark">
                {currentPoints === null ? '-' : currentPoints}
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-1 flex-col justify-end gap-2.5 px-4.5 pb-6">
        {isPaid ? (
          <Link
            href={primaryHref}
            className="flex items-center justify-center rounded-card bg-foreground py-4"
          >
            <span className="text-label-md font-bold text-background">{primaryLabel}</span>
          </Link>
        ) : queryError || timedOut ? (
          <Link
            href="/profile/points/buy"
            className="flex items-center justify-center rounded-card bg-foreground py-4"
          >
            <span className="text-label-md font-bold text-background">重新選擇方案</span>
          </Link>
        ) : null}
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
