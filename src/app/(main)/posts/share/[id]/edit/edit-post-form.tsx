'use client';

import { ChevronLeft, ImagePlus, Plus, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TopBar } from '@/components/ui/top-bar';
import { deleteImage, uploadImage } from '@/lib/image-api';
import { DEFAULT_IMAGE_CATEGORY_ID, type ImageCategoryId } from '@/lib/image-categories';
import { updatePost } from '@/lib/post-api';
import type { TagPickerInitialData } from '@/lib/tag-server';
import type { ImageResponse } from '@/types/image';
import type { PostType } from '@/types/post';
import type { TagResponse } from '@/types/tag';
import TagPickerContent from '../../new/tag-picker-content';

const MAX_IMAGES = 9;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

type EditableImage = {
  imageId: number;
  url: string;
  status: 'uploaded' | 'uploading';
};

export default function EditPostForm({
  postId,
  initialTitle,
  initialContent,
  postType,
  initialOutfitStyle,
  initialOutfitOccasion,
  initialOutfitDate,
  initialOutfitLocation,
  initialImages,
  initialTags,
  tagPickerInitialData,
}: {
  postId: string;
  initialTitle: string;
  initialContent: string;
  postType: PostType;
  initialOutfitStyle: string;
  initialOutfitOccasion: string;
  initialOutfitDate: string;
  initialOutfitLocation: string;
  initialImages: ImageResponse[];
  initialTags: TagResponse[];
  tagPickerInitialData: TagPickerInitialData;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [outfitStyle, setOutfitStyle] = useState(initialOutfitStyle);
  const [outfitOccasion, setOutfitOccasion] = useState(initialOutfitOccasion);
  const [outfitDate, setOutfitDate] = useState(initialOutfitDate);
  const [outfitLocation, setOutfitLocation] = useState(initialOutfitLocation);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [images, setImages] = useState<EditableImage[]>(() =>
    initialImages.map((image) => ({ imageId: image.imageId, url: image.url, status: 'uploaded' })),
  );
  const [imageError, setImageError] = useState<string | null>(null);

  const [tags, setTags] = useState<TagResponse[]>(initialTags);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';

    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setImageError(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
      return;
    }
    const tooBig = picked.filter((file) => file.size > MAX_FILE_BYTES);
    const withinSize = picked.filter((file) => file.size <= MAX_FILE_BYTES).slice(0, room);
    setImageError(
      tooBig.length > 0
        ? `以下檔案超過 10MB，未加入：${tooBig.map((f) => f.name).join('、')}`
        : null,
    );

    for (const file of withinSize) {
      const tempId = -Date.now() - Math.random();
      const tempUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { imageId: tempId, url: tempUrl, status: 'uploading' }]);

      // Uploads run one at a time so they land in selection order.
      const result = await uploadImage('posts', file, DEFAULT_IMAGE_CATEGORY_ID as ImageCategoryId);
      URL.revokeObjectURL(tempUrl);
      if (!result.success || !result.data) {
        setImages((prev) => prev.filter((img) => img.imageId !== tempId));
        setImageError(result.message || '上傳失敗，請稍後再試');
        continue;
      }
      const uploaded = result.data;
      setImages((prev) =>
        prev.map((img) =>
          img.imageId === tempId
            ? { imageId: uploaded.imageId, url: uploaded.url, status: 'uploaded' as const }
            : img,
        ),
      );
    }
  }

  async function removeImage(imageId: number) {
    const result = await deleteImage(imageId);
    if (!result.success) {
      setImageError(result.message || '刪除圖片失敗，請稍後再試');
      return;
    }
    setImages((prev) => prev.filter((img) => img.imageId !== imageId));
  }

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
      imageIds: images.filter((img) => img.status === 'uploaded').map((img) => img.imageId),
      tagIds: tags.map((tag) => tag.tagId),
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

        <div className="mb-5.5 flex flex-col gap-2.5">
          <span className="text-label-md text-text-tertiary">圖片</span>
          {imageError ? <p className="text-label-md text-destructive">{imageError}</p> : null}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((image) => (
                <div
                  key={image.imageId}
                  className="relative aspect-square overflow-hidden rounded-xl"
                >
                  <Image src={image.url} alt="" fill sizes="33vw" className="object-cover" />
                  {image.status === 'uploading' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[rgba(64,58,50,0.55)] text-label-md text-surface-base">
                      上傳中…
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeImage(image.imageId)}
                      aria-label="移除圖片"
                      className="absolute top-1 right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(64,58,50,0.55)] text-surface-base"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
            className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-border-default bg-surface-soft px-3 py-2 text-label-md text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" aria-hidden /> 新增圖片（{images.length}/{MAX_IMAGES}）
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFiles}
          />
        </div>

        <div className="mb-5.5 flex flex-col gap-2.5">
          <span className="text-label-md text-text-tertiary">標籤</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.tagId}
                className="flex items-center gap-1 rounded-full border border-border-default bg-muted px-3.5 py-1.75 text-label-md text-text-primary"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((t) => t.tagId !== tag.tagId))}
                  aria-label={`移除標籤 ${tag.name}`}
                  className="cursor-pointer text-text-muted"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setTagPickerOpen(true)}
              aria-label="編輯標籤"
              className="flex cursor-pointer items-center justify-center rounded-full border border-dashed border-border-default px-3 py-1.75 text-text-muted"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
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

      {tagPickerOpen ? (
        <div className="fixed inset-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-end justify-center">
          <button
            type="button"
            aria-label="關閉"
            onClick={() => setTagPickerOpen(false)}
            className="absolute inset-0 cursor-pointer bg-black/25"
          />
          <div className="relative z-10 h-[88%] w-full max-w-md overflow-hidden rounded-t-2xl shadow-2xl">
            <TagPickerContent
              onClose={() => setTagPickerOpen(false)}
              initialData={tagPickerInitialData}
              initialSelected={tags}
              onConfirmSelected={setTags}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
