'use client';

import { AlertCircle, ChevronLeft, CircleCheck, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BottomBar } from '@/components/ui/bottom-bar';
import { TopBar } from '@/components/ui/top-bar';
import {
  createPointPurchase,
  getPointProducts,
  getPointWallet,
  PENDING_POINT_PURCHASE_ORDER_ID_KEY,
} from '@/lib/points-api';
import type { PointProductResponse } from '@/types/points';
import HideScrollbar from './hide-scrollbar';

function submitToEcpay(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = actionUrl;

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export default function BuyPointsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<PointProductResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    let active = true;
    getPointProducts()
      .then((res) => {
        if (active && res.success && res.data) {
          setProducts(res.data);
          setSelectedId((current) => current ?? res.data![0]?.id ?? null);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const selectedPlan = products.find((product) => product.id === selectedId) ?? products[0];

  const confirmPurchase = async () => {
    if (submitting || !selectedPlan) return;
    setSubmitting(true);
    setErrorMessage(null);

    const res = await createPointPurchase(selectedPlan.id);
    if (res.success && res.data) {
      sessionStorage.setItem(PENDING_POINT_PURCHASE_ORDER_ID_KEY, String(res.data.orderId));
      submitToEcpay(res.data.checkout.paymentActionUrl, res.data.checkout.paymentFormFields);
      // submit 後會離開頁面，不用重設 submitting
    } else {
      setErrorMessage(res.message || '建立訂單失敗，請稍後再試');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-muted">
      <HideScrollbar />
      {/* Header */}
      <TopBar
        left={
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="返回"
            className="flex h-8 w-8 cursor-pointer items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        }
        title="儲值積分"
        className="px-4.5 py-4"
      />

      {/* Scroll body */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4.5 pt-5 pb-32">
        {/* Balance card */}
        <div
          className="relative mb-6 overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,var(--primary)_0%,#f0c458_100%)] px-5 py-5.5"
          style={{ boxShadow: '0 8px 20px rgba(217,154,61,0.24)' }}
        >
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
          <div className="text-[34px] leading-[1.1] font-extrabold text-foreground">
            {currentPoints === null ? '-' : currentPoints}
          </div>
        </div>

        {/* Plan list */}
        <div className="mb-6">
          <h2 className="mb-3 text-body-lg font-bold text-foreground">選擇儲值方案</h2>
          <div className="flex flex-col gap-2.5">
            {products.map((product) => {
              const selected = product.id === selectedId;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedId(product.id)}
                  className={`flex cursor-pointer items-center gap-3 rounded-panel border-2 bg-white p-4 text-left ${
                    selected ? 'border-foreground' : 'border-border-subtle'
                  }`}
                  style={{ boxShadow: selected ? '0 4px 12px rgba(64,58,50,0.1)' : 'none' }}
                >
                  <span
                    className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-foreground' : 'border-border-dashed'
                    }`}
                  >
                    {selected ? <span className="h-2.5 w-2.5 rounded-full bg-foreground" /> : null}
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="text-body-lg font-bold text-foreground">
                        {product.points} 積分
                      </span>
                    </span>
                    <span className="text-label-md text-text-tertiary">
                      {product.bonusPoints > 0
                        ? `${product.basePoints} 積分 + 贈送 ${product.bonusPoints} 積分`
                        : `${product.basePoints} 積分`}
                    </span>
                  </span>
                  <span className="text-body-lg font-extrabold text-foreground">
                    NT${product.priceTwd}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <h2 className="mb-3 text-body-lg font-bold text-foreground">支付方式</h2>
          <div className="flex items-center gap-3 rounded-panel border-[1.5px] border-foreground bg-white p-3.5 pr-4 pl-4">
            <span className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CreditCard className="h-4.5 w-4.5 text-gold" />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-body-md font-bold text-foreground">綠界金流</span>
              <span className="text-label-md text-text-tertiary">目前僅支援信用卡付款</span>
            </span>
            <CircleCheck className="h-5 w-5 text-gold" />
          </div>
          <p className="mt-2.5 text-label-md text-text-placeholder">
            結帳將導向綠界金流頁面完成付款
          </p>
        </div>
      </div>

      {/* Sticky footer CTA */}
      <BottomBar className="flex-col bg-popover px-4.5 pt-3.5 pb-6">
        {errorMessage && (
          <div className="mb-3 flex items-center gap-1.25 rounded-lg bg-destructive-bg px-3.5 py-2.5 text-label-md font-semibold text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}
        <button
          type="button"
          onClick={confirmPurchase}
          disabled={!selectedPlan || submitting}
          className="flex w-full cursor-pointer items-center justify-center rounded-card bg-foreground py-4 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ boxShadow: '0 4px 12px rgba(64,58,50,0.22)' }}
        >
          <span className="text-label-md font-bold text-background">
            {submitting
              ? '處理中…'
              : `確認並前往付款${selectedPlan ? `・NT$${selectedPlan.priceTwd}` : ''}`}
          </span>
        </button>
      </BottomBar>
    </div>
  );
}
