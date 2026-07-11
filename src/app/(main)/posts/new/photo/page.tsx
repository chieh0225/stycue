'use client';

import { AlertCircle, ChevronDown, ImagePlus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { deleteImage, uploadImage } from '@/lib/image-api';
import {
  categoryLabel,
  DEFAULT_IMAGE_CATEGORY_ID,
  IMAGE_CATEGORIES,
  type ImageCategoryId,
} from '@/lib/image-categories';
import type { ApiEnvelope, ImageResponse } from '@/types/image';
import { DRAFT_STORAGE_KEY, emptyDraft, type Draft, type DraftPhoto } from '../draft';

const MAX_IMAGES = 9;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

type Attachment = {
  id: string;
  // Present only for freshly-picked, not-yet-uploaded files; absent for
  // photos restored from the draft (already uploaded in an earlier visit).
  file?: File;
  url: string;
  category: ImageCategoryId;
  brand: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  imageId?: number;
  response?: ApiEnvelope<ImageResponse> | ApiEnvelope<unknown>;
};

function attachmentLabel(image: Attachment): string {
  if (image.file) return image.file.name;
  return image.brand
    ? `${categoryLabel(image.category)}・${image.brand}`
    : categoryLabel(image.category);
}

function statusLabel(attachment: Attachment): string {
  switch (attachment.status) {
    case 'pending':
      return '尚未上傳';
    case 'uploading':
      return '上傳中…';
    case 'uploaded':
      return '已上傳';
    case 'error':
      return '上傳失敗';
  }
}

function readDraft(): Draft {
  const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!saved) return emptyDraft;
  try {
    return { ...emptyDraft, ...(JSON.parse(saved) as Partial<Draft>) };
  } catch {
    return emptyDraft;
  }
}

function persistPhotos(images: Attachment[]) {
  const photos: DraftPhoto[] = images
    .filter((image) => image.status === 'uploaded' && image.imageId)
    .map((image) => ({
      imageId: image.imageId!,
      url: image.url,
      category: image.category,
      brand: image.brand,
    }));
  const draft = readDraft();
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...draft, photos }));
}

export default function NewPostPhotoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Attachment[]>([]);
  const [openTagId, setOpenTagId] = useState<string | null>(null);
  const [rejected, setRejected] = useState<string[]>([]);
  const [overCapCount, setOverCapCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);

  // Restore already-uploaded photos from the draft on mount. Deferred to a
  // microtask so the restore doesn't setState synchronously within the
  // effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    queueMicrotask(() => {
      const draft = readDraft();
      if (draft.photos.length === 0) return;
      setImages(
        draft.photos.map((photo) => ({
          id: String(photo.imageId),
          url: photo.url,
          category: photo.category,
          brand: photo.brand,
          status: 'uploaded',
          imageId: photo.imageId,
        })),
      );
    });
  }, []);

  const isBusy = images.some((image) => image.status === 'uploading');
  const canUploadAll =
    !isBusy && images.some((image) => image.status === 'pending' || image.status === 'error');

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    const tooBig = picked.filter((file) => file.size > MAX_FILE_BYTES);
    const room = MAX_IMAGES - images.length;
    const withinSize = picked.filter((file) => file.size <= MAX_FILE_BYTES);
    const added: Attachment[] = withinSize.slice(0, Math.max(0, room)).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      category: DEFAULT_IMAGE_CATEGORY_ID,
      brand: '',
      status: 'pending',
    }));
    setImages((prev) => [...prev, ...added]);
    setRejected(tooBig.map((file) => file.name));
    setOverCapCount(Math.max(0, withinSize.length - added.length));
    event.target.value = '';
  }

  function updateImage(id: string, patch: Partial<Pick<Attachment, 'category' | 'brand'>>) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  async function removeImage(id: string) {
    const target = images.find((img) => img.id === id);
    if (!target) return;
    if (target.status === 'uploaded' && target.imageId) {
      const response = await deleteImage(target.imageId);
      if (!response.success) {
        setImages((prev) => prev.map((img) => (img.id === id ? { ...img, response } : img)));
        return;
      }
    } else if (target.file) {
      URL.revokeObjectURL(target.url);
    }
    const next = images.filter((img) => img.id !== id);
    setImages(next);
    persistPhotos(next);
    setOpenTagId((current) => (current === id ? null : current));
    setDeleteTarget((current) => (current?.id === id ? null : current));
  }

  async function handleUploadAll() {
    const targets = images.filter(
      (image) => image.status === 'pending' || image.status === 'error',
    );
    let current = images;
    for (const target of targets) {
      current = current.map((img) =>
        img.id === target.id ? { ...img, status: 'uploading' as const } : img,
      );
      setImages(current);
      const response = await uploadImage(
        'commissions',
        target.file!,
        target.category,
        target.brand || undefined,
      );
      if (response.success && response.data) {
        URL.revokeObjectURL(target.url);
      }
      current = current.map((img) => {
        if (img.id !== target.id) return img;
        if (response.success && response.data) {
          return {
            ...img,
            status: 'uploaded' as const,
            imageId: response.data.imageId,
            url: response.data.url,
            response,
          };
        }
        return { ...img, status: 'error' as const, response };
      });
      setImages(current);
    }
    persistPhotos(current);
    if (current.every((image) => image.status !== 'error')) {
      router.push('/posts/new');
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between bg-surface-soft px-4 py-4">
        <Link href="/posts/new" className="text-label-md text-text-muted">
          返回
        </Link>
        <h1 className="text-headline-sm font-semibold text-text-primary">上傳圖片</h1>
        <div className="w-8" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border-dashed bg-muted disabled:opacity-50"
        >
          <ImagePlus className="h-4.5 w-4.5 text-text-muted" />
          <span className="text-label-md font-semibold text-text-primary">
            新增圖片（{images.length}/{MAX_IMAGES}）
          </span>
        </button>

        {rejected.length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-label-md leading-[1.6] text-on-error-container"
          >
            <AlertCircle className="mt-px h-4 w-4 flex-shrink-0" />
            <span>以下檔案超過 10MB，未加入：{rejected.join('、')}</span>
          </div>
        )}

        {overCapCount > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-label-md leading-[1.6] text-on-error-container"
          >
            <AlertCircle className="mt-px h-4 w-4 flex-shrink-0" />
            <span>
              最多只能上傳 {MAX_IMAGES} 張圖片，超過的 {overCapCount} 張未加入
            </span>
          </div>
        )}

        {images.map((image) => {
          const editable = image.status === 'pending' || image.status === 'error';
          return (
            <div
              key={image.id}
              className="flex gap-3 rounded-xl border-[1.5px] border-border-default p-3.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL or backend URL preview */}
              <img
                src={image.url}
                alt={attachmentLabel(image)}
                className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span className="overflow-hidden text-label-md font-semibold text-ellipsis whitespace-nowrap text-text-primary">
                    {attachmentLabel(image)}
                  </span>
                  <span className="flex-shrink-0 text-label-md text-text-muted">
                    {statusLabel(image)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(image)}
                    aria-label={`移除 ${attachmentLabel(image)}`}
                    className="flex-shrink-0 rounded-md p-1 text-text-placeholder hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-1.25 text-label-md text-text-tertiary">分類標籤</div>
                <div className="relative mb-2.5 cursor-pointer rounded-lg border border-border-default bg-muted">
                  <button
                    type="button"
                    disabled={!editable}
                    onClick={() =>
                      setOpenTagId((current) => (current === image.id ? null : image.id))
                    }
                    aria-haspopup="listbox"
                    aria-expanded={openTagId === image.id}
                    className="flex h-9.5 w-full items-center justify-between px-2.5 disabled:opacity-60"
                  >
                    <span className="text-label-md font-semibold text-text-primary">
                      {categoryLabel(image.category)}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 text-text-muted transition-transform ${
                        openTagId === image.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openTagId === image.id && (
                    <ul
                      role="listbox"
                      className="absolute inset-x-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-border-default bg-surface-base shadow-dropdown"
                    >
                      {IMAGE_CATEGORIES.map((option) => {
                        const selected = option.id === image.category;
                        return (
                          <li key={option.id} role="option" aria-selected={selected}>
                            <button
                              type="button"
                              onClick={() => {
                                updateImage(image.id, { category: option.id });
                                setOpenTagId(null);
                              }}
                              className={`flex h-9 w-full items-center px-3 text-label-md text-text-primary ${
                                selected ? 'bg-gold-soft font-bold' : 'font-normal'
                              }`}
                            >
                              {option.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="mb-1.25 text-label-md text-text-tertiary">品牌名稱 (選填)</div>
                <Input
                  type="text"
                  value={image.brand}
                  disabled={!editable}
                  onChange={(event) => updateImage(image.id, { brand: event.target.value })}
                  placeholder="輸入品牌..."
                  aria-label={`${attachmentLabel(image)} 品牌名稱`}
                  className="bg-transparent font-semibold placeholder:font-normal"
                />

                {image.response && !image.response.success ? (
                  <p className="mt-2.5 text-label-md text-on-error-container">
                    {image.response.message}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleUploadAll}
          disabled={!canUploadAll}
          className="w-full"
        >
          上傳全部圖片
        </Button>

        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <DialogContent className="flex flex-col items-center px-5.5 pt-6.5 pb-5 text-center">
            <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-full bg-destructive-bg text-destructive">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="mb-2">刪除圖片？</DialogTitle>
            <DialogDescription className="mb-5.5">
              確定要刪除「{deleteTarget ? attachmentLabel(deleteTarget) : ''}」嗎？此操作無法復原。
            </DialogDescription>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setDeleteTarget(null)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="md"
                onClick={() => deleteTarget && removeImage(deleteTarget.id)}
                className="flex-1"
              >
                刪除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
