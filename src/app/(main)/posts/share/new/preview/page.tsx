'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopBar } from '@/components/ui/top-bar';
import { createPost } from '@/lib/post-api';
import { cn } from '@/lib/utils';
import type { PostType } from '@/types/post';
import { getAuthedUser } from '../../../../../auth';
import {
  DRAFT_STORAGE_KEY,
  TITLE_MAX_LENGTH,
  postTypes,
  emptyDraft,
  clearDraftState,
  type Draft,
} from '../draft';

// Only '分享' and '提問' post here — '委託' is a different flow entirely
// (posts/commissions/new) and is never actually selected on this page.
const POST_TYPE_TO_BACKEND: Record<string, PostType> = {
  分享: 'share',
  提問: 'question',
};

export default function NewSharePostPreviewPage() {
  const router = useRouter();
  const [form, setForm] = useState<Draft>(emptyDraft);
  const [draftTags, setDraftTags] = useState<{ tagId: number; name: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Read from localStorage client-side only, so it starts null instead of a
  // placeholder that would flash before the real nickname lands.
  const [nickName, setNickName] = useState<string | null>(null);
  useEffect(() => {
    // Deferred to a microtask so this doesn't setState synchronously within
    // the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      setNickName(getAuthedUser()?.nickName ?? null);
    });
  }, []);

  const {
    title,
    description,
    postType,
    outfitStyle,
    outfitOccasion,
    outfitDate,
    outfitLocation,
    photos,
  } = form;

  // Auto-grow to fit the full text when expanded so it never needs its own
  // scrollbar; collapsed mode keeps the fixed row clamp instead.
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
      .then((data: { tags: { tagId: number; name: string }[] }) => setDraftTags(data.tags))
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
      router.replace('/posts/share/new');
    }
  }, [loaded, title, router]);

  function removeDraftTag(tagId: number) {
    const next = draftTags.filter((t) => t.tagId !== tagId);
    setDraftTags(next);
    fetch('/api/posts/draft-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: next }),
    }).catch(() => {});
  }

  async function confirmSubmit() {
    const backendPostType = POST_TYPE_TO_BACKEND[postType];
    if (!backendPostType) {
      setSubmitError('目前僅支援分享文與提問文，請返回編輯選擇正確的類型');
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await createPost({
        title,
        content: description,
        postType: backendPostType,
        outfitStyle: outfitStyle.trim() || undefined,
        outfitOccasion: outfitOccasion.trim() || undefined,
        outfitDate: outfitDate || undefined,
        outfitLocation: outfitLocation.trim() || undefined,
        imageIds: photos.map((photo) => photo.imageId),
        tagIds: draftTags.map((tag) => tag.tagId),
      });
      if (!result.success || !result.data) {
        setSubmitError(result.message || '發表失敗，請稍後再試');
        return;
      }

      clearDraftState();
      router.push(`/posts/share/${result.data.postId}`);
    } catch {
      setSubmitError('無法連線到伺服器，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded || !title.trim()) return null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      {/* Header */}
      <TopBar
        left={
          <Link href="/posts/share/new" className="text-label-md text-muted-foreground">
            返回編輯
          </Link>
        }
        title="確認發文內容"
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
              className="flex cursor-pointer items-center gap-1 rounded-md bg-gold-soft px-2.25 py-0.75 text-label-md font-bold text-accent-amber"
            >
              {postType}
              <ChevronDown
                className={`h-2.5 w-2.5 transition-transform ${typeMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {typeMenuOpen ? (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTypeMenuOpen(false)} />
                <div className="absolute top-full left-0 z-40 mt-2 w-max overflow-hidden rounded-xl border border-border-default bg-white shadow-card">
                  {postTypes
                    .filter((type) => type !== '委託')
                    .map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, postType: type }));
                          setTypeMenuOpen(false);
                        }}
                        className={`block w-full cursor-pointer px-4 py-2.5 text-left text-label-md font-medium ${
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
            className="flex-1 resize-none overflow-hidden bg-transparent text-headline-sm font-bold text-text-primary placeholder-text-muted outline-none"
          />
        </div>

        {/* Author row (not part of the entered content — shown for context only) */}
        <div className="mb-4.5 flex items-center gap-2.5">
          <Avatar size="xl">
            <AvatarFallback>{(nickName ?? '').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-label-md font-bold text-text-primary">{nickName}</span>
        </div>

        <Separator className="mb-4.5" />

        {/* Body text */}
        <div className="mb-5.5">
          <textarea
            ref={descriptionRef}
            rows={4}
            value={description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="分享你的穿搭故事、心得或想法..."
            className={`w-full resize-none bg-transparent text-body-lg leading-[1.8] text-text-primary placeholder-text-muted outline-none ${
              descriptionExpanded ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
          />
          <button
            type="button"
            onClick={() => setDescriptionExpanded((expanded) => !expanded)}
            className="mt-1 flex cursor-pointer items-center gap-1 text-label-md font-semibold text-accent-amber"
          >
            {descriptionExpanded ? '收合內文' : '展開全文'}
            <ChevronDown
              className={`h-2.5 w-2.5 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* 圖片 */}
        {photos.length > 0 ? (
          <div className="mb-5.5 flex flex-wrap gap-2">
            {photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend
              <img
                key={photo.imageId}
                src={photo.url}
                alt=""
                className="h-24 w-24 flex-shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        ) : null}

        {/* 標籤 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">標籤</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {draftTags.length === 0 ? (
            <Link
              href="/posts/share/new/tags"
              prefetch={false}
              className="rounded-full border border-dashed border-border-default px-3.5 py-1.75 text-label-md text-text-muted"
            >
              + 選擇標籤
            </Link>
          ) : (
            <>
              {draftTags.map((tag) => (
                <span
                  key={tag.tagId}
                  className="flex items-center gap-1 rounded-full border border-border-default bg-muted px-3.5 py-1.75 text-label-md text-text-primary"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeDraftTag(tag.tagId)}
                    aria-label={`移除標籤 ${tag.name}`}
                    className="cursor-pointer text-text-muted"
                  >
                    ×
                  </button>
                </span>
              ))}
              <Link
                href="/posts/share/new/tags"
                prefetch={false}
                aria-label="新增標籤"
                className="flex items-center justify-center rounded-full border border-dashed border-border-default px-3 py-1.75 text-label-md text-text-muted"
              >
                +
              </Link>
            </>
          )}
        </div>

        {/* 穿搭資訊 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">穿搭資訊</h2>
        <Card variant="info" className="mb-5.5 p-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-text-tertiary">穿搭風格</span>
              <input
                type="text"
                value={outfitStyle}
                onChange={(e) => setForm((prev) => ({ ...prev, outfitStyle: e.target.value }))}
                placeholder="例如：韓系簡約"
                className="bg-transparent text-body-md font-bold text-text-primary placeholder-text-muted outline-none placeholder:font-normal"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-text-tertiary">穿搭場合</span>
              <input
                type="text"
                value={outfitOccasion}
                onChange={(e) => setForm((prev) => ({ ...prev, outfitOccasion: e.target.value }))}
                placeholder="例如：日常外出"
                className="bg-transparent text-body-md font-bold text-text-primary placeholder-text-muted outline-none placeholder:font-normal"
              />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-label-md text-text-tertiary">穿搭日期</span>
              <input
                type="date"
                value={outfitDate}
                onChange={(e) => setForm((prev) => ({ ...prev, outfitDate: e.target.value }))}
                className="w-fit cursor-pointer bg-transparent text-body-md font-bold text-text-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-text-tertiary">穿搭地點</span>
              <input
                type="text"
                value={outfitLocation}
                onChange={(e) => setForm((prev) => ({ ...prev, outfitLocation: e.target.value }))}
                placeholder="例如：台灣・高雄"
                className="bg-transparent text-body-md font-bold text-text-primary placeholder-text-muted outline-none placeholder:font-normal"
              />
            </div>
          </div>
        </Card>
        <p className="-mt-3.5 mb-5.5 text-label-md text-text-muted">
          穿搭資訊目前僅本機暫存，尚未隨貼文送出（等後端支援後再串接）。
        </p>

        <Separator className="mb-4" />

        {submitError && <p className="mt-4 text-xs text-red-500">{submitError}</p>}
      </div>

      {/* Bottom action bar */}
      <BottomBar fixed className="py-3.5">
        <Link
          href="/posts/share/new"
          className={cn(buttonVariants({ variant: 'secondary', size: 'md' }), 'flex-1')}
        >
          返回編輯
        </Link>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={confirmSubmit}
          disabled={submitting}
          className="flex-1"
        >
          確認送出
        </Button>
      </BottomBar>
    </div>
  );
}
