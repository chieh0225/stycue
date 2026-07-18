'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TopBar } from '@/components/ui/top-bar';
import { updatePost } from '@/lib/post-api';
import type { PostType } from '@/types/post';

// Title/content/outfit-info only — images and tags stay exactly as they were
// (imageIds/tagIds are round-tripped unchanged), since editing those would
// need the same upload/tag-picker flow the "new post" composer uses and
// that's a bigger separate task.
export default function EditPostForm({
  postId,
  initialTitle,
  initialContent,
  postType,
  initialOutfitStyle,
  initialOutfitOccasion,
  initialOutfitDate,
  initialOutfitLocation,
  imageIds,
  tagIds,
}: {
  postId: string;
  initialTitle: string;
  initialContent: string;
  postType: PostType;
  initialOutfitStyle: string;
  initialOutfitOccasion: string;
  initialOutfitDate: string;
  initialOutfitLocation: string;
  imageIds: number[];
  tagIds: number[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [outfitStyle, setOutfitStyle] = useState(initialOutfitStyle);
  const [outfitOccasion, setOutfitOccasion] = useState(initialOutfitOccasion);
  const [outfitDate, setOutfitDate] = useState(initialOutfitDate);
  const [outfitLocation, setOutfitLocation] = useState(initialOutfitLocation);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const result = await updatePost(postId, {
      title: title.trim(),
      content: content.trim(),
      postType,
      outfitStyle: outfitStyle.trim() || undefined,
      outfitOccasion: outfitOccasion.trim() || undefined,
      outfitDate: outfitDate || undefined,
      outfitLocation: outfitLocation.trim() || undefined,
      imageIds,
      tagIds,
    });
    if (!result.success || !result.data) {
      setError(result.message || '更新失敗，請稍後再試');
      setSubmitting(false);
      return;
    }
    router.push(`/posts/share/${postId}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <TopBar
        left={
          <Link href={`/posts/share/${postId}`} aria-label="返回文章" className="text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
        title="編輯貼文"
        className="py-4"
      />

      <div className="flex-1 overflow-y-auto px-4.5 pt-5 pb-24">
        <div className="mb-5.5 flex flex-col gap-1.5">
          <span className="text-label-md text-text-tertiary">標題</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="輸入標題"
          />
        </div>

        <div className="mb-5.5 flex flex-col gap-1.5">
          <span className="text-label-md text-text-tertiary">內容</span>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={4000}
            placeholder="輸入內容"
            rows={8}
          />
        </div>

        <h2 className="mb-3 text-body-lg font-bold text-text-primary">穿搭資訊</h2>
        <Card variant="info" className="mb-5.5 p-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-text-tertiary">穿搭風格</span>
              <input
                type="text"
                value={outfitStyle}
                onChange={(e) => setOutfitStyle(e.target.value)}
                maxLength={50}
                placeholder="例如：韓系簡約"
                className="bg-transparent text-body-md font-bold text-text-primary placeholder-text-muted outline-none placeholder:font-normal"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-text-tertiary">穿搭場合</span>
              <input
                type="text"
                value={outfitOccasion}
                onChange={(e) => setOutfitOccasion(e.target.value)}
                maxLength={50}
                placeholder="例如：日常外出"
                className="bg-transparent text-body-md font-bold text-text-primary placeholder-text-muted outline-none placeholder:font-normal"
              />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-label-md text-text-tertiary">穿搭日期</span>
              <input
                type="date"
                value={outfitDate}
                onChange={(e) => setOutfitDate(e.target.value)}
                className="w-fit cursor-pointer bg-transparent text-body-md font-bold text-text-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-text-tertiary">穿搭地點</span>
              <input
                type="text"
                value={outfitLocation}
                onChange={(e) => setOutfitLocation(e.target.value)}
                maxLength={100}
                placeholder="例如：台灣・高雄"
                className="bg-transparent text-body-md font-bold text-text-primary placeholder-text-muted outline-none placeholder:font-normal"
              />
            </div>
          </div>
        </Card>

        {error ? <p className="mb-4 text-body-md text-destructive">{error}</p> : null}

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full"
        >
          {submitting ? '儲存中...' : '儲存'}
        </Button>
      </div>
    </div>
  );
}
