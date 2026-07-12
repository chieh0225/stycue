'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const HOT_TAGS = ['韓系穿搭', '穿搭入門', '熱門單品'];

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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9a9080"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pt-6 pr-4.5 pb-6 pl-4.5">
        {hasSearched && (
          <>
            <div className="mb-5 flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-[#403a32]">「{query}」的搜尋結果</span>
            </div>
            <div className="py-8 text-center">
              <span className="text-[13.5px] text-[#b8af9e]">顯示與「{query}」相關的文章</span>
            </div>
          </>
        )}

        {showBrowse && (
          <>
            {/* 最近搜尋 */}
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#403a32"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                <span className="text-[15px] font-bold text-[#403a32]">最近搜尋</span>
              </div>
              <div
                onClick={() => setRecentTags([])}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9a9080"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d99a3d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
              </svg>
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
