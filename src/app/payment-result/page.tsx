'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
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
    <div className="flex flex-1 flex-col bg-[#fdf7e9]">
      {/* Header */}
      <div
        className="relative flex-shrink-0 py-3.5 pr-4.5 pl-4.5"
        style={{
          background: '#fff9e8',
          borderBottom: '1px solid #f0e4c0',
          boxShadow: '0 4px 12px rgba(217,154,61,0.08)',
        }}
      >
        <h1
          className="text-center text-[19px] font-bold text-[#403a32]"
          style={{ letterSpacing: '0.5px' }}
        >
          儲值結果
        </h1>
      </div>

      {/* Result icon block */}
      <div className="flex flex-col items-center px-6 pt-14 pb-8 text-center">
        {isSuccess ? (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#e3e9d3]">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4e5c3a"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        ) : (
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7dcdc]">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b3453e"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
        )}

        <h2 className="mb-2 text-[21px] font-extrabold text-[#403a32]">
          {isSuccess ? '儲值成功' : '付款失敗'}
        </h2>
        <p className="text-[14px] leading-[1.6] whitespace-pre-line text-[#9a9080]">
          {isSuccess
            ? '已完成付款，積分將立即存入您的帳戶'
            : '交易未完成，您的積分尚未儲值\n請確認付款資訊後再試一次'}
        </p>
      </div>

      {/* Order detail card */}
      <div className="mx-4.5 mb-8 flex flex-col rounded-[14px] border border-[#e5ddbf] bg-[#fffdf7] px-4.5 py-4">
        <div className="flex items-center justify-between border-b border-[#f0e4c0] py-2.5">
          <span className="text-[13px] text-[#9a9080]">訂單編號</span>
          <span className="text-[13px] font-bold text-[#403a32]">{orderNo}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#f0e4c0] py-2.5">
          <span className="text-[13px] text-[#9a9080]">儲值方案</span>
          <span className="text-[13px] font-bold text-[#403a32]">{planLabel}</span>
        </div>
        <div
          className={`flex items-center justify-between py-2.5 ${isSuccess ? 'border-b border-[#f0e4c0]' : ''}`}
        >
          <span className="text-[13px] text-[#9a9080]">付款金額</span>
          <span className="text-[13px] font-bold text-[#403a32]">{amountLabel}</span>
        </div>
        <div
          className={`flex items-center justify-between py-2.5 ${isSuccess ? 'border-b border-[#f0e4c0]' : ''}`}
        >
          <span className="text-[13px] text-[#9a9080]">付款方式</span>
          <span className="text-[13px] font-bold text-[#403a32]">信用卡・綠界金流</span>
        </div>
        {isSuccess ? (
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[13px] text-[#9a9080]">目前可用積分</span>
            <span className="text-[15px] font-extrabold text-[#835500]">
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
            className="flex items-center justify-center rounded-xl py-3.75"
            style={{ background: '#403a32' }}
          >
            <span className="text-[15.5px] font-bold text-[#fffdf7]">{primaryLabel}</span>
          </Link>
        ) : (
          <Link
            href="/profile/points/buy"
            className="flex items-center justify-center rounded-xl py-3.75"
            style={{ background: '#403a32' }}
          >
            <span className="text-[15.5px] font-bold text-[#fffdf7]">重新選擇方案</span>
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center justify-center rounded-xl py-3.75"
          style={{ border: '1.5px solid #403a32' }}
        >
          <span className="text-[15.5px] font-bold text-[#403a32]">回首頁</span>
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
