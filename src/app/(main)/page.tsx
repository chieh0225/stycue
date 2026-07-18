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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { TopBar } from '@/components/ui/top-bar';
import {
  favoriteCommission,
  favoritePost,
  unfavoriteCommission,
  unfavoritePost,
} from '@/lib/favorite-api';
import { getHomepageFeed } from '@/lib/homepage-api';
import { likeCommission, likePost, unlikeCommission, unlikePost } from '@/lib/like-api';
import { claimDailyPoints, getPointTransactions } from '@/lib/points-api';
import type { HomepageFilter, HomepageItemResponse } from '@/types/homepage';

// POST /api/points/daily returns this exact message only when the call just
// created today's claim; a same-day repeat returns "今日已領取積分" instead.
// isClaimed is true in both cases, so message is the only reliable signal.
const DAILY_CLAIM_SUCCESS_MESSAGE = '每日積分領取成功';
// 註冊贈送 (registration bonus) — see PointTransactionType in src/types/points.ts
const SIGNUP_BONUS_TRANSACTION_TYPE = 1;

// The registration-bonus transaction's createdAt is UTC; claimDate from the
// daily claim response is a Taiwan-timezone date ("日期基準使用台灣時區" per
// the API docs). Converting to a Taiwan calendar date lets the two be
// compared directly, to show the bonus line only on the actual signup day.
function toTaiwanDateString(isoUtc: string): string {
  const utcDate = new Date(isoUtc.endsWith('Z') ? isoUtc : `${isoUtc}Z`);
  return new Date(utcDate.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

type Interaction = { liked: boolean; likes: number; bookmarked: boolean };

const ITEM_TYPE_LABEL: Record<HomepageItemResponse['itemType'], string> = {
  commission: '委託',
  postShare: '分享',
  postAsk: '提問',
};

// itemType → detail route. postShare and postAsk are both backed by the same
// /api/posts/{id} resource (postType just distinguishes them, see
// src/types/post.ts) and posts/share/[id]/page.tsx already renders either
// type correctly via POST_TYPE_LABEL, so both route there — postId and
// commissionId are different id spaces and must never be mixed.
function detailHref(item: HomepageItemResponse): string {
  return item.itemType === 'commission'
    ? `/posts/commissions/${item.itemId}`
    : `/posts/share/${item.itemId}`;
}

function formatRelativeTime(createdAt: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}分鐘`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}小時`;
  return `${Math.floor(diffHours / 24)}天`;
}

const postFilters = ['全部', '提問', '分享', '委託'] as const;
type PostFilter = (typeof postFilters)[number];

const FILTER_TO_API: Record<PostFilter, HomepageFilter> = {
  全部: 'all',
  提問: 'postAsk',
  分享: 'postShare',
  委託: 'commission',
};

function itemKey(item: HomepageItemResponse): string {
  return `${item.itemType}-${item.itemId}`;
}

const menuLinkGroups = [
  [
    { label: '追蹤中', icon: Users, href: '/profile/following' },
    { label: '已收藏', icon: Bookmark, href: '/profile/favorites' },
  ],
  [
    { label: '管理委託', icon: ClipboardList, href: '/profile/commissions/sent' },
    { label: '積分商城', icon: Coins, href: '/profile/points/mall' },
    { label: '免責聲明', icon: FileText, href: '/disclaimer' },
  ],
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinPoints, setCheckinPoints] = useState(0);
  // Only set when today's claim coincides with the registration-bonus
  // transaction — i.e. this is the user's very first day, not shown again.
  const [signupBonusPoints, setSignupBonusPoints] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<PostFilter>('全部');
  const [sortMode, setSortMode] = useState<'hot' | 'latest'>('hot');

  useEffect(() => {
    let active = true;
    // The backend POST is safe to call every visit (idempotent per day) and
    // distinguishes a fresh claim from a same-day repeat via `message` — that
    // string, not isClaimed (true in both cases), is what gates the dialog so
    // it only celebrates a genuinely new award, not every homepage visit.
    // Landing on the home page while unclaimed IS the check-in action.
    claimDailyPoints()
      .then((res) => {
        if (!active || !res.success || !res.data) return;
        if (res.message !== DAILY_CLAIM_SUCCESS_MESSAGE) return;
        setCheckinPoints(res.data.points);
        setCheckinOpen(true);

        const { claimDate } = res.data;
        getPointTransactions({ transactionType: SIGNUP_BONUS_TRANSACTION_TYPE, pageSize: 1 })
          .then((txRes) => {
            const signupTx = txRes.success ? txRes.data?.items[0] : undefined;
            if (active && signupTx && toTaiwanDateString(signupTx.createdAt) === claimDate) {
              setSignupBonusPoints(signupTx.amount);
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const [trending, setTrending] = useState<HomepageItemResponse[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getHomepageFeed({ sortBy: 'mostLikes', filter: 'all', pageSize: 10 })
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) setTrending(res.data.items);
      })
      .finally(() => {
        if (active) setTrendingLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const [feed, setFeed] = useState<HomepageItemResponse[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  useEffect(() => {
    let active = true;
    // Deferred to a microtask so the loading flag doesn't setState
    // synchronously within the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      if (active) setFeedLoading(true);
    });
    getHomepageFeed({
      sortBy: sortMode === 'hot' ? 'mostComments' : 'latest',
      filter: FILTER_TO_API[selectedFilter],
      pageSize: 20,
    })
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) setFeed(res.data.items);
      })
      .finally(() => {
        if (active) setFeedLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedFilter, sortMode]);

  const [postInteractions, setPostInteractions] = useState<Record<string, Interaction>>({});
  useEffect(() => {
    // Deferred to a microtask so the merge doesn't setState synchronously
    // within the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      setPostInteractions((prev) => {
        const next = { ...prev };
        for (const item of feed) {
          const key = itemKey(item);
          if (!next[key])
            next[key] = {
              liked: item.isLiked,
              likes: item.likeCount,
              bookmarked: item.isFavorited,
            };
        }
        return next;
      });
    });
  }, [feed]);

  const [trendingBookmarks, setTrendingBookmarks] = useState<Record<string, boolean>>({});
  useEffect(() => {
    // Same deferred-merge pattern as postInteractions above — trending is a
    // separate list/state so an item appearing in both keeps independent
    // local state, seeded from its own isFavorited on first load.
    queueMicrotask(() => {
      setTrendingBookmarks((prev) => {
        const next = { ...prev };
        for (const item of trending) {
          const key = itemKey(item);
          if (!(key in next)) next[key] = item.isFavorited;
        }
        return next;
      });
    });
  }, [trending]);

  async function toggleLike(item: HomepageItemResponse) {
    const key = itemKey(item);
    const wasLiked = postInteractions[key].liked;
    const next = !wasLiked;
    setPostInteractions((prev) => ({
      ...prev,
      [key]: { ...prev[key], liked: next, likes: prev[key].likes + (next ? 1 : -1) },
    }));

    const id = String(item.itemId);
    const result =
      item.itemType === 'commission'
        ? await (wasLiked ? unlikeCommission(id) : likeCommission(id))
        : await (wasLiked ? unlikePost(id) : likePost(id));
    if (!result.success || !result.data) {
      // Roll back the optimistic update on failure.
      setPostInteractions((prev) => ({
        ...prev,
        [key]: { ...prev[key], liked: wasLiked, likes: prev[key].likes + (wasLiked ? 1 : -1) },
      }));
      return;
    }
    // Reconcile with the backend's authoritative state.
    setPostInteractions((prev) => ({
      ...prev,
      [key]: { ...prev[key], liked: result.data!.isLiked, likes: result.data!.likeCount },
    }));
  }

  async function toggleBookmark(item: HomepageItemResponse) {
    const key = itemKey(item);
    const wasBookmarked = postInteractions[key].bookmarked;
    const next = !wasBookmarked;
    setPostInteractions((prev) => ({
      ...prev,
      [key]: { ...prev[key], bookmarked: next },
    }));

    const id = String(item.itemId);
    const result =
      item.itemType === 'commission'
        ? await (wasBookmarked ? unfavoriteCommission(id) : favoriteCommission(id))
        : await (wasBookmarked ? unfavoritePost(id) : favoritePost(id));
    if (!result.success || !result.data) {
      // Roll back the optimistic update on failure.
      setPostInteractions((prev) => ({
        ...prev,
        [key]: { ...prev[key], bookmarked: wasBookmarked },
      }));
      return;
    }
    // Reconcile with the backend's authoritative state.
    setPostInteractions((prev) => ({
      ...prev,
      [key]: { ...prev[key], bookmarked: result.data!.isFavorited },
    }));
  }

  async function toggleTrendingBookmark(item: HomepageItemResponse) {
    const key = itemKey(item);
    const wasBookmarked = trendingBookmarks[key] ?? item.isFavorited;
    const next = !wasBookmarked;
    setTrendingBookmarks((prev) => ({ ...prev, [key]: next }));

    const id = String(item.itemId);
    const result =
      item.itemType === 'commission'
        ? await (wasBookmarked ? unfavoriteCommission(id) : favoriteCommission(id))
        : await (wasBookmarked ? unfavoritePost(id) : favoritePost(id));
    if (!result.success || !result.data) {
      setTrendingBookmarks((prev) => ({ ...prev, [key]: wasBookmarked }));
      return;
    }
    setTrendingBookmarks((prev) => ({ ...prev, [key]: result.data!.isFavorited }));
  }

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
        {trendingLoading ? (
          <div className="py-6 text-center text-body-md text-text-muted">載入中…</div>
        ) : trending.length === 0 ? (
          <div className="py-6 text-center text-body-md text-text-muted">目前還沒有貼文</div>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto pb-2">
            {trending.map((item, index) => {
              const key = itemKey(item);
              const [cover] = item.images;
              return (
                <Card key={key} variant="trending" className="w-43 flex-none">
                  <Link href={detailHref(item)} className="block">
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-text-primary text-label-md font-bold text-white">
                        {index + 1}
                      </div>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend
                        <img
                          src={cover.url}
                          alt={item.title}
                          className="h-54 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-54 items-center justify-center bg-surface-soft">
                          <span className="rounded-md bg-white/70 px-2 py-1 text-label-md font-medium text-text-primary">
                            {item.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarFallback>
                          {item.author.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-label-md font-semibold text-text-primary">
                          {item.author.displayName}
                        </div>
                        <div className="flex items-center gap-1 text-label-md text-text-muted">
                          <Heart className="h-3 w-3" /> {item.likeCount}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTrendingBookmark(item)}
                      aria-label="收藏"
                      aria-pressed={trendingBookmarks[key]}
                      className={trendingBookmarks[key] ? 'text-accent-amber' : 'text-text-muted'}
                    >
                      <Bookmark
                        fill={trendingBookmarks[key] ? 'currentColor' : 'none'}
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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

        {feedLoading ? (
          <div className="py-10 text-center text-body-md text-text-muted">載入中…</div>
        ) : feed.length === 0 ? (
          <div className="py-10 text-center text-body-md text-text-muted">
            目前沒有這個分類的文章
          </div>
        ) : (
          feed.map((post) => {
            const key = itemKey(post);
            const interaction = postInteractions[key];
            if (!interaction) return null;
            return (
              <Card key={key} variant="post" className="mb-4">
                <Link href={detailHref(post)} className="block p-4 pb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="md" className="border-2 border-border">
                        <AvatarFallback>
                          {post.author.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-label-md font-semibold text-text-primary">
                          {post.author.displayName}
                        </div>
                        <div className="text-label-md text-text-muted">
                          {formatRelativeTime(post.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="gold">{ITEM_TYPE_LABEL[post.itemType]}</Badge>
                    <span className="text-body-lg font-bold text-text-primary">{post.title}</span>
                  </div>
                  <p className="mb-3 text-body-md leading-5 text-text-muted">
                    {post.contentPreview}
                  </p>

                  {post.images.length > 0 ? (
                    <div className="mb-3 flex gap-2">
                      {post.images.map((image) => (
                        // eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend
                        <img
                          key={image.imageId}
                          src={image.url}
                          alt={post.title}
                          className={`rounded-card object-cover ${post.images.length === 1 ? 'h-41 flex-1' : 'h-24 flex-1'}`}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag.tagId} variant="neutral">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </Link>

                <div className="flex items-center gap-4 p-4 pt-3 text-text-muted">
                  <button
                    type="button"
                    onClick={() => toggleLike(post)}
                    aria-pressed={interaction.liked}
                    className={`flex items-center gap-1 text-label-md ${interaction.liked ? 'text-accent-amber' : ''}`}
                  >
                    <Heart fill={interaction.liked ? 'currentColor' : 'none'} className="h-4 w-4" />
                    {interaction.likes}
                  </button>
                  <Link
                    href={`${detailHref(post)}/comments`}
                    className="flex items-center gap-1 text-label-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {post.commentCount}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(post)}
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
          })
        )}
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
        <DialogContent showCloseButton className="px-7 pt-9 pb-7 text-center">
          <div className="relative mx-auto mb-8 flex h-17.5 w-17.5 items-center justify-center">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              className="absolute -top-0.5 right-0.5 fill-primary stroke-gold"
              strokeWidth="1.5"
            >
              <path d="M12 2l2.5 7.7L22 12l-7.5 2.3L12 22l-2.5-7.7L2 12l7.5-2.3z" />
            </svg>
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              className="absolute bottom-0.5 -left-0.5 fill-sage"
            >
              <circle cx="12" cy="12" r="12" />
            </svg>
            <svg
              width="7"
              height="7"
              viewBox="0 0 24 24"
              className="absolute top-2 -left-1.5 fill-none stroke-sage"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            <div className="flex h-15.5 w-15.5 items-center justify-center rounded-full border-4 border-gold bg-primary text-headline-sm font-black text-primary-foreground shadow-[0_6px_16px_rgba(217,154,61,0.3)]">
              簽
            </div>
          </div>
          <DialogTitle className="text-display mb-3">簽到完成</DialogTitle>
          <div
            className={`text-title font-bold text-gold ${signupBonusPoints !== null ? 'mb-1' : 'mb-6'}`}
          >
            獲得積分 + {checkinPoints}
          </div>
          {signupBonusPoints !== null && (
            <div className="text-caption mb-6 text-text-muted">
              是初次註冊給予 {signupBonusPoints} 點積分
            </div>
          )}
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
