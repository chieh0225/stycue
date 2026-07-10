'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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

function ImagePlusIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
      <path d="M17 3v6M14 6h6" />
    </svg>
  );
}

function ChevronDownIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function TrashIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </svg>
  );
}

function TrashLinesIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function AlertIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </svg>
  );
}

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
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between bg-surface-soft px-4 py-4">
        <Link href="/posts/new" className="text-sm text-text-muted">
          返回
        </Link>
        <h1 className="text-base font-semibold text-text-primary">上傳圖片</h1>
        <div className="w-8" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#D9CFA9] bg-[#FDF7E9] disabled:opacity-50"
        >
          <ImagePlusIcon className="h-[18px] w-[18px] text-text-muted" />
          <span className="text-sm font-semibold text-[#5A5248]">
            新增圖片（{images.length}/{MAX_IMAGES}）
          </span>
        </button>

        {rejected.length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-xs leading-[1.6] text-on-error-container"
          >
            <AlertIcon className="mt-px h-4 w-4 flex-shrink-0" />
            <span>以下檔案超過 10MB，未加入：{rejected.join('、')}</span>
          </div>
        )}

        {overCapCount > 0 && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-xs leading-[1.6] text-on-error-container"
          >
            <AlertIcon className="mt-px h-4 w-4 flex-shrink-0" />
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
                  <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-text-primary">
                    {attachmentLabel(image)}
                  </span>
                  <span className="flex-shrink-0 text-xs text-text-muted">
                    {statusLabel(image)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(image)}
                    aria-label={`移除 ${attachmentLabel(image)}`}
                    className="flex-shrink-0 rounded-md p-1 text-[#B8AF9E] hover:bg-[#F5EEDA]"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="mb-[5px] text-[11.5px] text-[#9A9080]">分類標籤</div>
                <div className="relative mb-2.5 cursor-pointer rounded-lg border-[1.5px] border-border-default bg-[#FDF7E9]">
                  <button
                    type="button"
                    disabled={!editable}
                    onClick={() =>
                      setOpenTagId((current) => (current === image.id ? null : image.id))
                    }
                    aria-haspopup="listbox"
                    aria-expanded={openTagId === image.id}
                    className="flex h-[38px] w-full items-center justify-between px-2.5 disabled:opacity-60"
                  >
                    <span className="text-[13px] font-semibold text-text-primary">
                      {categoryLabel(image.category)}
                    </span>
                    <ChevronDownIcon
                      className={`h-3 w-3 text-text-muted transition-transform ${
                        openTagId === image.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openTagId === image.id && (
                    <ul
                      role="listbox"
                      className="absolute inset-x-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg border border-border-default bg-surface-base shadow-[0_8px_20px_rgba(64,58,50,0.16)]"
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
                              className={`flex h-9 w-full items-center px-3 text-[13px] text-text-primary ${
                                selected ? 'bg-[#FCEFCB] font-bold' : 'font-normal'
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

                <div className="mb-[5px] text-[11.5px] text-[#9A9080]">品牌名稱 (選填)</div>
                <input
                  type="text"
                  value={image.brand}
                  disabled={!editable}
                  onChange={(event) => updateImage(image.id, { brand: event.target.value })}
                  placeholder="輸入品牌..."
                  aria-label={`${attachmentLabel(image)} 品牌名稱`}
                  className="h-[38px] w-full rounded-lg border-[1.5px] border-border-default px-2.5 text-[13px] font-semibold text-text-primary placeholder:font-normal placeholder:text-[#B8AF9E] focus:outline-none disabled:opacity-60"
                />

                {image.response && !image.response.success ? (
                  <p className="mt-2.5 text-[11px] text-on-error-container">
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

        <button
          type="button"
          onClick={handleUploadAll}
          disabled={!canUploadAll}
          className="flex h-13 w-full items-center justify-center rounded-lg bg-brand-primary text-base font-bold text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)] disabled:opacity-50"
        >
          上傳全部圖片
        </button>

        {deleteTarget && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-image-title"
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(64,58,50,0.42)] px-8"
          >
            <div
              onClick={(event) => event.stopPropagation()}
              className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-surface-base px-[22px] pt-[26px] pb-5 text-center shadow-[0_12px_32px_rgba(64,58,50,0.28)]"
            >
              <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-full bg-[#FBE8E4] text-[#C0564B]">
                <TrashLinesIcon />
              </div>
              <span id="delete-image-title" className="mb-2 text-base font-bold text-text-primary">
                刪除圖片？
              </span>
              <span className="mb-[22px] text-[13px] leading-[1.6] text-text-muted">
                確定要刪除「{attachmentLabel(deleteTarget)}」嗎？此操作無法復原。
              </span>
              <div className="flex w-full gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex h-[46px] flex-1 items-center justify-center rounded-lg border-[1.5px] border-border-default text-sm font-bold text-text-primary hover:bg-[#F5EEDA]"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(deleteTarget.id)}
                  className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-[#C0564B] text-sm font-bold text-surface-base shadow-[0_4px_12px_rgba(192,86,75,0.28)] hover:bg-[#AB4B41]"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
