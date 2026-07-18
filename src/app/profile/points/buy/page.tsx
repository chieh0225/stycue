'use client';

import { ChevronLeft, CircleCheck, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="absolute top-1/2 left-4.5 -translate-y-1/2"
        >
          <ChevronLeft className="h-5 w-5 text-[#403a32]" />
        </button>
        <h1
          className="text-center text-[19px] font-bold text-[#403a32]"
          style={{ letterSpacing: '0.5px' }}
        >
          儲值積分
        </h1>
      </div>

      {/* Scroll body */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4.5 pt-5 pb-32">
        {/* Balance card */}
        <div
          className="relative mb-6 overflow-hidden rounded-[18px] px-5 py-5.5"
          style={{
            background: 'linear-gradient(135deg,#f6d978 0%,#f0c458 100%)',
            boxShadow: '0 8px 20px rgba(217,154,61,0.24)',
          }}
        >
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
        </div>

        {/* Plan list */}
        <div className="mb-6">
          <h2 className="mb-3 text-[15px] font-bold text-[#403a32]">選擇儲值方案</h2>
          <div className="flex flex-col gap-2.5">
            {plansData.map((plan) => {
              const selected = plan.id === selectedId;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedId(plan.id)}
                  className="flex items-center gap-3 rounded-[14px] bg-white p-4 text-left"
                  style={{
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: selected ? '#403a32' : '#f0e4c0',
                    boxShadow: selected ? '0 4px 12px rgba(64,58,50,0.1)' : 'none',
                  }}
                >
                  <span
                    className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ border: `2px solid ${selected ? '#403a32' : '#d8cfa8'}` }}
                  >
                    {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#403a32]" /> : null}
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="text-[16px] font-bold text-[#403a32]">
                        {plan.total} 積分
                      </span>
                      {plan.badge ? (
                        <span
                          className="rounded-[6px] px-2 py-0.5 text-[11px] font-bold"
                          style={
                            plan.badge === '最划算'
                              ? { color: '#4e5c3a', background: '#e3e9d3' }
                              : { color: '#835500', background: '#fbe9b8' }
                          }
                        >
                          {plan.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-[12px] text-[#9a9080]">
                      {plan.bonus > 0
                        ? `${plan.base} 積分 + 贈送 ${plan.bonus} 積分`
                        : `${plan.base} 積分`}
                    </span>
                  </span>
                  <span className="text-[17px] font-extrabold text-[#403a32]">NT${plan.price}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <h2 className="mb-3 text-[15px] font-bold text-[#403a32]">支付方式</h2>
          <div
            className="flex items-center gap-3 rounded-[14px] bg-white p-3.5 pr-4 pl-4"
            style={{ border: '1.5px solid #403a32' }}
          >
            <span className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-[8px] bg-[#fdf7e9]">
              <CreditCard className="h-4.5 w-4.5 text-[#d99a3d]" />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-[14.5px] font-bold text-[#403a32]">綠界金流</span>
              <span className="text-[11.5px] text-[#9a9080]">目前僅支援信用卡付款</span>
            </span>
            <CircleCheck className="h-5 w-5 text-[#d99a3d]" />
          </div>
          <p className="mt-2.5 text-[11.5px] text-[#b8af9e]">結帳將導向綠界金流頁面完成付款</p>
        </div>
      </div>

      {/* Sticky footer CTA */}
      <div
        className="flex-shrink-0 px-4.5 pt-3.5 pb-6"
        style={{ background: '#fffdf7', borderTop: '1px solid #f0e4c0' }}
      >
        <button
          type="button"
          onClick={confirmPurchase}
          className="flex w-full items-center justify-center rounded-xl py-3.75"
          style={{
            background: '#403a32',
            boxShadow: '0 4px 12px rgba(64,58,50,0.22)',
          }}
        >
          <span className="text-[15.5px] font-bold text-[#fffdf7]">
            確認並前往付款・NT${selectedPlan.price}
          </span>
        </button>
      </div>
    </div>
  );
}
