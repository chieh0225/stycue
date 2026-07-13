'use client';

import { Flame, History, Image, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const HOT_TAGS = ['韓系穿搭', '穿搭入門', '熱門單品'];

const SEARCH_RESULTS = [
  {
    id: 'post-1',
    tag: '分享',
    title: (
      <>
        秋天的第一套<span className="font-black">日系</span>裙裝
      </>
    ),
    date: '2026/06/12',
    excerpt: (
      <>
        簡單的裙裝配色，也能營造溫柔又清新的<span className="font-black text-[#403a32]">日系</span>
        感。
      </>
    ),
  },
  {
    id: 'post-2',
    tag: '提問',
    title: (
      <>
        <span className="font-black">日系</span> niko and ... 好穿嗎？
      </>
    ),
    date: '2026/06/09',
    excerpt: (
      <>
        想入手一件<span className="font-black text-[#403a32]">日系</span>
        品牌針織衫，想問版型偏合身還是寬鬆？
      </>
    ),
  },
  {
    id: 'post-3',
    tag: '分享',
    title: (
      <>
        BEAMS <span className="font-black">日系</span>穿搭分享
      </>
    ),
    date: '2026/06/03',
    excerpt: (
      <>
        把 BEAMS 的大地色系單品排列組合，整體很有
        <span className="font-black text-[#403a32]">日系</span>氣息。
      </>
    ),
  },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(true);
  const [hasSearchedState, setHasSearchedState] = useState(false);
  const [recentTags, setRecentTags] = useState([
    '日常穿搭',
    '秋季',
    '約會穿搭',
    '新手',
    '日系單品',
  ]);

  const hasSearched = hasSearchedState && query.trim().length > 0;
  const showBrowse = !hasSearched;

  function commitSearch(tag: string) {
    const others = recentTags.filter((t) => t !== tag);
    setQuery(tag);
    setHasSearchedState(true);
    setRecentTags([tag, ...others]);
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
            「{query}」的搜尋結果・{SEARCH_RESULTS.length} 篇文章
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
          SEARCH_RESULTS.map((result) => (
            <Card key={result.id} variant="post" className="mb-4 h-38.5">
              <Link
                href={`/posts/commissions/${result.id}`}
                className="flex h-full flex-col p-4 no-underline"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <Badge variant="gold">{result.tag}</Badge>
                  <span className="overflow-hidden text-body-lg font-bold text-ellipsis whitespace-nowrap text-text-primary">
                    {result.title}
                  </span>
                </div>
                <div className="mb-1 text-label-md text-text-muted">{result.date}</div>
                <div className="flex min-h-0 flex-1 items-start gap-3">
                  <div className="line-clamp-2 flex-1 text-body-md leading-[1.6] text-text-muted">
                    {result.excerpt}
                  </div>
                  <div className="flex h-17.5 w-17.5 shrink-0 items-center justify-center rounded-lg bg-border-subtle">
                    <Image className="h-6 w-6 text-[#b8af9e]" strokeWidth={1.8} />
                  </div>
                </div>
              </Link>
            </Card>
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
              {HOT_TAGS.map((tag) => (
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
