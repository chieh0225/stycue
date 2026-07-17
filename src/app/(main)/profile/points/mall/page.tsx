'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type MallItem = {
  id: string;
  type: 'coupon' | 'theme';
  name: string;
  tag?: string;
  amount?: string;
  points?: number;
  from?: string;
  to?: string;
};

const REDEEM_COUPONS: MallItem[] = [
  { id: 'c50', type: 'coupon', name: '品牌折價券 NT$50', tag: 'GK', amount: 'NT$50', points: 120 },
  {
    id: 'c100',
    type: 'coupon',
    name: '品牌折價券 NT$100',
    tag: 'SC',
    amount: 'NT$100',
    points: 250,
  },
  {
    id: 'c150',
    type: 'coupon',
    name: '品牌折價券 NT$150',
    tag: 'NET',
    amount: 'NT$150',
    points: 380,
  },
  {
    id: 'c200',
    type: 'coupon',
    name: '品牌折價券 NT$200',
    tag: 'UNIQLO',
    amount: 'NT$200',
    points: 500,
  },
];

const REDEEM_THEMES: MallItem[] = [
  {
    id: 'milktea',
    type: 'theme',
    name: '奶茶',
    tag: '莫蘭迪',
    from: '#C7B299',
    to: '#C7B299',
    points: 40,
  },
  {
    id: 'soda',
    type: 'theme',
    name: '蘇打',
    tag: '莫蘭迪',
    from: '#84AFC9',
    to: '#84AFC9',
    points: 40,
  },
  {
    id: 'mint',
    type: 'theme',
    name: '薄荷茶',
    tag: '莫蘭迪',
    from: '#8FAE8B',
    to: '#8FAE8B',
    points: 60,
  },
  {
    id: 'taro',
    type: 'theme',
    name: '芋頭',
    tag: '莫蘭迪',
    from: '#B6A0D6',
    to: '#B6A0D6',
    points: 60,
  },
];

const OWNED_COUPONS: MallItem[] = [];

const OWNED_THEMES: MallItem[] = [
  { id: 'goose', type: 'theme', name: '鵝黃經典', tag: '預設', from: '#F6D978', to: '#F6D978' },
];

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#835500"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function PaintRollerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.92)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="6" x="2" y="2" rx="2" />
      <path d="M10 8v3" />
      <rect width="8" height="12" x="6" y="11" rx="2" />
      <path d="M6 17h8" />
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D99A3D"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#403A32"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function PointsMallPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'redeem' | 'owned'>('redeem');
  const [category, setCategory] = useState<'all' | 'coupon' | 'theme'>('all');
  const [appliedThemeId, setAppliedThemeId] = useState('goose');

  const items = useMemo(() => {
    const source =
      tab === 'redeem'
        ? [...REDEEM_COUPONS, ...REDEEM_THEMES]
        : [...OWNED_COUPONS, ...OWNED_THEMES];
    return source.filter((it) => category === 'all' || it.type === category);
  }, [tab, category]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-[#fffdf7]">
      {/* Header */}
      <div
        className="relative flex-shrink-0 py-3.5 pr-4.5 pl-4.5"
        style={{
          background: 'linear-gradient(135deg,#f6d978 0%,#f0c458 100%)',
          boxShadow: '0 4px 12px rgba(217,154,61,0.18)',
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="absolute top-1/2 left-4.5 -translate-y-1/2"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h1
          className="text-center text-[19px] font-bold text-[#403a32]"
          style={{ letterSpacing: '0.5px' }}
        >
          積分商城
        </h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-1/2 right-4.5 -translate-y-1/2 text-[14px] font-semibold text-[#6b4a18]"
        >
          關閉
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[#f0e4c0] bg-[#fffdf7]">
        <button
          type="button"
          onClick={() => setTab('redeem')}
          className={`flex-1 py-3.5 pb-3 text-center text-[14.5px] ${
            tab === 'redeem'
              ? 'border-b-2 border-[#d99a3d] font-bold text-[#403a32]'
              : 'border-b-2 border-transparent font-medium text-[#9a9080]'
          }`}
        >
          可兌換商品
        </button>
        <button
          type="button"
          onClick={() => setTab('owned')}
          className={`flex-1 py-3.5 pb-3 text-center text-[14.5px] ${
            tab === 'owned'
              ? 'border-b-2 border-[#d99a3d] font-bold text-[#403a32]'
              : 'border-b-2 border-transparent font-medium text-[#9a9080]'
          }`}
        >
          已兌換商品
        </button>
      </div>

      {/* Scroll body */}
      <div className="no-scrollbar flex-1 overflow-y-auto bg-[#fdf7e9]">
        {/* Category filter */}
        <div className="mx-4.5 my-4 flex rounded-[10px] border border-[#e5ddbf] bg-[#fffdf7] p-[3px]">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`flex-1 rounded-[8px] py-2 text-center text-[13px] ${
              category === 'all'
                ? 'bg-[#d99a3d] font-bold text-[#fffdf7]'
                : 'font-medium text-[#756c60]'
            }`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => setCategory('coupon')}
            className={`flex-1 rounded-[8px] py-2 text-center text-[13px] ${
              category === 'coupon'
                ? 'bg-[#d99a3d] font-bold text-[#fffdf7]'
                : 'font-medium text-[#756c60]'
            }`}
          >
            購物折價券
          </button>
          <button
            type="button"
            onClick={() => setCategory('theme')}
            className={`flex-1 rounded-[8px] py-2 text-center text-[13px] ${
              category === 'theme'
                ? 'bg-[#d99a3d] font-bold text-[#fffdf7]'
                : 'font-medium text-[#756c60]'
            }`}
          >
            主題
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(217,154,61,0.12)]">
              <InboxIcon className="h-6 w-6" />
            </div>
            <p className="text-[14.5px] font-semibold text-[#756c60]">並無兌換記錄</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 px-4.5 pt-1 pb-8">
            {items.map((it) => {
              const isRedeemable = tab === 'redeem';
              const isOwnedCoupon = tab === 'owned' && it.type === 'coupon';
              const isOwnedThemeApplied =
                tab === 'owned' && it.type === 'theme' && it.id === appliedThemeId;
              const isOwnedThemeUnapplied =
                tab === 'owned' && it.type === 'theme' && it.id !== appliedThemeId;
              const clickable = isOwnedThemeUnapplied;

              return (
                <div
                  key={it.id}
                  onClick={clickable ? () => setAppliedThemeId(it.id) : undefined}
                  className={`overflow-hidden rounded-[14px] border border-[#e5ddbf] bg-[#fffdf7] ${clickable ? 'cursor-pointer' : ''}`}
                >
                  {it.type === 'coupon' ? (
                    <div
                      className="flex h-25 flex-col items-center justify-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg,#fff4d6 0%,#fce7b0 100%)' }}
                    >
                      <TicketIcon className="h-6 w-6" />
                      <span className="text-[20px] font-extrabold text-[#6b4a18]">{it.amount}</span>
                    </div>
                  ) : (
                    <div
                      className="flex h-25 items-center justify-center"
                      style={{ background: it.from }}
                    >
                      <PaintRollerIcon className="h-6 w-6" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 p-3 pb-3.5">
                    {it.tag ? (
                      <span className="text-[11px] font-semibold text-[#9a9080]">{it.tag}</span>
                    ) : null}
                    <span className="text-[14px] leading-[1.3] font-bold text-[#403a32]">
                      {it.name}
                    </span>

                    {isRedeemable ? (
                      <div
                        className="rounded-[8px] bg-[#d99a3d] py-1.75 text-center text-[13px] font-bold text-white"
                        style={{ boxShadow: '0 3px 8px rgba(217,154,61,0.28)' }}
                      >
                        {it.points} 積分
                      </div>
                    ) : null}
                    {isOwnedCoupon ? (
                      <div className="rounded-[8px] bg-[#403a32] py-1.75 text-center text-[13px] font-bold text-white">
                        使用
                      </div>
                    ) : null}
                    {isOwnedThemeApplied ? (
                      <div className="rounded-[8px] bg-[#f0e4c0] py-1.75 text-center text-[13px] font-bold text-[#b0a784]">
                        使用中
                      </div>
                    ) : null}
                    {isOwnedThemeUnapplied ? (
                      <div className="rounded-[8px] bg-[#403a32] py-1.75 text-center text-[13px] font-bold text-white">
                        套用
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
