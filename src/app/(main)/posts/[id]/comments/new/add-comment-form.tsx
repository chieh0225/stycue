'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

// Attachment limits mirror the design copy (最多可上傳 9 張圖片，單張 10MB).
const MAX_IMAGES = 9;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Category tags offered per attached image (mirrors the Tag Dropdown design).
const TAG_OPTIONS = ['上衣', '下身', '鞋子', '配件', '包包', '帽子', '其他'] as const;
const DEFAULT_TAG = TAG_OPTIONS[0];

// Each attachment carries its own category + optional brand, edited inline on
// the rendered card. `url` is an object URL for the thumbnail, revoked on remove.
type Attachment = {
  id: string;
  file: File;
  url: string;
  tag: string;
  brand: string;
};

function UserIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

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

export default function AddCommentForm({
  postId,
  replyTo,
}: {
  postId: string;
  // When set, this screen composes a reply under the given parent commentId
  // instead of a new top-level commission comment.
  replyTo?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [images, setImages] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // id of the attachment whose tag dropdown is open (only one at a time).
  const [openTagId, setOpenTagId] = useState<string | null>(null);
  // Names of files rejected on the last pick (over 10MB), shown inline.
  const [rejected, setRejected] = useState<string[]>([]);

  const cancelHref = `/posts/${postId}/comments`;
  const canPublish = (text.trim().length > 0 || images.length > 0) && !submitting;

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    // Drop anything over the per-file size cap before counting toward the limit.
    const tooBig = picked.filter((file) => file.size > MAX_FILE_BYTES);
    const room = MAX_IMAGES - images.length;
    // Enforce the 9-image cap; the surplus is simply dropped.
    const added: Attachment[] = picked
      .filter((file) => file.size <= MAX_FILE_BYTES)
      .slice(0, Math.max(0, room))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        tag: DEFAULT_TAG,
        brand: '',
      }));
    setImages((prev) => [...prev, ...added]);
    setRejected(tooBig.map((file) => file.name));
    // Reset so re-picking the same file still fires a change event.
    event.target.value = '';
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.id !== id);
    });
    setOpenTagId((current) => (current === id ? null : current));
  }

  function updateImage(id: string, patch: Partial<Pick<Attachment, 'tag' | 'brand'>>) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  function publish() {
    if (!canPublish) return;
    setSubmitting(true);
    // Mock write — fire-and-forget, mirroring CommentComposer. Both flows are
    // two steps (create, then attach each image via the shared comment image
    // endpoint POST /api/v1/comments/{commentId}/images):
    //   reply  (replyTo set): POST /api/v1/comments/{replyTo}/replies -> replyId
    //   top-level          : POST /api/v1/commisions/{postId}/comments -> commentId
    // `postId` here is the commission id (commissions are served under /posts/[id]).
    const createUrl = replyTo
      ? `/api/comments/${replyTo}/replies`
      : `/api/commisions/${postId}/comments`;
    void fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim(), imageCount: images.length }),
    }).catch(() => {});
    router.push(cancelHref);
  }

  return (
    <>
      {/* Scrollable body — flex-1 keeps the action bar pinned to the bottom.
          no-scrollbar hides the vertical bar that an open tag dropdown would
          otherwise flash when it overflows the bottom. */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4.5 pt-5 pb-6">
        {/* Author row */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
            <UserIcon />
          </div>
          <span className="text-[12.5px] leading-[1.5] text-text-muted">
            發布後內容將依序顯示：文字內容 &gt; 附加圖片
          </span>
        </div>

        {/* Text input */}
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="分享你的穿搭見解..."
          aria-label="留言內容"
          className="mb-[26px] min-h-[120px] w-full resize-none rounded-lg border-[1.5px] border-border-default bg-white p-3.5 text-sm leading-[1.7] text-text-primary placeholder:text-[#B8AF9E] focus:outline-none"
        />

        {/* 附加圖片 */}
        <div className="mb-3">
          <span className="text-lg font-bold text-text-primary">附加圖片</span>
        </div>
        <div className="mb-2.5 h-px bg-border-default" />
        <div className="mb-[18px] text-xs text-[#9A9080]">
          最多可上傳 {MAX_IMAGES} 張圖片，單張檔案大小不可超過 10MB
        </div>

        {/* 新增圖片 button — kept above the card list so it stays reachable near
            the section header instead of being pushed down as cards accumulate */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="mb-[18px] flex h-14 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#D9CFA9] bg-[#FDF7E9] disabled:opacity-50"
        >
          <ImagePlusIcon className="h-[18px] w-[18px] text-text-muted" />
          <span className="text-sm font-semibold text-[#5A5248]">
            新增圖片{images.length > 0 ? `（${images.length}/${MAX_IMAGES}）` : ''}
          </span>
        </button>

        {/* Oversized files rejected on the last pick */}
        {rejected.length > 0 && (
          <div
            role="alert"
            className="mb-[18px] flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-xs leading-[1.6] text-on-error-container"
          >
            <AlertIcon className="mt-px h-4 w-4 flex-shrink-0" />
            <span>以下檔案超過 10MB，未加入：{rejected.join('、')}</span>
          </div>
        )}

        {/* Rendered cards — one per attached image */}
        {images.map((image) => (
          <div
            key={image.id}
            className="mb-3.5 flex gap-3 rounded-xl border-[1.5px] border-border-default p-3.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img
              src={image.url}
              alt={image.file.name}
              className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              {/* Filename + delete */}
              <div className="mb-2.5 flex items-center justify-between">
                <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-text-primary">
                  {image.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  aria-label={`移除 ${image.file.name}`}
                  className="ml-2 flex-shrink-0 text-[#B8AF9E]"
                >
                  <TrashIcon />
                </button>
              </div>

              {/* 分類標籤 dropdown */}
              <div className="mb-[5px] text-[11.5px] text-[#9A9080]">分類標籤</div>
              <div className="relative mb-2.5 cursor-pointer rounded-lg border-[1.5px] border-border-default bg-[#FDF7E9]">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTagId((current) => (current === image.id ? null : image.id))
                  }
                  aria-haspopup="listbox"
                  aria-expanded={openTagId === image.id}
                  className="flex h-[38px] w-full items-center justify-between px-2.5"
                >
                  <span className="text-[13px] font-semibold text-text-primary">{image.tag}</span>
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
                    {TAG_OPTIONS.map((option) => {
                      const selected = option === image.tag;
                      return (
                        <li key={option} role="option" aria-selected={selected}>
                          <button
                            type="button"
                            onClick={() => {
                              updateImage(image.id, { tag: option });
                              setOpenTagId(null);
                            }}
                            className={`flex h-9 w-full items-center px-3 text-[13px] text-text-primary ${
                              selected ? 'bg-[#FCEFCB] font-bold' : 'font-normal'
                            }`}
                          >
                            {option}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* 品牌名稱 (選填) */}
              <div className="mb-[5px] text-[11.5px] text-[#9A9080]">品牌名稱 (選填)</div>
              <input
                type="text"
                value={image.brand}
                onChange={(event) => updateImage(image.id, { brand: event.target.value })}
                placeholder="輸入品牌..."
                aria-label={`${image.file.name} 品牌名稱`}
                className="h-[38px] w-full rounded-lg border-[1.5px] border-border-default px-2.5 text-[13px] font-semibold text-text-primary placeholder:font-normal placeholder:text-[#B8AF9E] focus:outline-none"
              />
            </div>
          </div>
        ))}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
        />
      </div>

      {/* Bottom action bar */}
      <div className="flex flex-shrink-0 gap-3 border-t border-border-default bg-surface-base px-4.5 py-4">
        <Link
          href={cancelHref}
          className="flex h-13 flex-1 items-center justify-center rounded-lg border-[1.5px] border-border-default text-base font-bold text-text-primary"
        >
          取消
        </Link>
        <button
          type="button"
          onClick={publish}
          disabled={!canPublish}
          className="flex h-13 flex-1 items-center justify-center rounded-lg bg-brand-primary text-base font-bold text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)] disabled:opacity-50"
        >
          {replyTo ? '發佈回覆' : '發佈留言'}
        </button>
      </div>
    </>
  );
}
