'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/ui/top-bar';

export default function DisclaimerPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-secondary">
      <TopBar
        left={
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="返回"
            className="flex h-8 w-8 items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" strokeWidth={2} />
          </button>
        }
        title="免責聲明"
      />

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-7 pt-6 pb-12 text-center">
        {/* Decorative mascot — hidden from assistive tech */}
        <div
          aria-hidden="true"
          className="relative mb-4.5 flex h-33 w-33 items-center justify-center"
        >
          <div className="absolute h-30 w-30 -rotate-6 rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-primary/30" />
          <svg width="82" height="82" viewBox="0 0 60 60" fill="none" className="-rotate-8">
            {/* tag string loop */}
            <circle cx="30" cy="9" r="3.4" fill="none" stroke="#715c01" strokeWidth="2.4" />
            <line
              x1="30"
              y1="12.5"
              x2="30"
              y2="17"
              stroke="#715c01"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* tag body */}
            <path
              d="M30 16c-10.5 0-17.5 7.8-17.5 18.5 0 3 .6 5.6 2 7.7 1.8 2.7 4.8 3.8 7.8 3.8h15.4c3 0 6-1.1 7.8-3.8 1.4-2.1 2-4.7 2-7.7C47.5 23.8 40.5 16 30 16z"
              className="fill-primary"
            />
            <path
              d="M30 16c-10.5 0-17.5 7.8-17.5 18.5 0 3 .6 5.6 2 7.7 1.8 2.7 4.8 3.8 7.8 3.8h15.4c3 0 6-1.1 7.8-3.8 1.4-2.1 2-4.7 2-7.7C47.5 23.8 40.5 16 30 16z"
              fill="none"
              className="stroke-gold"
              strokeWidth="1.4"
              opacity="0.5"
            />
            {/* smiling face */}
            <circle cx="24" cy="33" r="2.3" className="fill-foreground" />
            <circle cx="36" cy="33" r="2.3" className="fill-foreground" />
            <path
              d="M25.5 39c2.6 2 6.4 2 9 0"
              className="stroke-foreground"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="19" cy="36.5" rx="2.6" ry="1.6" className="fill-gold" opacity="0.35" />
            <ellipse cx="41" cy="36.5" rx="2.6" ry="1.6" className="fill-gold" opacity="0.35" />
          </svg>
          {/* sparkle accent */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 18 18"
            fill="none"
            className="absolute top-0.5 right-2.5"
          >
            <path
              d="M9 0c.6 3.4 1.6 4.4 5 5-3.4.6-4.4 1.6-5 5-.6-3.4-1.6-4.4-5-5 3.4-.6 4.4-1.6 5-5z"
              className="fill-sage"
            />
          </svg>
        </div>

        <h1 className="mb-3.5 text-headline-sm font-bold text-foreground">提醒您</h1>
        <div className="self-stretch text-left text-body-md leading-[1.8] text-muted-foreground">
          <p className="mb-3.5">
            這個網站為學生專題作品，僅提供學習與展示使用，並非真實服務或商業網站。
          </p>
          <p className="mb-3.5">
            網站中的使用者、穿搭內容、留言與積分紀錄皆為示範用途，不代表真實交易或真人資料。
          </p>
          <p>若您對本專題有任何建議或想法，歡迎與火箭隊 22 梯 StyCue 團隊聯繫討論。</p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => router.back()}
          className="mt-8 w-full"
        >
          我知道了
        </Button>
      </div>
    </div>
  );
}
