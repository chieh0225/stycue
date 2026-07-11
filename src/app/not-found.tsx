'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-secondary">
      <header className="flex shrink-0 items-center justify-center border-b border-border-subtle pt-4 pr-4.5 pb-3.5 pl-4.5">
        <span className="text-headline-sm font-bold tracking-[0.5px] text-foreground">StyCue</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8 pt-6 pb-12 text-center">
        {/* Decorative mascot — hidden from assistive tech */}
        <div
          aria-hidden="true"
          className="relative mb-7 flex h-33 w-33 items-center justify-center"
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
            {/* puzzled face: one eye squint, one raised brow */}
            <path
              d="M21.5 31.5c1 -1.4 3.2 -1.4 4.2 0"
              className="stroke-foreground"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="36" cy="33" r="2.3" className="fill-foreground" />
            {/* wavy questioning mouth */}
            <path
              d="M25 39.5c1.4 -1.6 2.8 1.6 4.2 0c1.4 -1.6 2.8 1.6 4.2 0"
              className="stroke-foreground"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="19" cy="36.5" rx="2.6" ry="1.6" className="fill-gold" opacity="0.35" />
            <ellipse cx="41" cy="36.5" rx="2.6" ry="1.6" className="fill-gold" opacity="0.35" />
          </svg>
          {/* question mark spark, replacing the cue spark */}
          <div className="absolute top-0.5 right-2.5 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-sage shadow-[0_4px_10px_rgba(169,184,142,0.35)]">
            <span className="text-[14px] leading-none font-extrabold text-background">?</span>
          </div>
        </div>

        <p className="mb-2.5 text-body-lg font-bold tracking-[2px] text-gold">404</p>
        <h1 className="mb-3 text-headline-sm font-bold text-foreground">這個頁面不存在</h1>
        <p className="mb-8 text-body-md leading-[1.7] text-muted-foreground">
          你要找的穿搭或委託內容可能已被移除，或連結有誤
        </p>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
          >
            回到首頁
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => router.back()}
            className="w-full"
          >
            回上一頁
          </Button>
        </div>
      </div>
    </div>
  );
}
