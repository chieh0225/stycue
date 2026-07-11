'use client';

import { Info, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopBar } from '@/components/ui/top-bar';
import {
  DRAFT_STORAGE_KEY,
  TITLE_MAX_LENGTH,
  budgetOptions,
  postTypes,
  pointsOptions,
  emptyDraft,
  type Draft,
} from '../draft';

export default function NewPostPreviewPage() {
  const router = useRouter();
  const [form, setForm] = useState<Draft>(emptyDraft);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [pointsMenuOpen, setPointsMenuOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const { title, description, height, weight, age, selectedBudget, postType, points, photos } =
    form;

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

  // The title wraps across multiple lines instead of overflowing past the
  // screen edge, so it needs the same auto-grow treatment as the description.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  useEffect(() => {
    // Deferred to a microtask so the restore doesn't setState synchronously
    // within the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        try {
          setForm({ ...emptyDraft, ...(JSON.parse(saved) as Partial<Draft>) });
        } catch {
          // Ignore a corrupted draft rather than blocking the page.
        }
      }
      setLoaded(true);
    });

    fetch('/api/posts/draft-tags')
      .then((res) => res.json())
      .then((data: { tags: string[] }) => setDraftTags(data.tags))
      .catch(() => {});
  }, []);

  // Edits made on this page flow straight back into the shared draft, so
  // "返回編輯" reopens the form with whatever was last changed here.
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
  }, [form, loaded]);

  useEffect(() => {
    if (loaded && !title.trim()) {
      router.replace('/posts/new');
    }
  }, [loaded, title, router]);

  function removeDraftTag(tag: string) {
    const next = draftTags.filter((t) => t !== tag);
    setDraftTags(next);
    fetch('/api/posts/draft-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: next }),
    }).catch(() => {});
  }

  async function confirmSubmit() {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postType,
        title,
        description,
        height,
        weight,
        age,
        budget: selectedBudget,
        points,
        tags: draftTags,
      }),
    });
    const { id } = (await res.json()) as { id: string };

    if (photos.length > 0) {
      await fetch(`/api/posts/${id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos }),
      });
    }

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    fetch('/api/posts/draft-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: [] }),
    }).catch(() => {});
    router.push(`/posts/${id}`);
  }

  if (!loaded || !title.trim()) return null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      {/* Header */}
      <TopBar
        left={
          <Link href="/posts/new" className="text-title leading-6 text-muted-foreground">
            返回編輯
          </Link>
        }
        title="確認委託內容"
        className="py-4"
      />

      <div className="flex-1 overflow-y-auto px-4.5 pt-5 pb-24">
        {/* Post type + title */}
        <div className="mb-4 flex items-start gap-2">
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setTypeMenuOpen((open) => !open)}
              aria-expanded={typeMenuOpen}
              className="flex items-center gap-1 rounded-md bg-gold-soft px-2.25 py-0.75 text-meta font-bold text-accent-amber"
            >
              {postType}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`h-2.5 w-2.5 transition-transform ${typeMenuOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {typeMenuOpen ? (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTypeMenuOpen(false)} />
                <div className="absolute top-full left-0 z-40 mt-2 w-max overflow-hidden rounded-xl border border-border-default bg-white shadow-card">
                  {postTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, postType: type }));
                        setTypeMenuOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-xs font-medium ${
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
          <textarea
            ref={titleRef}
            rows={1}
            value={title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            maxLength={TITLE_MAX_LENGTH}
            placeholder="標題"
            className="flex-1 resize-none overflow-hidden bg-transparent text-[19px] leading-[1.4] font-bold text-text-primary placeholder-text-muted outline-none"
          />
        </div>

        {/* Author row (not part of the entered content — shown for context only) */}
        <div className="mb-4.5 flex items-center gap-2.5">
          <Avatar size="xl">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <span className="text-base font-bold text-text-primary">Maple</span>
        </div>

        <Separator className="mb-4.5" />

        {/* Body text */}
        <div className="mb-5.5">
          <textarea
            ref={descriptionRef}
            rows={3}
            value={description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="描述你想要的需求"
            className={`w-full resize-none bg-transparent text-[15.5px] leading-[1.8] text-text-primary placeholder-text-muted outline-none ${
              descriptionExpanded ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
          />
          <button
            type="button"
            onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            className="mt-1 flex items-center gap-1 text-xs font-semibold text-accent-amber"
          >
            {descriptionExpanded ? '收合內文' : '展開全文'}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`h-2.5 w-2.5 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* 身形照片 */}
        {photos.length > 0 ? (
          <div className="mb-5.5 flex flex-wrap gap-2">
            {photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend
              <img
                key={photo.imageId}
                src={photo.url}
                alt="身形照片"
                className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        ) : null}

        {/* 標籤 */}
        <h2 className="mb-3 text-base font-bold text-text-primary">標籤</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {draftTags.length === 0 ? (
            <Link
              href="/posts/new/tags"
              className="rounded-full border border-dashed border-border-default px-3.5 py-1.75 text-meta text-text-muted"
            >
              + 選擇標籤
            </Link>
          ) : (
            <>
              {draftTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full border border-border-default bg-muted px-3.5 py-1.75 text-meta text-text-primary"
                >
                  {tag}
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
                aria-label="新增標籤"
                className="flex items-center justify-center rounded-full border border-dashed border-border-default px-3 py-1.75 text-meta text-text-muted"
              >
                +
              </Link>
            </>
          )}
        </div>

        {/* 委託條件 */}
        <h2 className="mb-3 text-base font-bold text-text-primary">委託條件</h2>
        <Card variant="info" className="mb-5.5 px-1 py-3.5">
          <div className="mb-3.5 grid grid-cols-3">
            <div className="flex flex-col items-center gap-0.75">
              <span className="text-[11px] text-text-tertiary">身高</span>
              <span className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
                  className="w-12 bg-transparent text-center text-name font-bold text-text-primary outline-none"
                />
                <span className="text-[11px] font-medium text-text-tertiary">cm</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.75 border-x border-border-default">
              <span className="text-[11px] text-text-tertiary">體重</span>
              <span className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  value={weight}
                  onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                  className="w-12 bg-transparent text-center text-name font-bold text-text-primary outline-none"
                />
                <span className="text-[11px] font-medium text-text-tertiary">kg</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.75">
              <span className="text-[11px] text-text-tertiary">年齡</span>
              <span className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  value={age}
                  onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                  className="w-10 bg-transparent text-center text-name font-bold text-text-primary outline-none"
                />
                <span className="text-[11px] font-medium text-text-tertiary">歲</span>
              </span>
            </div>
          </div>
          <Separator className="mx-3.5 mb-3 w-auto" />
          <div className="px-3.5">
            <span className="text-[12.5px] text-text-tertiary">預算範圍</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {budgetOptions.map((option) => {
                const isSelected = option === selectedBudget;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, selectedBudget: option }))}
                    className={
                      isSelected
                        ? 'rounded-lg border-2 border-brand-primary bg-white px-3 py-1.5 text-xs font-medium text-text-primary'
                        : 'rounded-lg border-2 border-border-default bg-white px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-brand-primary hover:bg-surface-soft hover:text-text-primary'
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 積分 */}
        <div className="mb-5.5 flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-primary">本次委託發佈積分</h2>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-accent-amber">
              ✦
            </span>
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setPointsMenuOpen((open) => !open)}
                aria-expanded={pointsMenuOpen}
                className="flex w-full items-center justify-between rounded-lg bg-surface-soft px-3.5 py-2 text-sm font-semibold text-accent-amber"
              >
                {points} 點
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`h-3 w-3 transition-transform ${pointsMenuOpen ? 'rotate-180' : ''}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
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
                        className={`block w-full px-4 py-2.5 text-left text-sm font-medium ${
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
          </div>
        </div>

        {/* 截止資訊 */}
        <div className="mb-4.5 text-meta leading-[1.7] text-text-placeholder">
          委託將於送出後開始計算，最長 7 天
          <br />
          委託者可給予青睞留言 {points} 積分
        </div>

        <Separator className="mb-4" />

        {/* Info box */}
        <div className="flex flex-col gap-2 rounded-lg bg-surface-soft p-4 text-xs text-text-muted">
          <p>
            <Info className="inline h-3 w-3" aria-hidden />{' '}
            委託送出後就不能變更了，請仔細確認內容是否有遺漏。
          </p>
        </div>
      </div>

      {/* Bottom action bar */}
      <BottomBar fixed className="py-3.5">
        <Link
          href="/posts/new"
          className="flex-1 rounded-lg border border-border py-3 text-center text-sm font-semibold text-foreground"
        >
          返回編輯
        </Link>
        <button
          type="button"
          onClick={confirmSubmit}
          className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          確認送出
        </button>
      </BottomBar>
    </div>
  );
}
