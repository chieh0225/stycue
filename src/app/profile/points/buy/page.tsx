'use client';

import { ChevronLeft, CircleCheck, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TopBar } from '@/components/ui/top-bar';
import { getPointWallet } from '@/lib/points-api';

type Plan = {
  id: string;
  price: number;
  base: number;
  bonus: number;
  total: number;
  badge?: '熱門' | '最划算';
};

const plansData: Plan[] = [
  { id: 'p49', price: 49, base: 100, bonus: 0, total: 100 },
  { id: 'p99', price: 99, base: 200, bonus: 50, total: 250 },
  { id: 'p199', price: 199, base: 400, bonus: 100, total: 500, badge: '熱門' },
  { id: 'p299', price: 299, base: 600, bonus: 150, total: 750, badge: '最划算' },
];

export default function BuyPointsPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('p199');
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

  const selectedPlan = plansData.find((plan) => plan.id === selectedId) ?? plansData[0];
  const confirmPurchase = () => {};

  return (
    <div className="flex flex-1 flex-col bg-muted">
      {/* Header */}
      <TopBar
        left={
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="返回"
            className="flex h-8 w-8 items-center justify-center"
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
            {plansData.map((plan) => {
              const selected = plan.id === selectedId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  className={`flex items-center gap-3 rounded-panel border-2 bg-white p-4 text-left ${
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
                        {plan.total} 積分
                      </span>
                      {plan.badge ? (
                        <span
                          className={`rounded-[6px] px-2 py-0.5 text-label-md font-bold ${
                            plan.badge === '最划算'
                              ? 'bg-tag-green-bg text-tag-green'
                              : 'bg-[#fbe9b8] text-gold-dark'
                          }`}
                        >
                          {plan.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-label-md text-text-tertiary">
                      {plan.bonus > 0
                        ? `${plan.base} 積分 + 贈送 ${plan.bonus} 積分`
                        : `${plan.base} 積分`}
                    </span>
                  </span>
                  <span className="text-body-lg font-extrabold text-foreground">
                    NT${plan.price}
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
      <div className="flex-shrink-0 border-t border-border-subtle bg-popover px-4.5 pt-3.5 pb-6">
        <button
          type="button"
          onClick={confirmPurchase}
          className="flex w-full items-center justify-center rounded-card bg-foreground py-4"
          style={{ boxShadow: '0 4px 12px rgba(64,58,50,0.22)' }}
        >
          <span className="text-label-md font-bold text-background">
            確認並前往付款・NT${selectedPlan.price}
          </span>
        </button>
      </div>
    </div>
  );
}
