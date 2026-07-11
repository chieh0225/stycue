'use client';

import {
  Bookmark,
  ChevronDown,
  ClipboardList,
  Coins,
  FileText,
  Heart,
  Menu,
  MessageCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlaceholderAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { TopBar } from '@/components/ui/top-bar';

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
    { label: '追蹤中', icon: Users, href: '/profile/following' },
    { label: '已收藏', icon: Bookmark, href: '/profile/favorites' },
  ],
  [
    { label: '管理委託', icon: ClipboardList, href: '/profile/commissions/sent' },
    { label: '積分商城', icon: Coins, href: '/profile/points' },
    { label: '免責聲明', icon: FileText, href: '/disclaimer' },
  ],
] as const;

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
      <TopBar
        left={
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="開啟選單"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        }
        title="StyCue"
      />

      <section className="px-4 pt-5 pb-7">
        <div className="mb-3 text-headline-sm font-bold text-text-primary">人氣穿搭</div>
        <div className="-mx-1 flex gap-3 overflow-x-auto pb-2">
          {trendingItems.map((item) => (
            <Card key={item.id} variant="trending" className="w-43 flex-none">
              <Link href={`/posts/${item.id}`} className="block">
                <div className="relative">
                  <div
                    className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md text-label-md font-bold text-white ${item.accent}`}
                  >
                    {item.rank}
                  </div>
                  <div
                    className="flex h-54 items-center justify-center"
                    style={{ background: item.gradient }}
                  >
                    <span className="rounded-md bg-white/70 px-2 py-1 text-label-md font-medium text-text-primary">
                      {item.title}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between px-3 py-3">
                <div className="flex items-center gap-2">
                  <PlaceholderAvatar size="sm" accent={item.accent} />
                  <div>
                    <div className="text-label-md font-semibold text-text-primary">
                      {item.author}
                    </div>
                    <div className="text-label-md text-text-muted">{item.meta}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTrendingBookmark(item.id)}
                  aria-label="收藏"
                  aria-pressed={trendingBookmarks[item.id]}
                  className={trendingBookmarks[item.id] ? 'text-accent-amber' : 'text-text-muted'}
                >
                  <Bookmark
                    fill={trendingBookmarks[item.id] ? 'currentColor' : 'none'}
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-headline-sm font-bold text-text-primary">全部文章</div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-expanded={filterOpen}
              className="flex items-center gap-1 rounded-full border border-border-default bg-white px-3 py-2 text-label-md font-medium text-text-primary shadow-card"
            >
              {selectedFilter}
              <ChevronDown
                className={`h-3 w-3 text-text-muted transition-transform ${filterOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {filterOpen ? (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
                <div className="absolute top-full right-0 z-40 mt-2 w-max min-w-full overflow-hidden rounded-card border border-border-default bg-white shadow-card">
                  {postFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setFilterOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-label-md font-medium ${
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

        <div className="mb-4 flex border-b border-border-default text-label-md">
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
          <div className="py-10 text-center text-body-md text-text-muted">
            目前沒有這個分類的文章
          </div>
        ) : null}

        {filteredPosts.map((post) => {
          const interaction = postInteractions[post.id];
          return (
            <Card key={post.id} variant="post" className="mb-4">
              <Link href={`/posts/${post.id}`} className="block p-4 pb-0">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PlaceholderAvatar size="md" accent={post.accent} bordered />
                    <div>
                      <div className="text-label-md font-semibold text-text-primary">
                        {post.author}
                      </div>
                      <div className="text-label-md text-text-muted">
                        {formatRelativeTime(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  {post.badge ? <Badge variant="gold">{post.badge}</Badge> : null}
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="gold">{post.tag}</Badge>
                  <span className="text-body-lg font-bold text-text-primary">{post.title}</span>
                </div>
                <p className="mb-3 text-body-md leading-5 text-text-muted">{post.body}</p>

                {post.photos.length > 0 ? (
                  <>
                    {/* Color blocks stand in for the post's uploaded photo(s) until real media exists. */}
                    <div className="mb-1 flex gap-2">
                      {post.photos.map((photo, index) => (
                        <div
                          key={index}
                          className={`rounded-card ${post.photos.length === 1 ? 'h-41 flex-1' : 'h-24 flex-1'}`}
                          style={{ background: photo }}
                        />
                      ))}
                    </div>
                    <div className="mb-3 text-label-md text-text-muted italic">
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
                  className={`flex items-center gap-1 text-label-md ${interaction.liked ? 'text-accent-amber' : ''}`}
                >
                  <Heart fill={interaction.liked ? 'currentColor' : 'none'} className="h-4 w-4" />
                  {interaction.likes}
                </button>
                <Link
                  href={`/posts/${post.id}/comments`}
                  className="flex items-center gap-1 text-label-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  {post.comments}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleBookmark(post.id)}
                  aria-label="收藏"
                  aria-pressed={interaction.bookmarked}
                  className={`ml-auto ${interaction.bookmarked ? 'text-accent-amber' : ''}`}
                >
                  <Bookmark
                    fill={interaction.bookmarked ? 'currentColor' : 'none'}
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </Card>
          );
        })}
      </section>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="gap-0 bg-secondary p-5 shadow-[4px_0_20px_rgba(64,58,50,0.18)] data-[side=left]:left-[max(0px,calc(50%-14rem))] data-[side=left]:w-65"
        >
          <div className="mb-5 flex items-center justify-between">
            <SheetTitle>快速瀏覽</SheetTitle>
            <SheetClose
              render={
                <button
                  type="button"
                  aria-label="關閉選單"
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetClose>
          </div>
          <div className="space-y-2">
            {menuLinkGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 ? <Separator className="my-3" /> : null}
                {group.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex w-full items-center gap-4.5 rounded-[10px] px-3 py-4 text-left text-body-md font-medium text-foreground hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={checkinOpen}
        onOpenChange={(open) => {
          if (!open) setCheckinOpen(false);
        }}
      >
        <DialogContent showCloseButton className="p-7 text-center">
          <div className="mb-7 flex justify-center">
            <div className="flex h-13.5 w-13.5 items-center justify-center rounded-full border-4 border-gold bg-primary text-headline-md font-black text-primary-foreground">
              簽
            </div>
          </div>
          <DialogTitle className="mb-3">簽到完成</DialogTitle>
          <div className="mb-6 text-headline-md font-bold text-gold">獲得積分 + 50</div>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => setCheckinOpen(false)}
            className="w-full"
          >
            知道了
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
