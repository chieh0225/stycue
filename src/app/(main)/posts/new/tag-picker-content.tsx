'use client';

import { useEffect, useState } from 'react';

const tagGroups = [
  { title: '場合', tags: ['上班', '日常', '約會', '面試', '婚禮'], allowCustom: true },
  {
    title: '風格',
    tags: ['日系', '韓系', '美式', '極簡', '街頭', '運動', '復古'],
    allowCustom: true,
  },
  { title: '季節', tags: ['春季', '夏季', '秋季', '冬季'], allowCustom: false },
  {
    title: '配色',
    tags: ['黑灰', '白米', '大地', '藍色系', '綠色系', '紅色系'],
    allowCustom: true,
  },
  { title: '版型', tags: ['修身', '寬鬆'], allowCustom: true },
];

const recentTags = [
  { name: '簡約', category: '風格' },
  { name: '黑色', category: '配色' },
  { name: '秋冬', category: '季節' },
  { name: '婚禮', category: '場合' },
];

const popularTags = [
  { name: '日常', category: '場合' },
  { name: '日系', category: '風格' },
  { name: '韓系', category: '風格' },
  { name: '大地', category: '色系' },
];

export default function TagPickerContent({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<Record<string, string[]>>({});
  const [addingGroup, setAddingGroup] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/posts/draft-tags')
      .then((res) => res.json())
      .then((data: { tags: string[] }) => setSelected(data.tags))
      .catch(() => {});
  }, []);

  async function confirmAndClose() {
    await fetch('/api/posts/draft-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: selected }),
    }).catch(() => {});
    onClose();
  }

  function toggleTag(tag: string) {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function confirmAddTag(groupTitle: string) {
    const value = newTagValue.trim();
    if (value) {
      setCustomTags((prev) => ({
        ...prev,
        [groupTitle]: [...(prev[groupTitle] ?? []), value],
      }));
      setSelected((prev) => [...prev, value]);
    }
    setAddingGroup(null);
    setNewTagValue('');
  }

  function exitSearch() {
    setSearchActive(false);
    setSearchQuery('');
  }

  function pickSuggestedTag(tag: string) {
    toggleTag(tag);
    exitSearch();
  }

  const allTagNames = tagGroups
    .flatMap((group) => [...group.tags, ...(customTags[group.title] ?? [])])
    .map((tag) => tag.toLowerCase());
  const trimmedQuery = searchQuery.trim();
  const hasNoMatch =
    trimmedQuery.length > 0 && !allTagNames.some((tag) => tag.includes(trimmedQuery.toLowerCase()));

  return (
    <div className="flex h-full flex-col rounded-t-2xl bg-surface-base">
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 pt-5 pb-3.5">
        <div className="flex items-center justify-between">
          {searchActive ? (
            <button
              type="button"
              onClick={exitSearch}
              aria-label="返回"
              className="text-text-primary"
            >
              ←
            </button>
          ) : (
            <h2 className="text-lg font-bold text-text-primary">選擇標籤</h2>
          )}
          <button type="button" onClick={onClose} aria-label="關閉" className="text-text-primary">
            ✕
          </button>
        </div>

        {!searchActive && (
          <div className="flex items-center gap-2 rounded-lg bg-accent-amber/10 px-3 py-2.5">
            <span aria-hidden className="text-accent-amber">
              ✦
            </span>
            <span className="text-xs font-semibold text-accent-amber">
              選擇標籤，讓文章更容易被搜尋與發現。
            </span>
          </div>
        )}

        <div
          className={`flex items-center gap-2 rounded-lg border bg-surface-soft px-3.5 py-3 ${
            searchActive ? 'border-accent-amber' : 'border-border-default'
          }`}
        >
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchActive(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋標籤"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
          />
          <span aria-hidden>🔍</span>
        </div>
      </div>

      {searchActive ? (
        /* Search mode content */
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {hasNoMatch && (
            <div className="flex flex-col items-center gap-1 py-6 text-center">
              <span aria-hidden className="text-2xl text-text-muted">
                🔍
              </span>
              <p className="text-sm font-semibold text-text-primary">
                找不到「{trimmedQuery}」相關標籤
              </p>
              <p className="mb-2 text-xs text-text-muted">試試看其他關鍵字，或從下方選擇標籤</p>
              <hr className="mt-2 w-full border-border-default" />
            </div>
          )}

          <h3 className="mb-3 text-base font-bold text-text-primary">最近用過</h3>
          <div className="mb-6 flex flex-wrap gap-2.5">
            {recentTags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => pickSuggestedTag(tag.name)}
                className="flex items-baseline gap-1.5 rounded-full border border-border-default bg-white px-3.5 py-2"
              >
                <span className="text-sm font-bold text-text-muted">#</span>
                <span className="text-sm text-text-primary">{tag.name}</span>
                <span className="text-xs text-text-muted">{tag.category}</span>
              </button>
            ))}
          </div>

          <h3 className="mb-3 text-base font-bold text-text-primary">熱門標籤</h3>
          <div className="flex flex-wrap gap-2.5">
            {popularTags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                onClick={() => pickSuggestedTag(tag.name)}
                className="flex items-baseline gap-1.5 rounded-full bg-accent-amber/15 px-3.5 py-2"
              >
                <span className="text-sm font-bold text-accent-amber">#</span>
                <span className="text-sm text-text-primary">{tag.name}</span>
                <span className="text-xs text-accent-amber/80">{tag.category}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Tag group browsing content */
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {tagGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <h3 className="mb-3 text-base font-bold text-text-primary">{group.title}</h3>
              <div className="flex flex-wrap gap-2.5">
                {[...group.tags, ...(customTags[group.title] ?? [])].map((tag) => {
                  const active = selected.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={
                        active
                          ? 'rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-sm font-medium text-text-primary'
                          : 'rounded-full border border-border-default bg-surface-soft px-5 py-2.5 text-sm font-medium text-text-primary'
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
                {group.allowCustom &&
                  (addingGroup === group.title ? (
                    <input
                      autoFocus
                      type="text"
                      value={newTagValue}
                      onChange={(e) => setNewTagValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmAddTag(group.title);
                        if (e.key === 'Escape') {
                          setAddingGroup(null);
                          setNewTagValue('');
                        }
                      }}
                      onBlur={() => confirmAddTag(group.title)}
                      placeholder="輸入標籤"
                      className="w-28 rounded-full border border-brand-primary bg-surface-soft px-4 py-2.5 text-sm text-text-primary outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label={`新增${group.title}標籤`}
                      onClick={() => {
                        setAddingGroup(group.title);
                        setNewTagValue('');
                      }}
                      className="flex h-10.25 w-11 items-center justify-center rounded-full border border-dashed border-border-default bg-white text-text-muted"
                    >
                      +
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm bar */}
      <div className="px-5 pt-3.5 pb-6">
        <button
          type="button"
          onClick={confirmAndClose}
          className="w-full rounded-lg bg-brand-primary py-3 text-sm font-bold text-text-primary"
        >
          完成
        </button>
      </div>
    </div>
  );
}
