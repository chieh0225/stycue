'use client';

import { Flame, History, Image, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FeedSkeleton from '@/components/skeletons/FeedSkeleton';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getSearchHistory, searchPosts } from '@/lib/search-api';
import { searchTags } from '@/lib/tag-api';
import type { HomepageItemResponse } from '@/types/homepage';
import { TAG_SOURCE } from '@/types/tag';
import { HomepageImage } from '../homepage-image';

const ITEM_TYPE_LABEL: Record<HomepageItemResponse['itemType'], string> = {
  commission: '委託',
  postShare: '分享',
  postAsk: '提問',
};

function detailHref(item: HomepageItemResponse): string {
  return item.itemType === 'commission'
    ? `/posts/commissions/${item.itemId}`
    : `/posts/share/${item.itemId}`;
}

function formatDate(createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [hasSearchedState, setHasSearchedState] = useState(false);
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [hotTags, setHotTags] = useState<string[]>([]);

  const [results, setResults] = useState<HomepageItemResponse[]>([]);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(false);

  const hasSearched = hasSearchedState && query.trim().length > 0;
  const showBrowse = !hasSearched;

  useEffect(() => {
    let active = true;
    getSearchHistory(5).then((res) => {
      if (active && res.success && res.data) setRecentTags(res.data.map((h) => h.keyword));
    });
    searchTags({ source: TAG_SOURCE.Popular, limit: 3 }).then((res) => {
      if (active && res.success && res.data) setHotTags(res.data.map((t) => t.name));
    });
    return () => {
      active = false;
    };
  }, []);

  async function commitSearch(tag: string) {
    const keyword = tag.trim();
    if (!keyword) return;

    setQuery(keyword);
    setHasSearchedState(true);
    setResultsLoading(true);
    setResultsError(false);

    const res = await searchPosts({ keyword, pageSize: 20 });
    if (res.success && res.data) {
      setResults(res.data.items);
      setResultsTotal(res.data.totalCount);
    } else {
      setResults([]);
      setResultsTotal(0);
      setResultsError(true);
    }
    setResultsLoading(false);

    // The backend records this search server-side, so re-fetch to reflect
    // its authoritative history rather than guessing the new order locally.
    const historyRes = await getSearchHistory(5);
    if (historyRes.success && historyRes.data) {
      setRecentTags(historyRes.data.map((h) => h.keyword));
    }
  }

  function handleCancel() {
    if (hasSearched) {
      router.push('/');
      return;
    }
    setQuery('');
    setHasSearchedState(false);
    setIsFocused(false);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header: search input + cancel */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border-subtle bg-secondary pt-5 pr-4.5 pb-3.5 pl-4.5">
        <div
          className={`flex flex-1 items-center gap-2 rounded-lg border bg-muted py-3 pr-3.5 pl-3.5 ${
            isFocused ? 'border-gold' : 'border-border-subtle'
          }`}
        >
          <Search className="h-4.5 w-4.5 shrink-0 text-[#9a9080]" strokeWidth={2} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHasSearchedState(false);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && query.trim().length > 0) {
                commitSearch(query.trim());
              }
            }}
            placeholder="請輸入關鍵字"
            className="min-w-0 flex-1 border-none bg-transparent text-body-md text-foreground outline-none"
          />
        </div>
        <span
          onClick={handleCancel}
          className="shrink-0 cursor-pointer text-label-md font-medium text-gold-dark"
        >
          取消
        </span>
      </div>

      {/* Result count */}
      {hasSearched && (
        <div className="shrink-0 px-4.5 pt-4 pb-1">
          <span className="text-label-md text-text-muted">
            「{query}」的搜尋結果・{resultsTotal} 篇文章
          </span>
        </div>
      )}

      {/* Scrollable content */}
      <div
        className={
          hasSearched
            ? 'flex-1 overflow-y-auto pt-3 pr-4.5 pb-6 pl-4.5'
            : 'flex-1 overflow-y-auto pt-6 pr-4.5 pb-6 pl-4.5'
        }
      >
        {hasSearched &&
          (resultsLoading ? (
            <FeedSkeleton />
          ) : resultsError ? (
            <div className="py-10 text-center text-body-md text-text-muted">
              搜尋時發生錯誤，請稍後再試
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-body-md text-text-muted">沒有符合的搜尋結果</div>
          ) : (
            results.map((item) => (
              <Card key={`${item.itemType}-${item.itemId}`} variant="post" className="mb-4 h-38.5">
                <Link href={detailHref(item)} className="flex h-full flex-col p-4 no-underline">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Badge variant="gold">{ITEM_TYPE_LABEL[item.itemType]}</Badge>
                    <span className="overflow-hidden text-body-lg font-bold text-ellipsis whitespace-nowrap text-text-primary">
                      {item.title}
                    </span>
                  </div>
                  <div className="mb-1 text-label-md text-text-muted">
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="flex min-h-0 flex-1 items-start gap-3">
                    <div className="line-clamp-2 flex-1 text-body-md leading-[1.6] text-text-muted">
                      {item.contentPreview}
                    </div>
                    {item.images[0] ? (
                      <HomepageImage
                        src={item.images[0].url}
                        alt={item.title}
                        className="h-17.5 w-17.5 shrink-0 rounded-lg"
                      />
                    ) : (
                      <div className="flex h-17.5 w-17.5 shrink-0 items-center justify-center rounded-lg bg-border-subtle">
                        <Image className="h-6 w-6 text-[#b8af9e]" strokeWidth={1.8} />
                      </div>
                    )}
                  </div>
                </Link>
              </Card>
            ))
          ))}

        {showBrowse && (
          <>
            {/* 最近搜尋 */}
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <History className="h-4 w-4 text-[#403a32]" strokeWidth={2} />
                <span className="text-body-lg font-bold text-foreground">最近搜尋</span>
              </div>
              <div
                onClick={() => setRecentTags([])}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-accent"
              >
                <Trash2 className="h-4.25 w-4.25 text-text-tertiary" strokeWidth={2} />
              </div>
            </div>

            {recentTags.length > 0 ? (
              <div className="mb-6.5 flex flex-wrap gap-2.5">
                {recentTags.map((tag) => (
                  <div
                    key={tag}
                    onClick={() => commitSearch(tag)}
                    className="flex cursor-pointer items-center justify-center rounded-md border border-sage/40 bg-sage/15 px-3 py-2"
                  >
                    <span className="text-label-md font-medium text-tag-green">{tag}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6.5 py-4.5">
                <span className="text-body-md text-text-muted">目前沒有搜尋紀錄</span>
              </div>
            )}

            {/* 熱門搜尋 */}
            <div className="mb-5.5 h-px bg-border" />
            <div className="mb-3.5 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-[#d99a3d]" strokeWidth={2} />
              <span className="text-body-lg font-bold text-foreground">熱門搜尋</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {hotTags.map((tag) => (
                <div
                  key={tag}
                  onClick={() => commitSearch(tag)}
                  className="flex cursor-pointer items-center justify-center rounded-md border border-sage/40 bg-sage/15 px-3 py-2"
                >
                  <span className="text-label-md font-medium text-tag-green">{tag}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
