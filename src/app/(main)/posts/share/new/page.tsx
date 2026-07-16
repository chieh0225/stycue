'use client';

import { ChevronDown, ImagePlus, Tag, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { TopBar } from '@/components/ui/top-bar';
import { cn } from '@/lib/utils';
import { DRAFT_STORAGE_KEY, TITLE_MAX_LENGTH, postTypes, emptyDraft, type Draft } from './draft';
import { getAuthedUser } from '../../../../auth';

export default function NewSharePostPage() {
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [form, setForm] = useState<Draft>(emptyDraft);
  const { title, description, postType } = form;
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [draftTags, setDraftTags] = useState<{ tagId: number; name: string }[]>([]);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  // The title wraps across multiple lines instead of overflowing past the
  // screen edge, so it needs auto-grow (same treatment as
  // posts/commissions/new/page.tsx's title field).
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  // Auto-grow to fit the full text when expanded so it never needs its own
  // scrollbar; collapsed mode keeps the fixed row clamp instead (same
  // treatment as posts/commissions/new/page.tsx's description field).
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

  // Read from localStorage client-side only, same hydration concern as the
  // effects below, so it starts null instead of a placeholder that would
  // flash before the real nickname lands.
  const [nickName, setNickName] = useState<string | null>(null);
  useEffect(() => {
    // Deferred to a microtask so this doesn't setState synchronously within
    // the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      setNickName(getAuthedUser()?.nickName ?? null);
    });
  }, []);

  useEffect(() => {
    if (pathname !== '/posts/share/new') return;
    fetch('/api/posts/draft-tags')
      .then((res) => res.json())
      .then((data: { tags: { tagId: number; name: string }[] }) => setDraftTags(data.tags))
      .catch(() => {});
  }, [pathname]);

  function removeDraftTag(tagId: number) {
    const next = draftTags.filter((t) => t.tagId !== tagId);
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

  return (
    <div className="flex flex-1 flex-col bg-surface-base">
      {/* Header */}
      <TopBar
        left={
          <Link href="/" className="text-label-md text-text-muted">
            取消
          </Link>
        }
        title="發表文章"
        className="py-4"
      />

      <div className="flex flex-1 flex-col gap-6 px-4 py-4">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <Avatar size="xl">
            <AvatarFallback>{(nickName ?? '').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-label-md font-bold text-text-primary">{nickName}</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTypeMenuOpen((open) => !open)}
              aria-expanded={typeMenuOpen}
              className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-soft px-2.5 py-1.25 text-label-md text-text-primary"
            >
              {postType}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${typeMenuOpen ? 'rotate-180' : ''}`}
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
          <div className="flex items-start justify-between gap-2 border-b border-border-default pb-3">
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
            rows={4}
            value={description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder={descriptionFocused ? '' : '分享你的穿搭故事、心得或想法...'}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
            className={`w-full resize-none bg-transparent text-body-lg leading-[1.7] text-text-primary placeholder-text-muted outline-none ${
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
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/posts/share/new/photo"
              onClick={saveDraft}
              className="flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-soft px-3 py-2 text-label-md text-text-primary"
            >
              <ImagePlus className="h-4 w-4" aria-hidden /> 新增圖片
            </Link>
            <Link
              href="/posts/share/new/tags"
              prefetch={false}
              className="flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-soft px-3 py-2 text-label-md text-text-primary"
            >
              <Tag className="h-4 w-4" aria-hidden /> 選擇標籤
            </Link>
          </div>
          {draftTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {draftTags.map((tag) => (
                <span
                  key={tag.tagId}
                  className="flex items-center gap-1 rounded-full border border-border-default bg-surface-soft px-3 py-1.5 text-label-md text-text-primary"
                >
                  #{tag.name}
                  <button
                    type="button"
                    onClick={() => removeDraftTag(tag.tagId)}
                    aria-label={`移除標籤 ${tag.name}`}
                    className="text-text-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="border-border-default" />

        {/* Submit */}
        <Link
          href="/posts/share/new/preview"
          onClick={saveDraft}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
        >
          送出
        </Link>
      </div>
    </div>
  );
}
