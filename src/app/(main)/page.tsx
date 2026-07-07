'use client';

import Link from 'next/link';
import { useState } from 'react';

const trendingItems = [
  {
    id: 'trend-1',
    rank: '1',
    title: '風衣穿搭照',
    author: 'GD',
    meta: '171cm',
    accent: 'bg-text-primary',
    gradient:
      'repeating-linear-gradient(135deg, #e9c89a, #e9c89a 10px, #deb985 10px, #deb985 20px)',
  },
  {
    id: 'trend-2',
    rank: '2',
    title: '外套穿搭照',
    author: 'Chris',
    meta: '178cm',
    accent: 'bg-support-sage',
    gradient:
      'repeating-linear-gradient(135deg, #d9cdb8, #d9cdb8 10px, #cbbe9f 10px, #cbbe9f 20px)',
  },
];

const posts = [
  {
    id: 'post-1',
    author: 'GD',
    time: '1天',
    tag: '提問',
    title: '面試穿搭',
    body: '面試時應該要穿什麼樣的服裝比較合適？不同產業的穿搭有什麼眉角嗎？',
    accent: 'bg-text-primary',
    badge: '熱門',
    hero: 'bg-[linear-gradient(135deg,#3f3b37_0%,#7b6856_100%)]',
    chips: ['正式穿搭', '職場感'],
    likes: '1688',
    comments: '180',
  },
  {
    id: 'post-2',
    author: 'Mao',
    time: '5小時',
    tag: '分享',
    title: '秋天的第一套日系裙裝',
    body: '簡單的裙裝配色，也能營造溫柔又清新的日系感。',
    accent: 'bg-accent-amber',
    badge: '日系',
    hero: 'bg-[linear-gradient(135deg,#d7a55f_0%,#7e8a5f_100%)]',
    chips: ['日系穿搭', '柔和色系'],
    likes: '101',
    comments: '30',
  },
  {
    id: 'post-3',
    author: 'W',
    time: '1小時',
    tag: '提問',
    title: '男生棉褲求推薦',
    body: '想要質感好的，預算 1500 內。',
    accent: 'bg-text-muted',
    hero: 'bg-[linear-gradient(135deg,#7d7368_0%,#b6a68b_100%)]',
    chips: ['日常穿搭', '質感推薦'],
    likes: '9',
    comments: '1',
  },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3 20l1.1-4a8.4 8.4 0 0 1-1-4A8.38 8.38 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5Z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="ml-auto h-4 w-4"
    >
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </svg>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(true);

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-border-default bg-surface-soft px-4 py-4">
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full text-text-primary"
          >
            <MenuIcon />
          </button>
          <div className="text-[19px] font-bold tracking-[0.5px] text-text-primary">StyCue</div>
        </div>
      </header>

      <section className="px-4 pt-5 pb-7">
        <div className="mb-3 text-[20px] font-bold text-text-primary">人氣穿搭</div>
        <div className="-mx-1 flex gap-3 overflow-x-auto pb-2">
          {trendingItems.map((item) => (
            <Link
              key={item.id}
              href={`/posts/${item.id}`}
              className="block w-[172px] flex-none overflow-hidden rounded-[16px] bg-white shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
            >
              <div className="relative">
                <div
                  className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md text-[12px] font-bold text-white ${item.accent}`}
                >
                  {item.rank}
                </div>
                <div
                  className="flex h-[216px] items-center justify-center"
                  style={{ background: item.gradient }}
                >
                  <span className="rounded-md bg-white/70 px-2 py-1 text-[11px] font-medium text-text-primary">
                    {item.title}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-full ${item.accent}`} />
                  <div>
                    <div className="text-[13px] font-semibold text-text-primary">{item.author}</div>
                    <div className="text-[11px] text-text-muted">{item.meta}</div>
                  </div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4 text-text-muted"
                >
                  <path d="M6 3h12v18l-6-4-6 4Z" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[20px] font-bold text-text-primary">全部文章</div>
          <button className="flex items-center gap-1 rounded-full border border-border-default bg-white px-3 py-2 text-[13px] font-medium text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
            全部
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-3 w-3 text-text-muted"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex border-b border-border-default text-[15px]">
          <div className="flex-1 border-b-2 border-accent-amber pb-2 text-center font-bold text-text-primary">
            熱門
          </div>
          <div className="flex-1 pb-2 text-center text-text-muted">最新</div>
        </div>

        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="mb-4 block overflow-hidden rounded-[18px] border border-border-default bg-white p-4 shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-[34px] w-[34px] rounded-full border-2 border-border-default ${post.accent}`}
                />
                <div>
                  <div className="text-[14px] font-semibold text-text-primary">{post.author}</div>
                  <div className="text-[12px] text-text-muted">{post.time}</div>
                </div>
              </div>
              {post.badge ? (
                <div className="rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-accent-amber">
                  {post.badge}
                </div>
              ) : null}
            </div>

            <div
              className={`mb-3 flex h-[164px] flex-col justify-between rounded-[16px] p-4 text-white ${post.hero}`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm">
                  {post.tag}
                </span>
                <span className="text-[12px] font-medium text-white/80">StyCue</span>
              </div>
              <div>
                <div className="mb-2 text-[17px] font-bold">{post.title}</div>
                <div className="text-[12px] leading-5 text-white/85">{post.body}</div>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {post.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-text-primary"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-text-muted">
              <div className="flex items-center gap-1 text-[13px]">
                <HeartIcon />
                {post.likes}
              </div>
              <div className="flex items-center gap-1 text-[13px]">
                <CommentIcon />
                {post.comments}
              </div>
              <BookmarkIcon />
            </div>
          </Link>
        ))}
      </section>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[rgba(64,58,50,0.42)]"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="h-full w-[260px] bg-surface-soft p-5 shadow-[4px_0_20px_rgba(64,58,50,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="text-[17px] font-bold text-text-primary">快速瀏覽</div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full"
              >
                <MenuIcon />
              </button>
            </div>
            <div className="space-y-2">
              {[
                ['追蹤中', '👥'],
                ['已收藏', '🔖'],
                ['管理委託', '🧵'],
                ['積分商城', '💰'],
                ['免責聲明', '📝'],
              ].map(([label, icon]) => (
                <button
                  key={label}
                  className="flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left text-[14.5px] font-medium text-text-primary hover:bg-white/80"
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {checkinOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(64,58,50,0.45)] p-4"
          onClick={() => setCheckinOpen(false)}
        >
          <div
            className="w-[280px] rounded-[20px] bg-surface-base p-7 text-center shadow-[0_16px_40px_rgba(64,58,50,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCheckinOpen(false)}
              className="mb-4 ml-auto flex h-7 w-7 items-center justify-center rounded-full text-text-muted"
            >
              ✕
            </button>
            <div className="mb-7 flex justify-center">
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full border-[4px] border-accent-amber bg-brand-primary text-[20px] font-black text-text-primary">
                簽
              </div>
            </div>
            <div className="mb-3 text-[20px] font-bold text-text-primary">簽到完成</div>
            <div className="mb-6 text-[16px] font-bold text-accent-amber">獲得積分 + 50</div>
            <button
              type="button"
              onClick={() => setCheckinOpen(false)}
              className="w-full rounded-[10px] bg-brand-primary px-4 py-3 text-[15px] font-bold text-text-primary"
            >
              知道了
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
