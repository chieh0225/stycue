'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getAuthedUser } from '../../../../../auth';
import {
  categoryLabel,
  DEFAULT_IMAGE_CATEGORY_ID,
  IMAGE_CATEGORIES,
  type ImageCategoryId,
} from '../../image-categories';
import {
  addPendingComment,
  addPendingReply,
  getPendingComment,
  getPendingReply,
  updatePendingComment,
  updatePendingReply,
} from '../../pending-comments';
import type { CommentImage } from '../comment-board';

// Attachment limits mirror the design copy (最多可上傳 9 張圖片，單張 10MB).
const MAX_IMAGES = 9;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

// A freshly picked file, not uploaded yet — `url` is a local object URL,
// revoked on remove/unmount.
type NewAttachment = {
  id: string;
  kind: 'new';
  file: File;
  url: string;
  category: ImageCategoryId;
  brand: string;
};

// An already-"uploaded" image from the item being edited — no File survives
// navigation, only the stored record. Re-taggable/removable but not
// re-uploadable.
type ExistingAttachment = {
  id: string;
  kind: 'existing';
  imageId: number;
  url: string;
  category: ImageCategoryId;
  brand: string;
};

// Each attachment carries its own category + optional brand, edited inline on
// the rendered card.
type Attachment = NewAttachment | ExistingAttachment;

function attachmentLabel(attachment: Attachment): string {
  if (attachment.kind === 'new') return attachment.file.name;
  return attachment.brand
    ? `${categoryLabel(attachment.category)}・${attachment.brand}`
    : categoryLabel(attachment.category);
}

function toExistingAttachments(images: CommentImage[] | undefined): ExistingAttachment[] {
  return (images ?? []).map((image) => ({
    id: String(image.imageId),
    kind: 'existing',
    imageId: image.imageId,
    url: image.imageUrl,
    category: image.category as ImageCategoryId,
    brand: image.brand,
  }));
}

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

// Placeholder for an existing attachment's thumbnail — there is no real image
// to preview (its object URL was revoked when the item it belongs to was
// originally published), so this mirrors the board's own image-cell glyph.
function ImagePlaceholderIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
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

// Trash icon with lid + inner strokes, used at a larger size inside the delete
// confirmation modal (mirrors the modal glyph in the design).
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

export default function AddCommentForm({
  postId,
  replyTo,
  editCommentId,
  editReplyId,
}: {
  postId: string;
  // When set, this screen composes a reply under the given parent commentId
  // instead of a new top-level commission comment.
  replyTo?: string;
  // When set, this screen edits the given existing top-level comment instead
  // of composing a new one.
  editCommentId?: string;
  // When set (always alongside replyTo, which doubles as the parent comment
  // id), this screen edits the given existing reply instead of composing a
  // new one. Without a matching replyTo this collapses to non-edit behavior.
  editReplyId?: string;
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
  // Count of files dropped on the last pick because they exceeded the
  // remaining room under the 9-image cap, shown inline.
  const [overCapCount, setOverCapCount] = useState(0);
  // Attachment awaiting delete confirmation; drives the confirmation modal.
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);

  const cancelHref = `/posts/${postId}/comments`;
  const canPublish = (text.trim().length > 0 || images.length > 0) && !submitting;
  const isEditingComment = Boolean(editCommentId);
  const isEditingReply = Boolean(editReplyId && replyTo);
  const isEdit = isEditingComment || isEditingReply;

  // Prefill from the pending store when opened in edit mode. Editable content
  // only ever lives in the pending store (see the ownership check that gates
  // the 編輯 link in comment-board.tsx) — a missing/stale id (cleared
  // sessionStorage, bad link) falls back to a plain cancel-navigation.
  useEffect(() => {
    if (isEditingComment) {
      const pending = getPendingComment(postId, editCommentId!);
      if (!pending) {
        router.replace(cancelHref);
        return;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(pending.content);
      setImages(toExistingAttachments(pending.images));
    } else if (isEditingReply) {
      const pending = getPendingReply(postId, replyTo!, editReplyId!);
      if (!pending) {
        router.replace(cancelHref);
        return;
      }
      setText(pending.content);
      setImages(toExistingAttachments(pending.images));
    }
    // Prefill runs once on mount only — the edit target doesn't change within
    // a single visit to this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mirrors `images` so the unmount cleanup below can see the latest list
  // without re-subscribing the effect (and thus re-registering the cleanup)
  // on every add/remove. Updated in an effect, not during render, per the
  // rules-of-hooks refs restriction.
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Individual removals revoke their own object URL (see removeImage), but
  // any still-attached previews (e.g. the user hits 取消 or navigates away)
  // are only cleaned up here, on unmount. Existing attachments' `url` isn't
  // an object URL this mount owns, so only `kind === 'new'` is revoked.
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image.kind === 'new') URL.revokeObjectURL(image.url);
      });
    };
  }, []);

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    // Drop anything over the per-file size cap before counting toward the limit.
    const tooBig = picked.filter((file) => file.size > MAX_FILE_BYTES);
    const room = MAX_IMAGES - images.length;
    const withinSize = picked.filter((file) => file.size <= MAX_FILE_BYTES);
    // Enforce the 9-image cap; the surplus is simply dropped.
    const added: Attachment[] = withinSize.slice(0, Math.max(0, room)).map((file) => ({
      id: crypto.randomUUID(),
      kind: 'new',
      file,
      url: URL.createObjectURL(file),
      category: DEFAULT_IMAGE_CATEGORY_ID,
      brand: '',
    }));
    setImages((prev) => [...prev, ...added]);
    setRejected(tooBig.map((file) => file.name));
    setOverCapCount(Math.max(0, withinSize.length - added.length));
    // Reset so re-picking the same file still fires a change event.
    event.target.value = '';
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.kind === 'new') URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.id !== id);
    });
    setOpenTagId((current) => (current === id ? null : current));
    setDeleteTarget((current) => (current?.id === id ? null : current));
  }

  function updateImage(id: string, patch: Partial<Pick<Attachment, 'category' | 'brand'>>) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  // No uploads backend exists yet, so `kind === 'new'` attachments simulate
  // POST /api/v1/uploads' response shape ({ imageId, imageUrl }) — once that
  // endpoint lands, this becomes a real upload call made per-attachment on
  // publish, and only the returned imageId needs to travel to the
  // comment/reply call. `kind === 'existing'` attachments (from an edit) are
  // already "uploaded" — passed through unchanged, possibly re-tagged.
  function resolveImages(attachments: Attachment[]): CommentImage[] {
    return attachments.map((attachment, index) =>
      attachment.kind === 'existing'
        ? {
            imageId: attachment.imageId,
            imageUrl: attachment.url,
            category: attachment.category,
            brand: attachment.brand.trim(),
          }
        : {
            imageId: Date.now() + index,
            imageUrl: attachment.url,
            category: attachment.category,
            brand: attachment.brand.trim(),
          },
    );
  }

  function publish() {
    if (!canPublish) return;
    setSubmitting(true);
    const content = text.trim();
    // No comments backend exists yet, so the submission is stored optimistically
    // in the shared pending store (sessionStorage) and rendered by the board on
    // its next mount. This is where the real write would go once the API lands:
    //   reply  (replyTo set): POST /api/v1/comments/{replyTo}/replies
    //   top-level          : POST /api/v1/commissions/{postId}/comments
    //   body (both): { content, imageIds: number[] } — referencing the ids
    //   returned by the per-attachment POST /api/v1/uploads call above.
    // `postId` here is the commission id (commissions are served under /posts/[id]).
    // Tell the board what to do once it re-mounts, via query params it reads and
    // then strips: ?focus={domId} scrolls the new item into view, and (for a
    // reply) ?expand={parentId} opens that comment's reply list so the reply is
    // not hidden behind the collapse toggle. Passing these only on submit keeps a
    // plain navigation in from auto-scrolling or auto-expanding.
    const resolvedImages = resolveImages(images);
    const params = new URLSearchParams();
    if (isEditingComment) {
      const ok = updatePendingComment(postId, editCommentId!, {
        content,
        images: resolvedImages,
      });
      if (!ok) {
        router.push(cancelHref);
        return;
      }
      params.set('focus', `comment-${editCommentId}`);
    } else if (isEditingReply) {
      const ok = updatePendingReply(postId, replyTo!, editReplyId!, {
        content,
        images: resolvedImages,
      });
      if (!ok) {
        router.push(cancelHref);
        return;
      }
      params.set('focus', `reply-${editReplyId}`);
      params.set('expand', replyTo!);
    } else if (replyTo) {
      const authedUser = getAuthedUser();
      const replyId = crypto.randomUUID();
      addPendingReply(postId, replyTo, {
        replyId,
        nickName: authedUser?.nickName ?? '你',
        timeLabel: '剛剛',
        content,
        images: resolvedImages,
        authorEmail: authedUser?.email,
      });
      params.set('focus', `reply-${replyId}`);
      params.set('expand', replyTo);
    } else {
      const authedUser = getAuthedUser();
      const commentId = crypto.randomUUID();
      addPendingComment(postId, {
        commentId,
        nickName: authedUser?.nickName ?? '你',
        timeLabel: '剛剛',
        content,
        likeCount: 0,
        images: resolvedImages,
        authorEmail: authedUser?.email,
      });
      params.set('focus', `comment-${commentId}`);
    }
    router.push(`${cancelHref}?${params.toString()}`);
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
            新增圖片（{images.length}/{MAX_IMAGES}）
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

        {/* Files dropped on the last pick because they exceeded the 9-image cap */}
        {overCapCount > 0 && (
          <div
            role="alert"
            className="mb-[18px] flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-xs leading-[1.6] text-on-error-container"
          >
            <AlertIcon className="mt-px h-4 w-4 flex-shrink-0" />
            <span>
              最多只能上傳 {MAX_IMAGES} 張圖片，超過的 {overCapCount} 張未加入
            </span>
          </div>
        )}

        {/* Rendered cards — one per attached image */}
        {images.map((image) => (
          <div
            key={image.id}
            className="mb-3.5 flex gap-3 rounded-xl border-[1.5px] border-border-default p-3.5"
          >
            {image.kind === 'new' ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img
                src={image.url}
                alt={image.file.name}
                className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              // Existing attachment from an edit — no live preview available
              // (its object URL was revoked once the original post finished
              // publishing), so this shows the same placeholder glyph the
              // board itself renders for every comment image.
              <div
                role="img"
                aria-label={attachmentLabel(image)}
                className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAE2CB] text-[#B8AF9E]"
              >
                <ImagePlaceholderIcon />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {/* Filename + delete */}
              <div className="mb-2.5 flex items-center justify-between">
                <span className="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-text-primary">
                  {attachmentLabel(image)}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(image)}
                  aria-label={`移除 ${attachmentLabel(image)}`}
                  className="ml-2 flex-shrink-0 rounded-md p-1 text-[#B8AF9E] hover:bg-[#F5EEDA]"
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

              {/* 品牌名稱 (選填) */}
              <div className="mb-[5px] text-[11.5px] text-[#9A9080]">品牌名稱 (選填)</div>
              <input
                type="text"
                value={image.brand}
                onChange={(event) => updateImage(image.id, { brand: event.target.value })}
                placeholder="輸入品牌..."
                aria-label={`${attachmentLabel(image)} 品牌名稱`}
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
          {isEdit ? '儲存' : replyTo ? '發佈回覆' : '發佈留言'}
        </button>
      </div>

      {/* Delete confirmation modal — the trash button stages an attachment here
          instead of removing it outright, so the removal is opt-in. */}
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
    </>
  );
}
