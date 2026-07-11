'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-[#fff9e8]">
      <header className="flex flex-shrink-0 items-center justify-center border-b border-[#f0e4c0] pt-4 pr-4.5 pb-3.5 pl-4.5">
        <span className="text-[19px] font-bold tracking-[0.5px] text-[#403a32]">StyCue</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8 pt-6 pb-12 text-center">
        {/* Decorative mascot — hidden from assistive tech */}
        <div
          aria-hidden="true"
          className="relative mb-7 flex h-33 w-33 items-center justify-center"
        >
          <div className="absolute h-30 w-30 rotate-[-6deg] rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-[#f6d978] opacity-30" />
          <svg width="82" height="82" viewBox="0 0 60 60" fill="none" className="rotate-[-8deg]">
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
              fill="#f6d978"
            />
            <path
              d="M30 16c-10.5 0-17.5 7.8-17.5 18.5 0 3 .6 5.6 2 7.7 1.8 2.7 4.8 3.8 7.8 3.8h15.4c3 0 6-1.1 7.8-3.8 1.4-2.1 2-4.7 2-7.7C47.5 23.8 40.5 16 30 16z"
              fill="none"
              stroke="#d99a3d"
              strokeWidth="1.4"
              opacity="0.5"
            />
            {/* puzzled face: one eye squint, one raised brow */}
            <path
              d="M21.5 31.5c1 -1.4 3.2 -1.4 4.2 0"
              stroke="#403a32"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="36" cy="33" r="2.3" fill="#403a32" />
            {/* wavy questioning mouth */}
            <path
              d="M25 39.5c1.4 -1.6 2.8 1.6 4.2 0c1.4 -1.6 2.8 1.6 4.2 0"
              stroke="#403a32"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="19" cy="36.5" rx="2.6" ry="1.6" fill="#d99a3d" opacity="0.35" />
            <ellipse cx="41" cy="36.5" rx="2.6" ry="1.6" fill="#d99a3d" opacity="0.35" />
          </svg>
          {/* question mark spark, replacing the cue spark */}
          <div className="absolute top-0.5 right-2.5 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#a9b88e] shadow-[0_4px_10px_rgba(169,184,142,0.35)]">
            <span className="text-[15px] leading-none font-extrabold text-[#fffdf7]">?</span>
          </div>
        </div>

        <p className="mb-2.5 text-[15px] font-bold tracking-[2px] text-[#d99a3d]">404</p>
        <h1 className="mb-3 text-[21px] font-bold text-[#1d1c12]">這個頁面不存在</h1>
        <p className="mb-8 text-[14px] leading-[1.7] text-[#4c4637]">
          你要找的穿搭或委託內容可能已被移除，或連結有誤
        </p>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/"
            className="flex h-12.5 w-full items-center justify-center rounded-lg bg-[#f6d978] text-[15px] font-bold text-[#403a32] shadow-[0_4px_12px_rgba(217,154,61,0.14)]"
          >
            回到首頁
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-12.5 w-full items-center justify-center rounded-lg border border-[#403a32] bg-transparent text-[15px] font-bold text-[#403a32]"
          >
            回上一頁
          </button>
        </div>
      </div>
    </div>
  );
}
