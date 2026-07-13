'use client';

import { Calendar, ChevronDown, ImagePlus, Info, Plus, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { TopBar } from '@/components/ui/top-bar';
import { deleteImage } from '@/lib/image-api';
import { cn } from '@/lib/utils';
import {
  DRAFT_STORAGE_KEY,
  TITLE_MAX_LENGTH,
  budgetOptions,
  postTypes,
  pointsOptions,
  emptyDraft,
  type Draft,
} from './draft';

export default function NewPostPage() {
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [heightFocused, setHeightFocused] = useState(false);
  const [weightFocused, setWeightFocused] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);

  const [form, setForm] = useState<Draft>(emptyDraft);
  const { title, description, height, weight, age, selectedBudget, postType, points, photos } =
    form;
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [pointsMenuOpen, setPointsMenuOpen] = useState(false);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  // The title wraps across multiple lines instead of overflowing past the
  // screen edge, so it needs the same auto-grow treatment as the description.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  // Auto-grow to fit the full text when expanded so it never needs its own
  // scrollbar; collapsed mode keeps the fixed 3-row clamp instead.
  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;
    if (descriptionExpanded) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    } else {
      el.style.height = '';
    }
  }, [descriptionExpanded, description]);

  useEffect(() => {
    if (pathname !== '/posts/new') return;
    fetch('/api/posts/draft-tags')
      .then((res) => res.json())
      .then((data: { tags: string[] }) => setDraftTags(data.tags))
      .catch(() => {});
  }, [pathname]);

  function removeDraftTag(tag: string) {
    const next = draftTags.filter((t) => t !== tag);
    setDraftTags(next);
    fetch('/api/posts/draft-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: next }),
    }).catch(() => {});
  }

  useEffect(() => {
    // Deferred to a microtask so the restore doesn't setState synchronously
    // within the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      try {
        setForm({ ...emptyDraft, ...(JSON.parse(saved) as Partial<Draft>) });
      } catch {
        // Ignore a corrupted draft rather than blocking the page.
      }
    });
  }, []);

  function saveDraft() {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
  }

  async function removePhoto(imageId: number) {
    const response = await deleteImage(imageId);
    if (!response.success) return;
    setForm((prev) => {
      const next = { ...prev, photos: prev.photos.filter((photo) => photo.imageId !== imageId) };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-surface-base">
      {/* Header */}
      <TopBar
        left={
          <Link href="/" onClick={saveDraft} className="text-label-md text-muted-foreground">
            取消
          </Link>
        }
        title="發表委託"
        className="py-4"
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-4">
        {/* User row */}
        <div className="flex items-center gap-2">
          <Avatar size="xl">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <span className="text-label-md font-medium text-text-primary">Maple</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTypeMenuOpen((open) => !open)}
              aria-expanded={typeMenuOpen}
              className="flex items-center gap-1 rounded-full bg-surface-soft px-3 py-1 text-label-md font-semibold text-accent-amber"
            >
              {postType}
              <ChevronDown
                className={`h-2.5 w-2.5 transition-transform ${typeMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {typeMenuOpen ? (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTypeMenuOpen(false)} />
                <div className="absolute top-full left-0 z-40 mt-2 w-max min-w-full overflow-hidden rounded-xl border border-border-default bg-white shadow-card">
                  {postTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, postType: type }));
                        setTypeMenuOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-label-md font-medium ${
                        type === postType
                          ? 'bg-surface-soft text-accent-amber'
                          : 'text-text-primary hover:bg-surface-soft'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <textarea
              ref={titleRef}
              rows={1}
              value={title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.preventDefault();
              }}
              maxLength={TITLE_MAX_LENGTH}
              placeholder={titleFocused ? '' : '標題'}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              className="w-full resize-none overflow-hidden bg-transparent text-headline-sm font-bold text-text-primary placeholder-text-muted outline-none"
            />
            <span className="shrink-0 pt-0.5 text-label-md text-text-muted">
              {title.length}/{TITLE_MAX_LENGTH} 字
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <textarea
            ref={descriptionRef}
            rows={3}
            value={description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder={descriptionFocused ? '' : '描述你想要的需求\n( etc. 場景、風格... )'}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
            className={`w-full resize-none bg-transparent text-body-lg text-text-primary placeholder-text-muted outline-none ${
              descriptionExpanded ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
          />
          {description.trim() && (
            <button
              type="button"
              onClick={() => setDescriptionExpanded((expanded) => !expanded)}
              className="mt-1 flex items-center gap-1 text-label-md font-semibold text-accent-amber"
            >
              {descriptionExpanded ? '收合內文' : '展開全文'}
              <ChevronDown
                className={`h-2.5 w-2.5 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        {/* Upload / tags */}
        <div className="flex flex-col gap-2.5">
          <div>
            <Link
              href="/posts/new/photo"
              onClick={saveDraft}
              className="flex w-fit items-center gap-1 rounded-full border border-border-default px-3 py-1.5 text-label-md text-text-muted"
            >
              <ImagePlus className="h-3.5 w-3.5" aria-hidden /> 上傳圖片
              {photos.length > 0 ? ` (${photos.length}/9)` : ''}
            </Link>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.imageId}
                  className="relative aspect-square overflow-hidden rounded-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.imageId)}
                    aria-label="移除圖片"
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(64,58,50,0.55)] text-surface-base"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {draftTags.length === 0 ? (
              <Link
                href="/posts/new/tags"
                prefetch={false}
                className="flex items-center gap-1 rounded-full border border-border-default px-3 py-1.5 text-label-md text-text-muted"
              >
                <Tag className="h-3.5 w-3.5" aria-hidden /> 選擇標籤
              </Link>
            ) : (
              <>
                {draftTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full border border-border-default bg-surface-soft px-3 py-1.5 text-label-md text-text-primary"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeDraftTag(tag)}
                      aria-label={`移除標籤 ${tag}`}
                      className="text-text-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <Link
                  href="/posts/new/tags"
                  prefetch={false}
                  aria-label="新增標籤"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border-default text-label-md text-text-muted"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>

        <hr className="border-border-default" />

        {/* Body info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-body-lg font-semibold text-text-primary">身材資訊</h2>
            <span className="text-label-md text-red-500">*必填</span>
          </div>
          <input
            type="number"
            min="1"
            value={height}
            onChange={(event) => setForm((prev) => ({ ...prev, height: event.target.value }))}
            placeholder={heightFocused ? '' : '您的身高 (公分)'}
            onFocus={() => setHeightFocused(true)}
            onBlur={() => setHeightFocused(false)}
            className="w-full rounded-lg border border-border-default bg-transparent px-3 py-2 text-center text-body-md text-text-primary placeholder-text-muted outline-none"
          />
          <input
            type="number"
            min="1"
            value={weight}
            onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
            placeholder={weightFocused ? '' : '您的體重 (公斤)'}
            onFocus={() => setWeightFocused(true)}
            onBlur={() => setWeightFocused(false)}
            className="w-full rounded-lg border border-border-default bg-transparent px-3 py-2 text-center text-body-md text-text-primary placeholder-text-muted outline-none"
          />
          <input
            type="number"
            min="1"
            value={age}
            onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
            placeholder={ageFocused ? '' : '您的年齡'}
            onFocus={() => setAgeFocused(true)}
            onBlur={() => setAgeFocused(false)}
            className="w-full rounded-lg border border-border-default bg-transparent px-3 py-2 text-center text-body-md text-text-primary placeholder-text-muted outline-none"
          />
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-body-lg font-semibold text-text-primary">預算範圍</h2>
            <span className="text-label-md text-red-500">*必填</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {budgetOptions.map((option) => {
              const selected = option === selectedBudget;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, selectedBudget: option }))}
                  className={
                    selected
                      ? 'rounded-lg border-2 border-brand-primary bg-surface-soft px-3 py-2 text-label-md font-medium text-text-primary'
                      : 'rounded-lg border-2 border-border-default px-3 py-2 text-label-md text-text-muted transition-colors hover:border-brand-primary hover:bg-surface-soft hover:text-text-primary'
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Points */}
        <div className="flex flex-col gap-2">
          <h2 className="text-body-lg font-semibold text-text-primary">本次委託發佈積分</h2>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-accent-amber">
              ✦
            </span>
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setPointsMenuOpen((open) => !open)}
                aria-expanded={pointsMenuOpen}
                className="flex w-full items-center justify-between rounded-lg bg-surface-soft px-3.5 py-2 text-label-md font-semibold text-accent-amber"
              >
                {points}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${pointsMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {pointsMenuOpen ? (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setPointsMenuOpen(false)} />
                  <div className="absolute top-full left-0 z-40 mt-2 w-full overflow-hidden rounded-xl border border-border-default bg-white shadow-card">
                    {pointsOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, points: option }));
                          setPointsMenuOpen(false);
                        }}
                        className={`block w-full px-4 py-2.5 text-left text-label-md font-medium ${
                          option === points
                            ? 'bg-surface-soft text-accent-amber'
                            : 'text-text-primary hover:bg-surface-soft'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            <span className="text-label-md text-text-muted">點</span>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex flex-col gap-2">
          <h2 className="text-body-lg font-semibold text-text-primary">預設委託截止時間為 7 天</h2>
          <div className="flex items-center gap-2 rounded-lg bg-surface-soft px-3 py-2">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            <span className="text-body-md text-text-primary">2026 年 6 月 24 日</span>
          </div>
          <p className="text-label-md text-text-muted">送出後自動計算，無法編輯</p>
        </div>

        {/* Info box */}
        <div className="flex flex-col gap-2 rounded-lg bg-surface-soft p-4 text-label-md text-text-muted">
          <h3 className="text-body-md font-semibold text-text-primary">委託該怎麼寫呢？</h3>
          <p>
            <Info className="inline h-3 w-3" aria-hidden />{' '}
            委託送出後就不能變更了，請仔細確認內容是否有遺漏，將會根據每次提供的積分扣除 5
            點作為平台手續費。
          </p>
          <p>
            <Info className="inline h-3 w-3" aria-hidden />{' '}
            收取發文手續費，旨在避免非必要的發布、修改與取消操作，維持平台內容管理秩序。
          </p>
          <p>
            <Info className="inline h-3 w-3" aria-hidden /> 平台內每次委託最長 7
            天，委託者可以在此期限內選擇最佳留言給予積分。
          </p>
        </div>

        {/* Submit */}
        <Link
          href="/posts/new/preview"
          onClick={saveDraft}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
        >
          送出
        </Link>
      </div>
    </div>
  );
}
