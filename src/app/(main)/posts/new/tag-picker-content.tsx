'use client';

import { ArrowLeft, Plus, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { isAuthed } from '@/app/auth';
import { Button } from '@/components/ui/button';
import { createTags, searchTags } from '@/lib/tag-api';
import { TAG_CATEGORY, TAG_SOURCE, type TagCategoryValue, type TagResponse } from '@/types/tag';

const TAG_GROUPS: { title: string; category: TagCategoryValue; allowCustom: boolean }[] = [
  { title: '場合', category: TAG_CATEGORY.Occasion, allowCustom: true },
  { title: '風格', category: TAG_CATEGORY.Style, allowCustom: true },
  { title: '季節', category: TAG_CATEGORY.Season, allowCustom: false },
  { title: '配色', category: TAG_CATEGORY.Color, allowCustom: true },
  { title: '版型', category: TAG_CATEGORY.Fit, allowCustom: true },
];

const MAX_TAGS_PER_GROUP = 3;
const POPULAR_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function TagPickerContent({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  // Every tag object we've seen (popular/search/frequent/created), keyed by
  // name, so we can look up a selected tag's category without refetching it.
  const [tagMeta, setTagMeta] = useState<Record<string, TagResponse>>({});
  const [groupTags, setGroupTags] = useState<Record<number, TagResponse[]>>({});
  const [flatPopular, setFlatPopular] = useState<TagResponse[]>([]);
  const [myFrequent, setMyFrequent] = useState<TagResponse[] | null>(null);

  const [addingGroup, setAddingGroup] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);

  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TagResponse[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function mergeTagMeta(tags: TagResponse[]) {
    if (tags.length === 0) return;
    setTagMeta((prev) => {
      const next = { ...prev };
      for (const tag of tags) next[tag.name] = tag;
      return next;
    });
  }

  useEffect(() => {
    fetch('/api/posts/draft-tags')
      .then((res) => res.json())
      .then((data: { tags: string[] }) => setSelected(data.tags))
      .catch(() => {});
  }, []);

  useEffect(() => {
    for (const group of TAG_GROUPS) {
      searchTags({ source: TAG_SOURCE.Popular, tagCategory: group.category, limit: POPULAR_LIMIT })
        .then((res) => {
          const tags = res.data ?? [];
          mergeTagMeta(tags);
          setGroupTags((prev) => ({ ...prev, [group.category]: tags }));
        })
        .catch(() => {});
    }

    searchTags({ source: TAG_SOURCE.Popular, limit: POPULAR_LIMIT })
      .then((res) => {
        const tags = res.data ?? [];
        mergeTagMeta(tags);
        setFlatPopular(tags);
      })
      .catch(() => {});

    if (isAuthed()) {
      searchTags({ source: TAG_SOURCE.MyFrequent, limit: POPULAR_LIMIT })
        .then((res) => {
          if (!res.success) return;
          const tags = res.data ?? [];
          mergeTagMeta(tags);
          setMyFrequent(tags);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!searchActive) return;
    const trimmed = searchQuery.trim();
    const handle = setTimeout(
      () => {
        if (!trimmed) {
          setSearchResults(null);
          setSearchLoading(false);
          return;
        }
        setSearchLoading(true);
        searchTags({ source: TAG_SOURCE.Search, keyword: trimmed, limit: POPULAR_LIMIT })
          .then((res) => {
            const tags = res.data ?? [];
            mergeTagMeta(tags);
            setSearchResults(tags);
          })
          .catch(() => setSearchResults([]))
          .finally(() => setSearchLoading(false));
      },
      trimmed ? SEARCH_DEBOUNCE_MS : 0,
    );
    return () => clearTimeout(handle);
  }, [searchQuery, searchActive]);

  async function confirmAndClose() {
    await fetch('/api/posts/draft-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: selected }),
    }).catch(() => {});
    onClose();
  }

  function groupTitleForCategory(category: TagCategoryValue | null | undefined) {
    return TAG_GROUPS.find((group) => group.category === category)?.title;
  }

  function selectedCountInGroup(category: TagCategoryValue) {
    return selected.filter((name) => tagMeta[name]?.tagCategory === category).length;
  }

  function toggleTag(tag: TagResponse) {
    setSelected((prev) => {
      if (prev.includes(tag.name)) return prev.filter((name) => name !== tag.name);
      if (
        tag.tagCategory !== null &&
        selectedCountInGroup(tag.tagCategory) >= MAX_TAGS_PER_GROUP &&
        !prev.includes(tag.name)
      ) {
        return prev;
      }
      return [...prev, tag.name];
    });
  }

  async function confirmAddTag(group: (typeof TAG_GROUPS)[number], isBlur = false) {
    const value = newTagValue.trim();
    if (!value) {
      setAddingGroup(null);
      setNewTagValue('');
      setTagError(null);
      return;
    }
    if (isBlur) {
      // Blur means the user moved on rather than confirmed; drop it quietly
      // instead of leaving an unfocused input stuck mid-request.
      setAddingGroup(null);
      setNewTagValue('');
      setTagError(null);
      return;
    }

    setCreatingTag(true);
    setTagError(null);
    const res = await createTags([{ name: value, tagCategory: group.category }]).catch(() => null);
    setCreatingTag(false);

    const created = res?.data?.[0];
    if (!res?.success || !created) {
      setTagError(res?.message || '建立標籤失敗，請稍後再試');
      return;
    }

    mergeTagMeta([created]);
    setGroupTags((prev) => {
      const targetCategory = created.tagCategory ?? group.category;
      const existing = prev[targetCategory] ?? [];
      if (existing.some((tag) => tag.name === created.name)) return prev;
      return { ...prev, [targetCategory]: [...existing, created] };
    });
    setSelected((prev) => (prev.includes(created.name) ? prev : [...prev, created.name]));
    setAddingGroup(null);
    setNewTagValue('');
  }

  function exitSearch() {
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults(null);
  }

  const trimmedQuery = searchQuery.trim();
  const hasNoMatch =
    trimmedQuery.length > 0 && !searchLoading && (searchResults?.length ?? 0) === 0;

  function renderTagButton(tag: TagResponse, variant: 'default' | 'popular' = 'default') {
    const active = selected.includes(tag.name);
    const disabled =
      !active &&
      tag.tagCategory !== null &&
      selectedCountInGroup(tag.tagCategory) >= MAX_TAGS_PER_GROUP;
    const groupTitle = groupTitleForCategory(tag.tagCategory);
    const isPopular = variant === 'popular';
    return (
      <button
        key={tag.tagId}
        type="button"
        disabled={disabled}
        onClick={() => toggleTag(tag)}
        className={
          active
            ? 'flex items-baseline gap-1.5 rounded-full border border-brand-primary bg-brand-primary px-3.5 py-2'
            : disabled
              ? isPopular
                ? 'flex items-baseline gap-1.5 rounded-full border border-transparent bg-accent-amber/15 px-3.5 py-2 opacity-50'
                : 'flex items-baseline gap-1.5 rounded-full border border-border-default bg-white px-3.5 py-2 opacity-50'
              : isPopular
                ? 'flex items-baseline gap-1.5 rounded-full border border-transparent bg-accent-amber/15 px-3.5 py-2'
                : 'flex items-baseline gap-1.5 rounded-full border border-border-default bg-white px-3.5 py-2'
        }
      >
        <span
          className={`text-label-md font-bold ${isPopular ? 'text-accent-amber' : 'text-text-muted'}`}
        >
          #
        </span>
        <span className="text-label-md text-text-primary">{tag.name}</span>
        {groupTitle && (
          <span
            className={`text-label-md ${isPopular ? 'text-accent-amber/80' : 'text-text-muted'}`}
          >
            {groupTitle}
          </span>
        )}
      </button>
    );
  }

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
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          ) : (
            <h2 className="text-headline-sm font-bold text-text-primary">選擇標籤</h2>
          )}
          <button type="button" onClick={onClose} aria-label="關閉" className="text-text-primary">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {!searchActive && (
          <div className="flex items-center gap-2 rounded-lg bg-accent-amber/10 px-3 py-2.5">
            <span aria-hidden className="text-accent-amber">
              ✦
            </span>
            <span className="text-label-md font-semibold text-accent-amber">
              選擇標籤，讓文章更容易被搜尋與發現。
            </span>
          </div>
        )}

        <div
          onClick={() => searchInputRef.current?.focus()}
          className={`flex cursor-text items-center gap-2 rounded-lg border bg-surface-soft px-3.5 py-3 ${
            searchActive ? 'border-accent-amber' : 'border-border-default'
          }`}
        >
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setSearchActive(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋標籤"
            className="flex-1 bg-transparent text-body-md text-text-primary placeholder-text-muted outline-none"
          />
          <Search className="h-4 w-4 text-text-muted" aria-hidden />
        </div>
      </div>

      {searchActive ? (
        /* Search mode content */
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {trimmedQuery ? (
            hasNoMatch ? (
              <div className="flex flex-col items-center gap-1 py-6 text-center">
                <Search className="h-6 w-6 text-text-muted" aria-hidden />
                <p className="text-body-md font-semibold text-text-primary">
                  找不到「{trimmedQuery}」相關標籤
                </p>
                <p className="mb-2 text-label-md text-text-muted">試試看其他關鍵字</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {(searchResults ?? []).map((tag) => renderTagButton(tag))}
              </div>
            )
          ) : (
            <>
              {myFrequent && myFrequent.length > 0 && (
                <>
                  <h3 className="mb-3 text-body-lg font-bold text-text-primary">最近用過</h3>
                  <div className="mb-6 flex flex-wrap gap-2.5">
                    {myFrequent.map((tag) => renderTagButton(tag))}
                  </div>
                </>
              )}

              <h3 className="mb-3 text-body-lg font-bold text-text-primary">熱門標籤</h3>
              <div className="flex flex-wrap gap-2.5">
                {flatPopular.map((tag) => renderTagButton(tag, 'popular'))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Tag group browsing content */
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {selected.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-3 text-body-lg font-bold text-text-primary">
                已選標籤（點擊可取消）
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {selected.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelected((prev) => prev.filter((t) => t !== tag))}
                    className="flex items-center gap-1 rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-label-md font-medium text-text-primary"
                  >
                    {tag} <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
              <hr className="mt-5 border-border-default" />
            </div>
          )}
          {TAG_GROUPS.map((group) => {
            const tags = groupTags[group.category] ?? [];
            const selectedInGroup = selectedCountInGroup(group.category);
            const limitReached = selectedInGroup >= MAX_TAGS_PER_GROUP;
            return (
              <div key={group.title} className="mb-5">
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="text-body-lg font-bold text-text-primary">{group.title}</h3>
                  <span className="text-label-md text-text-muted">
                    {selectedInGroup}/{MAX_TAGS_PER_GROUP}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {tags.map((tag) => {
                    const active = selected.includes(tag.name);
                    const disabled = !active && limitReached;
                    return (
                      <button
                        key={tag.tagId}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleTag(tag)}
                        className={
                          active
                            ? 'rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-label-md font-medium text-text-primary'
                            : disabled
                              ? 'rounded-full border border-border-default bg-surface-soft px-5 py-2.5 text-label-md font-medium text-text-muted opacity-50'
                              : 'rounded-full border border-border-default bg-surface-soft px-5 py-2.5 text-label-md font-medium text-text-primary'
                        }
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                  {group.allowCustom &&
                    !limitReached &&
                    (addingGroup === group.title ? (
                      <input
                        autoFocus
                        type="text"
                        value={newTagValue}
                        disabled={creatingTag}
                        onChange={(e) => {
                          setNewTagValue(e.target.value);
                          setTagError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmAddTag(group);
                          if (e.key === 'Escape') {
                            setAddingGroup(null);
                            setNewTagValue('');
                            setTagError(null);
                          }
                        }}
                        onBlur={() => confirmAddTag(group, true)}
                        placeholder="輸入標籤"
                        className="w-28 rounded-full border border-brand-primary bg-surface-soft px-4 py-2.5 text-body-md text-text-primary outline-none disabled:opacity-50"
                      />
                    ) : (
                      <button
                        type="button"
                        aria-label={`新增${group.title}標籤`}
                        onClick={() => {
                          setAddingGroup(group.title);
                          setNewTagValue('');
                          setTagError(null);
                        }}
                        className="flex h-10.25 w-11 items-center justify-center rounded-full border border-dashed border-border-default bg-white text-text-muted"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ))}
                </div>
                {addingGroup === group.title && tagError && (
                  <p className="mt-2 text-label-md text-red-500">{tagError}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm bar */}
      <div className="px-5 pt-3.5 pb-6">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={confirmAndClose}
          className="w-full"
        >
          完成
        </Button>
      </div>
    </div>
  );
}
