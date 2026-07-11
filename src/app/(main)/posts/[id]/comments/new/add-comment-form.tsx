'use client';

import { AlertCircle, ChevronDown, Image, ImagePlus, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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
          <Avatar size="xl">
            <AvatarFallback>
              <User className="h-4.5 w-4.5" />
            </AvatarFallback>
          </Avatar>
          <span className="text-[12.5px] leading-[1.5] text-text-muted">
            發布後內容將依序顯示：文字內容 &gt; 附加圖片
          </span>
        </div>

        {/* Text input */}
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="分享你的穿搭見解..."
          aria-label="留言內容"
          className="mb-6.5"
        />

        {/* 附加圖片 */}
        <div className="mb-3">
          <span className="text-lg font-bold text-text-primary">附加圖片</span>
        </div>
        <Separator className="mb-2.5" />
        <div className="mb-4.5 text-xs text-text-tertiary">
          最多可上傳 {MAX_IMAGES} 張圖片，單張檔案大小不可超過 10MB
        </div>

        {/* 新增圖片 button — kept above the card list so it stays reachable near
            the section header instead of being pushed down as cards accumulate */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_IMAGES}
          className="mb-4.5 flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-dashed bg-muted disabled:opacity-50"
        >
          <ImagePlus className="h-4.5 w-4.5 text-text-muted" />
          <span className="text-sm font-semibold text-foreground">
            新增圖片（{images.length}/{MAX_IMAGES}）
          </span>
        </button>

        {/* Oversized files rejected on the last pick */}
        {rejected.length > 0 && (
          <div
            role="alert"
            className="mb-4.5 flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-xs leading-[1.6] text-on-error-container"
          >
            <AlertCircle className="mt-px h-4 w-4 flex-shrink-0" />
            <span>以下檔案超過 10MB，未加入：{rejected.join('、')}</span>
          </div>
        )}

        {/* Files dropped on the last pick because they exceeded the 9-image cap */}
        {overCapCount > 0 && (
          <div
            role="alert"
            className="mb-[18px] flex items-start gap-2 rounded-lg bg-error-container px-3 py-2 text-xs leading-[1.6] text-on-error-container"
          >
            <AlertCircle className="mt-px h-4 w-4 flex-shrink-0" />
            <span>
              最多只能上傳 {MAX_IMAGES} 張圖片，超過的 {overCapCount} 張未加入
            </span>
          </div>
        )}

        {/* Rendered cards — one per attached image */}
        {images.map((image) => (
          <Card key={image.id} variant="outline" className="mb-3.5 flex gap-3 p-3.5">
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
                <Image className="h-6 w-6" />
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
                  className="ml-2 flex-shrink-0 rounded-md p-1 text-text-placeholder hover:bg-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* 分類標籤 dropdown */}
              <div className="mb-1.25 text-[11.5px] text-text-tertiary">分類標籤</div>
              <div className="relative mb-2.5 cursor-pointer rounded-lg border border-border-default bg-muted">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTagId((current) => (current === image.id ? null : image.id))
                  }
                  aria-haspopup="listbox"
                  aria-expanded={openTagId === image.id}
                  className="flex h-9.5 w-full items-center justify-between px-2.5"
                >
                  <span className="text-meta font-semibold text-text-primary">
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
                            className={`flex h-9 w-full items-center px-3 text-meta text-text-primary ${
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

              {/* 品牌名稱 (選填) */}
              <div className="mb-1.25 text-[11.5px] text-text-tertiary">品牌名稱 (選填)</div>
              <Input
                type="text"
                value={image.brand}
                onChange={(event) => updateImage(image.id, { brand: event.target.value })}
                placeholder="輸入品牌..."
                aria-label={`${attachmentLabel(image)} 品牌名稱`}
                className="bg-transparent text-meta font-semibold placeholder:font-normal"
              />
            </div>
          </Card>
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
      <BottomBar className="py-4">
        <Link
          href={cancelHref}
          className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'flex-1')}
        >
          取消
        </Link>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={publish}
          disabled={!canPublish}
          className="flex-1"
        >
          {isEdit ? '儲存' : replyTo ? '發佈回覆' : '發佈留言'}
        </Button>
      </BottomBar>

      {/* Delete confirmation modal — the trash button stages an attachment here
          instead of removing it outright, so the removal is opt-in. */}
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
          <DialogTitle className="mb-2 text-base">刪除圖片？</DialogTitle>
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
    </>
  );
}
