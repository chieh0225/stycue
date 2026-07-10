'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlaceholderAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    createdAt: '2026-07-06T09:30:00+08:00',
    tag: '提問',
    title: '面試穿搭',
    body: '面試時應該要穿什麼樣的服裝比較合適？不同產業的穿搭有什麼眉角嗎？',
    accent: 'bg-text-primary',
    badge: '熱門',
    photos: ['#4a5a6b', '#3f3b37', '#8a7f6e'],
    chips: ['正式穿搭', '職場感'],
    likes: '1688',
    comments: '180',
  },
  {
    id: 'post-2',
    author: 'Mao',
    createdAt: '2026-07-07T04:30:00+08:00',
    tag: '分享',
    title: '秋天的第一套日系裙裝',
    body: '簡單的裙裝配色，也能營造溫柔又清新的日系感。',
    accent: 'bg-accent-amber',
    badge: '日系',
    photos: ['linear-gradient(135deg,#d7a55f 0%,#7e8a5f 100%)'],
    chips: ['日系穿搭', '柔和色系'],
    likes: '101',
    comments: '30',
  },
  {
    id: 'post-3',
    author: 'W',
    createdAt: '2026-07-07T08:30:00+08:00',
    tag: '提問',
    title: '男生棉褲求推薦',
    body: '想要質感好的，預算 1500 內。',
    accent: 'bg-text-muted',
    photos: [],
    chips: ['日常穿搭', '質感推薦'],
    likes: '9',
    comments: '1',
  },
];

type Interaction = { liked: boolean; likes: number; bookmarked: boolean };

function formatRelativeTime(createdAt: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}分鐘`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小時`;
  return `${Math.floor(diffHours / 24)}天`;
}

const postFilters = ['全部', '提問', '分享', '委託'] as const;
type PostFilter = (typeof postFilters)[number];

const menuLinkGroups = [
  [
    { label: '追蹤中', icon: '👥', href: '/profile/following' },
    { label: '已收藏', icon: '🔖', href: '/profile/favorites' },
  ],
  [
    { label: '管理委託', icon: '🧵', href: '/profile/commissions/sent' },
    { label: '積分商城', icon: '💰', href: '/profile/points' },
    { label: '免責聲明', icon: '📝', href: '/disclaimer' },
  ],
] as const;

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
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

function BookmarkIcon({ filled, className = 'h-4 w-4' }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </svg>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PostFilter>('全部');
  const [sortMode, setSortMode] = useState<'hot' | 'latest'>('hot');

  useEffect(() => {
    let active = true;
    fetch('/api/checkin')
      .then((res) => res.json())
      .then((data: { claimedToday: boolean }) => {
        if (!active || data.claimedToday) return;
        setCheckinOpen(true);
        // Landing on the home page while unclaimed IS the check-in action.
        void fetch('/api/checkin', { method: 'POST' }).catch(() => {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const [postInteractions, setPostInteractions] = useState<Record<string, Interaction>>(() =>
    Object.fromEntries(
      posts.map((post) => [
        post.id,
        { liked: false, likes: Number(post.likes), bookmarked: false },
      ]),
    ),
  );
  const [trendingBookmarks, setTrendingBookmarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(trendingItems.map((item) => [item.id, false])),
  );

  function toggleLike(postId: string) {
    const liked = !postInteractions[postId].liked;
    setPostInteractions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], liked, likes: prev[postId].likes + (liked ? 1 : -1) },
    }));
    // Mock write — replace with the real posts API once it exists.
    void fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked }),
    }).catch(() => {});
  }

  function toggleBookmark(postId: string) {
    const bookmarked = !postInteractions[postId].bookmarked;
    setPostInteractions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], bookmarked },
    }));
    void fetch(`/api/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked }),
    }).catch(() => {});
  }

  function toggleTrendingBookmark(itemId: string) {
    const bookmarked = !trendingBookmarks[itemId];
    setTrendingBookmarks((prev) => ({ ...prev, [itemId]: bookmarked }));
    void fetch(`/api/posts/${itemId}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmarked }),
    }).catch(() => {});
  }

  const filteredPosts = (
    selectedFilter === '全部' ? posts : posts.filter((post) => post.tag === selectedFilter)
  )
    .slice()
    .sort((a, b) =>
      sortMode === 'hot'
        ? Number(b.likes) - Number(a.likes)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

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
            <article
              key={item.id}
              className="w-[172px] flex-none overflow-hidden rounded-[16px] bg-white shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
            >
              <Link href={`/posts/${item.id}`} className="block">
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
              </Link>
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <PlaceholderAvatar size="sm" accent={item.accent} />
                  <div>
                    <div className="text-[13px] font-semibold text-text-primary">{item.author}</div>
                    <div className="text-[11px] text-text-muted">{item.meta}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTrendingBookmark(item.id)}
                  aria-label="收藏"
                  aria-pressed={trendingBookmarks[item.id]}
                  className={trendingBookmarks[item.id] ? 'text-accent-amber' : 'text-text-muted'}
                >
                  <BookmarkIcon filled={trendingBookmarks[item.id]} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[20px] font-bold text-text-primary">全部文章</div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-expanded={filterOpen}
              className="flex items-center gap-1 rounded-full border border-border-default bg-white px-3 py-2 text-[13px] font-medium text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
            >
              {selectedFilter}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`h-3 w-3 text-text-muted transition-transform ${filterOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {filterOpen ? (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
                <div className="absolute top-full right-0 z-40 mt-2 w-max min-w-full overflow-hidden rounded-[12px] border border-border-default bg-white shadow-[0_4px_12px_rgba(217,154,61,0.12)]">
                  {postFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setFilterOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-[13px] font-medium ${
                        filter === selectedFilter
                          ? 'bg-surface-soft text-accent-amber'
                          : 'text-text-primary hover:bg-surface-soft'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="mb-4 flex border-b border-border-default text-[15px]">
          <button
            type="button"
            onClick={() => setSortMode('hot')}
            className={
              sortMode === 'hot'
                ? 'flex-1 border-b-2 border-accent-amber pb-2 text-center font-bold text-text-primary'
                : 'flex-1 pb-2 text-center text-text-muted'
            }
          >
            熱門
          </button>
          <button
            type="button"
            onClick={() => setSortMode('latest')}
            className={
              sortMode === 'latest'
                ? 'flex-1 border-b-2 border-accent-amber pb-2 text-center font-bold text-text-primary'
                : 'flex-1 pb-2 text-center text-text-muted'
            }
          >
            最新
          </button>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-text-muted">
            目前沒有這個分類的文章
          </div>
        ) : null}

        {filteredPosts.map((post) => {
          const interaction = postInteractions[post.id];
          return (
            <article
              key={post.id}
              className="mb-4 overflow-hidden rounded-[18px] border border-border-default bg-white shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
            >
              <Link href={`/posts/${post.id}`} className="block p-4 pb-0">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlaceholderAvatar size="md" accent={post.accent} bordered />
                    <div>
                      <div className="text-[14px] font-semibold text-text-primary">
                        {post.author}
                      </div>
                      <div className="text-[12px] text-text-muted">
                        {formatRelativeTime(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  {post.badge ? <Badge variant="gold">{post.badge}</Badge> : null}
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="gold">{post.tag}</Badge>
                  <span className="text-[15px] font-bold text-text-primary">{post.title}</span>
                </div>
                <p className="mb-3 text-[13px] leading-5 text-text-muted">{post.body}</p>

                {post.photos.length > 0 ? (
                  <>
                    {/* Color blocks stand in for the post's uploaded photo(s) until real media exists. */}
                    <div className="mb-1 flex gap-2">
                      {post.photos.map((photo, index) => (
                        <div
                          key={index}
                          className={`rounded-[12px] ${post.photos.length === 1 ? 'h-[164px] flex-1' : 'h-[96px] flex-1'}`}
                          style={{ background: photo }}
                        />
                      ))}
                    </div>
                    <div className="mb-3 text-[11px] text-text-muted italic">
                      照片示意（尚未串接真實圖片）
                    </div>
                  </>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {post.chips.map((chip) => (
                    <Badge key={chip} variant="neutral">
                      {chip}
                    </Badge>
                  ))}
                </div>
              </Link>

              <div className="flex items-center gap-4 p-4 pt-3 text-text-muted">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  aria-pressed={interaction.liked}
                  className={`flex items-center gap-1 text-[13px] ${interaction.liked ? 'text-accent-amber' : ''}`}
                >
                  <HeartIcon filled={interaction.liked} />
                  {interaction.likes}
                </button>
                <Link
                  href={`/posts/${post.id}/comments`}
                  className="flex items-center gap-1 text-[13px]"
                >
                  <CommentIcon />
                  {post.comments}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleBookmark(post.id)}
                  aria-label="收藏"
                  aria-pressed={interaction.bookmarked}
                  className={`ml-auto ${interaction.bookmarked ? 'text-accent-amber' : ''}`}
                >
                  <BookmarkIcon filled={interaction.bookmarked} />
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {menuOpen ? (
        <div
          className="fixed inset-y-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 bg-[rgba(64,58,50,0.42)]"
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
              {menuLinkGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {groupIndex > 0 ? <div className="my-3 border-t border-border-default" /> : null}
                  {group.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left text-[14.5px] font-medium text-text-primary hover:bg-white/80"
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {checkinOpen ? (
        <div
          className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-[rgba(64,58,50,0.45)] p-4"
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
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setCheckinOpen(false)}
              className="w-full"
            >
              知道了
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
