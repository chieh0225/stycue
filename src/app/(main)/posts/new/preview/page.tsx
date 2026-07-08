'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

  const { title, description, height, weight, age, selectedBudget, postType, points } = form;

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
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border-default bg-surface-soft px-4.5 py-4 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <Link href="/posts/new" className="text-sm text-text-muted">
          返回編輯
        </Link>
        <h1 className="text-base font-semibold text-text-primary">確認委託內容</h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto px-4.5 pt-5 pb-24">
        {/* Post type + title */}
        <div className="mb-4 flex items-start gap-2">
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setTypeMenuOpen((open) => !open)}
              aria-expanded={typeMenuOpen}
              className="flex items-center gap-1 rounded-md bg-[#FCEFDA] px-[9px] py-[3px] text-[13px] font-bold text-accent-amber"
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
                <div className="absolute top-full left-0 z-40 mt-2 w-max overflow-hidden rounded-xl border border-border-default bg-white shadow-[0_4px_12px_rgba(217,154,61,0.12)]">
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
        <div className="mb-[18px] flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-sm text-surface-base">
            M
          </div>
          <span className="text-base font-bold text-text-primary">Maple</span>
        </div>

        <div className="mb-[18px] h-px bg-border-default" />

        {/* Body text */}
        <div className="mb-[22px]">
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

        {/* 標籤 */}
        <h2 className="mb-3 text-base font-bold text-text-primary">標籤</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {draftTags.length === 0 ? (
            <Link
              href="/posts/new/tags"
              className="rounded-full border border-dashed border-border-default px-3.5 py-1.75 text-[13px] text-text-muted"
            >
              + 選擇標籤
            </Link>
          ) : (
            <>
              {draftTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full border border-border-default bg-[#FDF7E9] px-3.5 py-1.75 text-[13px] text-text-primary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeDraftTag(tag)}
                    aria-label={`移除標籤 ${tag}`}
                    className="text-text-muted"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <Link
                href="/posts/new/tags"
                aria-label="新增標籤"
                className="flex items-center justify-center rounded-full border border-dashed border-border-default px-3 py-1.75 text-[13px] text-text-muted"
              >
                +
              </Link>
            </>
          )}
        </div>

        {/* 委託條件 */}
        <h2 className="mb-3 text-base font-bold text-text-primary">委託條件</h2>
        <div className="mb-[22px] rounded-[14px] border border-border-default bg-[#FDF7E9] px-1 py-3.5">
          <div className="mb-3.5 grid grid-cols-3">
            <div className="flex flex-col items-center gap-[3px]">
              <span className="text-[11px] text-[#9A9080]">身高</span>
              <span className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
                  className="w-12 bg-transparent text-center text-[15px] font-bold text-text-primary outline-none"
                />
                <span className="text-[11px] font-medium text-[#9A9080]">cm</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-[3px] border-x border-border-default">
              <span className="text-[11px] text-[#9A9080]">體重</span>
              <span className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  value={weight}
                  onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                  className="w-12 bg-transparent text-center text-[15px] font-bold text-text-primary outline-none"
                />
                <span className="text-[11px] font-medium text-[#9A9080]">kg</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-[3px]">
              <span className="text-[11px] text-[#9A9080]">年齡</span>
              <span className="flex items-baseline gap-1">
                <input
                  type="number"
                  min="1"
                  value={age}
                  onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                  className="w-10 bg-transparent text-center text-[15px] font-bold text-text-primary outline-none"
                />
                <span className="text-[11px] font-medium text-[#9A9080]">歲</span>
              </span>
            </div>
          </div>
          <div className="mx-3.5 mb-3 h-px bg-border-default" />
          <div className="px-3.5">
            <span className="text-[12.5px] text-[#9A9080]">預算範圍</span>
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
        </div>

        {/* 積分 */}
        <div className="mb-[22px] flex flex-col gap-2">
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
                  <div className="absolute top-full left-0 z-40 mt-2 w-full overflow-hidden rounded-xl border border-border-default bg-white shadow-[0_4px_12px_rgba(217,154,61,0.12)]">
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
        <div className="mb-[18px] text-[13px] leading-[1.7] text-[#B8AF9E]">
          委託將於送出後開始計算，最長 7 天
          <br />
          委託者可給予青睞留言 {points} 積分
        </div>

        <div className="mb-4 h-px bg-border-default" />

        {/* Info box */}
        <div className="flex flex-col gap-2 rounded-lg bg-surface-soft p-4 text-xs text-text-muted">
          <p>
            <span aria-hidden>ⓘ</span> 委託送出後就不能變更了，請仔細確認內容是否有遺漏。
          </p>
        </div>
      </div>

      {/* Bottom action bar */}
      <footer className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 gap-3 border-t border-border-default bg-surface-soft px-4.5 py-3.5">
        <Link
          href="/posts/new"
          className="flex-1 rounded-lg border border-border-default py-3 text-center text-sm font-semibold text-text-primary"
        >
          返回編輯
        </Link>
        <button
          type="button"
          onClick={confirmSubmit}
          className="flex-1 rounded-lg bg-brand-primary py-3 text-sm font-semibold text-text-primary"
        >
          確認送出
        </button>
      </footer>
    </div>
  );
}
