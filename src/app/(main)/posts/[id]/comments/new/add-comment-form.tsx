'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

// Attachment limits mirror the design copy (最多可上傳 9 張圖片，單張 10MB).
const MAX_IMAGES = 9;

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

export default function AddCommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const cancelHref = `/posts/${postId}/comments`;
  const canPublish = (text.trim().length > 0 || images.length > 0) && !submitting;

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    // Enforce the 9-image cap; the surplus is simply dropped.
    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    // Reset so re-picking the same file still fires a change event.
    event.target.value = '';
  }

  function publish() {
    if (!canPublish) return;
    setSubmitting(true);
    // Mock write — fire-and-forget, mirroring CommentComposer. This screen is a
    // commission comment, so the real flow is two steps:
    //   1. POST /api/v1/commisions/{commisionId}/comments  -> returns commentId
    //   2. for each image: POST /api/v1/comments/{commentId}/images
    // `postId` here is the commission id (commissions are served under /posts/[id]).
    void fetch(`/api/commisions/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim(), imageCount: images.length }),
    }).catch(() => {});
    router.push(cancelHref);
  }

  return (
    <>
      {/* Scrollable body — flex-1 keeps the action bar pinned to the bottom */}
      <div className="flex-1 overflow-y-auto px-4.5 pt-5 pb-6">
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

        {/* 新增圖片 button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="mb-[22px] flex h-14 w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#D9CFA9] bg-[#FDF7E9] disabled:opacity-50"
        >
          <ImagePlusIcon className="h-[18px] w-[18px] text-text-muted" />
          <span className="text-sm font-semibold text-[#5A5248]">
            新增圖片{images.length > 0 ? `（${images.length}/${MAX_IMAGES}）` : ''}
          </span>
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
          發佈留言
        </button>
      </div>
    </>
  );
}
