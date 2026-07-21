'use client';

import { ArrowLeft, Plus, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createTags, searchTags } from '@/lib/tag-api';
import type { TagPickerInitialData } from '@/lib/tag-server';
import { TAG_CATEGORY, TAG_SOURCE, type TagCategoryValue, type TagResponse } from '@/types/tag';
import { DRAFT_STORAGE_KEY, emptyDraft, type Draft } from './draft';

const TAG_GROUPS: { title: string; category: TagCategoryValue; allowCustom: boolean }[] = [
  { title: '場合', category: TAG_CATEGORY.Occasion, allowCustom: true },
  { title: '風格', category: TAG_CATEGORY.Style, allowCustom: true },
  { title: '季節', category: TAG_CATEGORY.Season, allowCustom: false },
  { title: '配色', category: TAG_CATEGORY.Color, allowCustom: true },
  { title: '版型', category: TAG_CATEGORY.Fit, allowCustom: true },
];

// Shown per group only when the Popular search genuinely returns zero tags
// for that category. Picking one still resolves a real tagId via
// createTags — this is a suggestion list, not local-only data.
const FALLBACK_TAGS: Record<number, string[]> = {
  [TAG_CATEGORY.Occasion]: ['上班', '日常', '約會', '面試', '婚禮'],
  [TAG_CATEGORY.Style]: ['日系', '韓系', '美式', '極簡', '街頭', '運動', '復古'],
  [TAG_CATEGORY.Season]: ['春季', '夏季', '秋季', '冬季'],
  [TAG_CATEGORY.Color]: ['黑灰', '白米', '大地', '藍色系', '綠色系', '紅色系'],
  [TAG_CATEGORY.Fit]: ['修身', '寬鬆'],
};

const MAX_TAGS_PER_GROUP = 3;
const POPULAR_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function TagPickerContent({
  onClose,
  initialData,
  initialSelected,
  onConfirmSelected,
}: {
  onClose: () => void;
  initialData: TagPickerInitialData;
  // When provided (the edit-post flow, which has no localStorage draft to
  // read/write), these replace the default draft localStorage read/write used
  // by the new-post composer — see the effect and confirmAndClose below.
  initialSelected?: TagResponse[];
  onConfirmSelected?: (tags: TagResponse[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(
    () => initialSelected?.map((tag) => tag.name) ?? [],
  );
  // Every tag object we've seen (popular/search/frequent/created), keyed by
  // name, so we can look up a selected tag's category without refetching it.
  const [tagMeta, setTagMeta] = useState<Record<string, TagResponse>>(() => {
    const meta: Record<string, TagResponse> = {};
    for (const tags of Object.values(initialData.groupTags)) {
      for (const tag of tags) meta[tag.name] = tag;
    }
    for (const tag of initialData.flatPopular) meta[tag.name] = tag;
    for (const tag of initialData.myFrequent ?? []) meta[tag.name] = tag;
    for (const tag of initialSelected ?? []) meta[tag.name] = tag;
    return meta;
  });
  const [groupTags, setGroupTags] = useState<Record<number, TagResponse[]>>(initialData.groupTags);
  // Fixed at the server's first-render result; resolving a fallback chip
  // must not flip this off and hide the rest of the fallback list.
  const { usingFallback, flatPopular, myFrequent } = initialData;

  const [addingGroup, setAddingGroup] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  // Which group's fallback-chip click most recently failed, so tagError
  // renders under that group even when no custom-add input is open there.
  const [fallbackErrorGroup, setFallbackErrorGroup] = useState<string | null>(null);

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
    if (initialSelected) return;
    // Deferred to a microtask so this doesn't setState synchronously within
    // the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      try {
        const draft = { ...emptyDraft, ...(JSON.parse(saved) as Partial<Draft>) };
        mergeTagMeta(draft.tags.map((tag) => ({ ...tag, tagCategory: null, usageCount: null })));
        setSelected(draft.tags.map((tag) => tag.name));
      } catch {
        // Ignore a corrupted draft rather than blocking the picker.
      }
    });
    // Only ever needed on first mount, and initialSelected is fixed for the
    // lifetime of this component when the edit flow provides it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (onConfirmSelected) {
      onConfirmSelected(selected.map((name) => tagMeta[name]));
      onClose();
      return;
    }
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    let draft: Draft;
    try {
      draft = saved ? { ...emptyDraft, ...(JSON.parse(saved) as Partial<Draft>) } : emptyDraft;
    } catch {
      draft = emptyDraft;
    }
    const tags = selected.map((name) => ({ tagId: tagMeta[name].tagId, name }));
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...draft, tags }));
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

  // Resolves a name to a real tag (creating it, or getting the existing one
  // back if it already exists) and adds it to both the group's tag list and
  // the selection. Shared by the custom-tag input and the fallback chips.
  async function resolveAndSelectTag(group: (typeof TAG_GROUPS)[number], name: string) {
    const res = await createTags([{ name, tagCategory: group.category }]).catch(() => null);
    const created = res?.data?.[0];
    if (!res?.success || !created) {
      return { success: false as const, message: res?.message };
    }

    mergeTagMeta([created]);
    setGroupTags((prev) => {
      const targetCategory = created.tagCategory ?? group.category;
      const existing = prev[targetCategory] ?? [];
      if (existing.some((tag) => tag.name === created.name)) return prev;
      return { ...prev, [targetCategory]: [...existing, created] };
    });
    setSelected((prev) => (prev.includes(created.name) ? prev : [...prev, created.name]));
    return { success: true as const };
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
    const result = await resolveAndSelectTag(group, value);
    setCreatingTag(false);

    if (!result.success) {
      setTagError(result.message || '建立標籤失敗，請稍後再試');
      return;
    }
    setAddingGroup(null);
    setNewTagValue('');
  }

  async function toggleFallbackTag(group: (typeof TAG_GROUPS)[number], name: string) {
    if (selected.includes(name)) {
      setSelected((prev) => prev.filter((n) => n !== name));
      return;
    }
    if (selectedCountInGroup(group.category) >= MAX_TAGS_PER_GROUP) return;
    setFallbackErrorGroup(null);
    setTagError(null);
    const result = await resolveAndSelectTag(group, name);
    if (!result.success) {
      setFallbackErrorGroup(group.title);
      setTagError(result.message || '建立標籤失敗，請稍後再試');
    }
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
        className={`cursor-pointer disabled:cursor-not-allowed ${
          active
            ? 'flex items-baseline gap-1.5 rounded-full border border-brand-primary bg-brand-primary px-3.5 py-2'
            : disabled
              ? isPopular
                ? 'flex items-baseline gap-1.5 rounded-full border border-transparent bg-accent-amber/15 px-3.5 py-2 opacity-50'
                : 'flex items-baseline gap-1.5 rounded-full border border-border-default bg-white px-3.5 py-2 opacity-50'
              : isPopular
                ? 'flex items-baseline gap-1.5 rounded-full border border-transparent bg-accent-amber/15 px-3.5 py-2'
                : 'flex items-baseline gap-1.5 rounded-full border border-border-default bg-white px-3.5 py-2'
        }`}
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
              className="cursor-pointer text-text-primary"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          ) : (
            <h2 className="text-headline-sm font-bold text-text-primary">選擇標籤</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="cursor-pointer text-text-primary"
          >
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
                    className="flex cursor-pointer items-center gap-1 rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-label-md font-medium text-text-primary"
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
            const fallbackNames = usingFallback[group.category]
              ? (FALLBACK_TAGS[group.category] ?? []).filter(
                  (name) => !tags.some((tag) => tag.name === name),
                )
              : [];
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
                        className={`cursor-pointer disabled:cursor-not-allowed ${
                          active
                            ? 'rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-label-md font-medium text-text-primary'
                            : disabled
                              ? 'rounded-full border border-border-default bg-surface-soft px-5 py-2.5 text-label-md font-medium text-text-muted opacity-50'
                              : 'rounded-full border border-border-default bg-surface-soft px-5 py-2.5 text-label-md font-medium text-text-primary'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                  {fallbackNames.map((name) => {
                    const active = selected.includes(name);
                    const disabled = !active && limitReached;
                    return (
                      <button
                        key={name}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleFallbackTag(group, name)}
                        className={`cursor-pointer disabled:cursor-not-allowed ${
                          active
                            ? 'rounded-full border border-brand-primary bg-brand-primary px-5 py-2.5 text-label-md font-medium text-text-primary'
                            : disabled
                              ? 'rounded-full border border-border-default bg-surface-soft px-5 py-2.5 text-label-md font-medium text-text-muted opacity-50'
                              : 'rounded-full border border-border-default bg-surface-soft px-5 py-2.5 text-label-md font-medium text-text-primary'
                        }`}
                      >
                        {name}
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
                          setFallbackErrorGroup(null);
                        }}
                        className="flex h-10.25 w-11 cursor-pointer items-center justify-center rounded-full border border-dashed border-border-default bg-white text-text-muted"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ))}
                </div>
                {(addingGroup === group.title || fallbackErrorGroup === group.title) &&
                  tagError && <p className="mt-2 text-label-md text-red-500">{tagError}</p>}
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
