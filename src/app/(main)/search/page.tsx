'use client';

import { Flame, History, Image, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
      <div className="flex shrink-0 items-center gap-3 border-b border-[#f0e4c0] bg-[#fff9e8] pt-5 pr-4.5 pb-3.5 pl-4.5">
        <div
          className={`flex flex-1 items-center gap-2 rounded-lg border bg-[#fdf7e9] py-3 pr-3.5 pl-3.5 ${
            isFocused ? 'border-[#d99a3d]' : 'border-[#ede6d3]'
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
            className="min-w-0 flex-1 border-none bg-transparent text-[14px] text-[#403a32] outline-none"
          />
        </div>
        <span
          onClick={handleCancel}
          className="shrink-0 cursor-pointer text-[14px] font-medium text-[#835500]"
        >
          取消
        </span>
      </div>

      {/* Result count */}
      {hasSearched && (
        <div className="shrink-0 px-4.5 pt-4 pb-1">
          <span className="text-[13px] text-[#756c60]">
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
            <Link
              key={result.id}
              href={`/posts/${result.id}`}
              className="mb-4 flex h-38.5 flex-col rounded-lg border border-[#e5ddbf] bg-white p-4 no-underline shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span className="shrink-0 rounded-md bg-[#fcefda] px-1.75 py-0.5 text-[11px] font-bold text-[#d99a3d]">
                  {result.tag}
                </span>
                <span className="overflow-hidden text-[15px] font-semibold text-ellipsis whitespace-nowrap text-[#403a32]">
                  {result.title}
                </span>
              </div>
              <div className="mb-1 text-[12px] text-[#9a9080]">{result.date}</div>
              <div className="flex min-h-0 flex-1 items-start gap-3">
                <div className="line-clamp-2 flex-1 text-[14px] leading-[1.6] text-[#5a5248]">
                  {result.excerpt}
                </div>
                <div className="flex h-17.5 w-17.5 shrink-0 items-center justify-center rounded-lg bg-[#f0e4c0]">
                  <Image className="h-6 w-6 text-[#b8af9e]" strokeWidth={1.8} />
                </div>
              </div>
            </Link>
          ))}

        {showBrowse && (
          <>
            {/* 最近搜尋 */}
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <History className="h-4 w-4 text-[#403a32]" strokeWidth={2} />
                <span className="text-[15px] font-bold text-[#403a32]">最近搜尋</span>
              </div>
              <div
                onClick={() => setRecentTags([])}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full"
              >
                <Trash2 className="h-4.25 w-4.25 text-[#9a9080]" strokeWidth={2} />
              </div>
            </div>

            {recentTags.length > 0 ? (
              <div className="mb-6.5 flex flex-wrap gap-2.5">
                {recentTags.map((tag) => (
                  <div
                    key={tag}
                    onClick={() => commitSearch(tag)}
                    className="flex cursor-pointer items-center justify-center rounded-md border border-[rgba(169,184,142,0.4)] bg-[rgba(169,184,142,0.15)] px-3 py-2"
                  >
                    <span className="text-[12px] font-medium text-[#4e6b45]">{tag}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6.5 py-4.5">
                <span className="text-[13.5px] text-[#b8af9e]">目前沒有搜尋紀錄</span>
              </div>
            )}

            {/* 熱門搜尋 */}
            <div className="mb-5.5 h-px bg-[#e5ddbf]" />
            <div className="mb-3.5 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-[#d99a3d]" strokeWidth={2} />
              <span className="text-[15px] font-bold text-[#403a32]">熱門搜尋</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {HOT_TAGS.map((tag) => (
                <div
                  key={tag}
                  onClick={() => commitSearch(tag)}
                  className="flex cursor-pointer items-center justify-center rounded-md border border-[rgba(169,184,142,0.4)] bg-[rgba(169,184,142,0.15)] px-3 py-2"
                >
                  <span className="text-[12px] font-medium text-[#4e6b45]">{tag}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
