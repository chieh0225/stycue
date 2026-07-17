'use client';

import { ChevronLeft, Inbox, PaintRoller, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { TopBar } from '@/components/ui/top-bar';

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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-popover">
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
        title="積分商城"
        right={
          <button
            type="button"
            onClick={() => router.back()}
            className="text-label-md font-semibold text-gold-deep"
          >
            關閉
          </button>
        }
        className="border-b-0 bg-[linear-gradient(135deg,var(--primary)_0%,#f0c458_100%)] py-4 shadow-cta-strong"
      />

      {/* Tab bar */}
      <div className="flex border-b border-border-subtle bg-popover">
        <button
          type="button"
          onClick={() => setTab('redeem')}
          className={`flex-1 py-3.5 pb-3 text-center text-label-md ${
            tab === 'redeem'
              ? 'border-b-2 border-gold font-bold text-foreground'
              : 'border-b-2 border-transparent font-medium text-text-tertiary'
          }`}
        >
          可兌換商品
        </button>
        <button
          type="button"
          onClick={() => setTab('owned')}
          className={`flex-1 py-3.5 pb-3 text-center text-label-md ${
            tab === 'owned'
              ? 'border-b-2 border-gold font-bold text-foreground'
              : 'border-b-2 border-transparent font-medium text-text-tertiary'
          }`}
        >
          已兌換商品
        </button>
      </div>

      {/* Scroll body */}
      <div className="no-scrollbar flex-1 overflow-y-auto bg-muted">
        {/* Category filter */}
        <div className="mx-4.5 my-4 flex rounded-[10px] border border-border bg-popover p-1">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`flex-1 rounded-lg py-2 text-center text-label-md ${
              category === 'all'
                ? 'bg-gold font-bold text-background'
                : 'font-medium text-text-muted'
            }`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => setCategory('coupon')}
            className={`flex-1 rounded-lg py-2 text-center text-label-md ${
              category === 'coupon'
                ? 'bg-gold font-bold text-background'
                : 'font-medium text-text-muted'
            }`}
          >
            購物折價券
          </button>
          <button
            type="button"
            onClick={() => setCategory('theme')}
            className={`flex-1 rounded-lg py-2 text-center text-label-md ${
              category === 'theme'
                ? 'bg-gold font-bold text-background'
                : 'font-medium text-text-muted'
            }`}
          >
            主題
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/12">
              <Inbox className="h-6 w-6 text-gold" />
            </div>
            <p className="text-body-md font-semibold text-text-muted">並無兌換記錄</p>
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
                  className={`overflow-hidden rounded-panel border border-border bg-popover ${clickable ? 'cursor-pointer' : ''}`}
                >
                  {it.type === 'coupon' ? (
                    <div
                      className="flex h-25 flex-col items-center justify-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg,#fff4d6 0%,#fce7b0 100%)' }}
                    >
                      <Ticket className="h-6 w-6 text-gold-dark" />
                      <span className="text-headline-sm font-extrabold text-gold-deep">
                        {it.amount}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex h-25 items-center justify-center"
                      style={{ background: it.from }}
                    >
                      <PaintRoller className="h-6 w-6 text-[rgba(255,255,255,0.92)]" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 p-3 pb-3.5">
                    {it.tag ? (
                      <span className="text-label-md font-semibold text-text-tertiary">
                        {it.tag}
                      </span>
                    ) : null}
                    <span className="text-body-md leading-[1.3] font-bold text-foreground">
                      {it.name}
                    </span>

                    {isRedeemable ? (
                      <div
                        className="rounded-lg bg-gold py-2 text-center text-label-md font-bold text-background"
                        style={{ boxShadow: '0 3px 8px rgba(217,154,61,0.28)' }}
                      >
                        {it.points} 積分
                      </div>
                    ) : null}
                    {isOwnedCoupon ? (
                      <div className="rounded-lg bg-foreground py-2 text-center text-label-md font-bold text-background">
                        使用
                      </div>
                    ) : null}
                    {isOwnedThemeApplied ? (
                      <div className="rounded-lg bg-border-subtle py-2 text-center text-label-md font-bold text-[#b0a784]">
                        使用中
                      </div>
                    ) : null}
                    {isOwnedThemeUnapplied ? (
                      <div className="rounded-lg bg-foreground py-2 text-center text-label-md font-bold text-background">
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
