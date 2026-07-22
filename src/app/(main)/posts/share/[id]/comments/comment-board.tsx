'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  createPostComment,
  createReply,
  deleteComment as deleteCommentApi,
} from '@/lib/comment-api';
import { categoryLabel } from '@/lib/image-categories';
import { likeComment, unlikeComment } from '@/lib/like-api';
import type { CommentResponse } from '@/types/comment';
import type { ImageResponse } from '@/types/image';
import CommentComposer from '../comment-composer';
import {
  ChevronDownIcon,
  HeartIcon,
  ImageOffIcon,
  ImagePlaceholderIcon,
  ReplyIcon,
  SendIcon,
  UserIcon,
} from './comment-icons';
import { DeleteConfirmModal } from './comment-modals';

// Same shape as posts/commissions/[id]/comments/comment-board.tsx, minus
// give-points/best-comment (share posts have no points-award concept) and
// isCommissioner (no equivalent role here) — kept as its own copy per the
// share-post convention, see plan notes.
export type CommentImage = {
  imageId: number;
  imageUrl: string;
  category: number;
  brand: string;
};

export type Reply = {
  replyId: string;
  nickName: string;
  timeLabel: string;
  content: string;
  images?: CommentImage[];
  likeCount: number;
  isLiked: boolean;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type Comment = {
  commentId: string;
  floor: string;
  nickName: string;
  timeLabel: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  isOwner: boolean;
  images?: CommentImage[];
  replies?: Reply[];
  canEdit: boolean;
  canDelete: boolean;
};

function toCommentImages(images: ImageResponse[]): CommentImage[] | undefined {
  if (images.length === 0) return undefined;
  return images.map((image) => ({
    imageId: image.imageId,
    imageUrl: image.url,
    category: image.category ?? 99,
    brand: image.brand ?? '',
  }));
}

function toComment(response: CommentResponse, floor: string): Comment {
  return {
    commentId: String(response.commentId),
    floor,
    nickName: response.author.displayName,
    timeLabel: '剛剛',
    content: response.content,
    likeCount: response.likeCount,
    isLiked: response.isLiked,
    isOwner: response.isOwner,
    images: toCommentImages(response.images),
    replies: [],
    canEdit: response.canEdit,
    canDelete: response.canDelete,
  };
}

function toReply(response: CommentResponse): Reply {
  return {
    replyId: String(response.commentId),
    nickName: response.author.displayName,
    timeLabel: '剛剛',
    content: response.content,
    images: toCommentImages(response.images),
    likeCount: response.likeCount,
    isLiked: response.isLiked,
    isOwner: response.isOwner,
    canEdit: response.canEdit,
    canDelete: response.canDelete,
  };
}

function ImageCell({
  url,
  label,
  variant,
}: {
  url: string;
  label?: string;
  variant: 'lg' | 'grid';
}) {
  const isGrid = variant === 'grid';
  const iconSize = isGrid ? 'h-4.5 w-4.5' : 'h-5.5 w-5.5';
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  return (
    <div
      className={
        isGrid
          ? 'relative aspect-square overflow-hidden rounded-lg bg-[#EAE2CB]'
          : 'relative h-28.5 w-28.5 flex-shrink-0 overflow-hidden rounded-[10px] bg-[#EAE2CB]'
      }
    >
      {status !== 'loaded' ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {status === 'error' ? (
            <ImageOffIcon className={iconSize} />
          ) : (
            <ImagePlaceholderIcon className={iconSize} />
          )}
        </div>
      ) : null}
      <Image
        src={url}
        alt={label ?? '穿搭參考圖'}
        title={status === 'error' ? '圖片載入失敗' : undefined}
        fill
        sizes={isGrid ? '33vw' : '114px'}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`h-full w-full object-cover transition-opacity ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
      />
      {label ? (
        <span
          className={`absolute inset-x-0 bottom-0 bg-[rgba(64,58,50,0.55)] text-center text-label-md font-semibold text-surface-base ${
            isGrid ? 'px-1 py-0.75' : 'px-1.5 py-1'
          }`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function imageLabel(image: CommentImage): string | undefined {
  return image.brand ? `${categoryLabel(image.category)}：${image.brand}` : undefined;
}

function pickImageLayout(count: number): 'scroll' | 'single' | 'grid' | undefined {
  if (count === 0) return undefined;
  if (count === 1) return 'single';
  if (count >= 4) return 'grid';
  return 'scroll';
}

function AttachedImages({ images }: { images?: CommentImage[] }) {
  if (!images || images.length === 0) return null;
  const layout = pickImageLayout(images.length);

  if (layout === 'grid') {
    return (
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {images.map((image) => (
          <ImageCell
            key={image.imageId}
            url={image.imageUrl}
            label={imageLabel(image)}
            variant="grid"
          />
        ))}
      </div>
    );
  }

  if (layout === 'single') {
    return (
      <div className="mt-2.5">
        <ImageCell url={images[0].imageUrl} label={imageLabel(images[0])} variant="lg" />
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex [scrollbar-width:none] gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {images.map((image) => (
        <ImageCell
          key={image.imageId}
          url={image.imageUrl}
          label={imageLabel(image)}
          variant="lg"
        />
      ))}
    </div>
  );
}

function CommentActions({
  likeCount,
  isLiked,
  isOwner,
  onLike,
  isReplyOpen,
  onReplyClick,
}: {
  likeCount: number;
  isLiked: boolean;
  isOwner: boolean;
  onLike: () => void;
  isReplyOpen: boolean;
  onReplyClick: () => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-4.5">
      <button
        type="button"
        onClick={onLike}
        disabled={isOwner}
        aria-pressed={isLiked}
        aria-label={isOwner ? '不能對自己的留言按讚' : undefined}
        className={`flex cursor-pointer items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 ${isLiked ? 'text-accent-amber' : 'text-text-primary'}`}
      >
        <HeartIcon className={isLiked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
        <span className="sr-only">讚</span>
        <span className="text-label-md">{likeCount}</span>
      </button>
      <button
        type="button"
        onClick={onReplyClick}
        aria-expanded={isReplyOpen}
        className="flex cursor-pointer items-center gap-1.5 text-text-muted"
      >
        <ReplyIcon />
        <span className="text-label-md font-semibold">回覆</span>
      </button>
    </div>
  );
}

function ReplyComposer({
  postId,
  commentId,
  onSubmit,
}: {
  postId: string;
  commentId: string;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const canSend = trimmed.length > 0;

  function submit() {
    if (!canSend) return;
    setText('');
    onSubmit(trimmed);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Input pill — mirrors the main composer: quick text inline, plus an
          image button that opens the full template, reply-aware via
          ?replyTo so it posts a reply rather than a new top-level comment. */}
      <div className="flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full border border-border bg-muted pr-2 pl-3.5">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="加入討論，或附上圖片"
          aria-label="回覆留言"
          className="h-full min-w-0 flex-1 bg-transparent text-body-md text-text-primary placeholder:text-text-placeholder focus:outline-none"
        />
        <Link
          href={`/posts/share/${postId}/comments/new?replyTo=${commentId}`}
          aria-label="用整頁模板附上圖片回覆"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-text-muted"
        >
          <ImagePlaceholderIcon className="h-3.75 w-3.75" />
        </Link>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="送出回覆"
        className="flex h-7.5 w-7.5 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-cta disabled:cursor-not-allowed disabled:opacity-40"
      >
        <SendIcon />
      </button>
    </div>
  );
}

function ReplyList({
  postId,
  commentId,
  replies,
  isReplyOpen,
  onReply,
  onLikeReply,
  onDeleteReply,
  defaultExpanded,
}: {
  postId: string;
  commentId: string;
  replies: Reply[];
  isReplyOpen: boolean;
  onReply: (commentId: string, text: string) => void;
  onLikeReply: (replyId: string) => void;
  onDeleteReply: (replyId: string) => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasReplies = replies.length > 0;

  return (
    <div className="mt-1.5 ml-11.5 flex flex-col gap-3.5 border-l-2 border-border-subtle pl-3.5">
      {hasReplies ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="flex cursor-pointer items-center gap-1 self-start text-label-md font-semibold text-text-muted"
        >
          <span>{expanded ? '隱藏回覆' : `顯示回覆（${replies.length}）`}</span>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      ) : null}

      {hasReplies && expanded ? (
        <ul className="flex flex-col gap-3.5">
          {replies.map((reply) => (
            <li key={reply.replyId} id={`reply-${reply.replyId}`} className="flex gap-2.25">
              <Avatar size="sm">
                <AvatarFallback>
                  <UserIcon className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.75">
                  <span className="text-label-md font-bold text-text-primary">
                    {reply.nickName}
                  </span>
                  <time className="ml-auto text-label-md text-text-placeholder">
                    {reply.timeLabel}
                  </time>
                  {reply.canEdit ? (
                    <Link
                      href={`/posts/share/${postId}/comments/new?replyTo=${commentId}&editReplyId=${reply.replyId}`}
                      className="text-label-md font-semibold text-text-muted"
                    >
                      編輯
                    </Link>
                  ) : null}
                  {reply.canDelete ? (
                    <button
                      type="button"
                      onClick={() => onDeleteReply(reply.replyId)}
                      className="cursor-pointer text-label-md font-semibold text-text-muted"
                    >
                      刪除
                    </button>
                  ) : null}
                </div>
                <div className="mt-0.75 text-body-lg leading-[1.7] text-text-primary">
                  {reply.content}
                </div>
                <AttachedImages images={reply.images} />
                <button
                  type="button"
                  onClick={() => onLikeReply(reply.replyId)}
                  disabled={reply.isOwner}
                  aria-pressed={reply.isLiked}
                  aria-label={reply.isOwner ? '不能對自己的留言按讚' : undefined}
                  className={`mt-2 flex cursor-pointer items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 ${reply.isLiked ? 'text-accent-amber' : 'text-text-primary'}`}
                >
                  <HeartIcon
                    className={reply.isLiked ? 'h-3.5 w-3.5 fill-current' : 'h-3.5 w-3.5'}
                  />
                  <span className="sr-only">讚</span>
                  <span className="text-label-md">{reply.likeCount}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {expanded || isReplyOpen ? (
        <ReplyComposer
          postId={postId}
          commentId={commentId}
          onSubmit={(text) => {
            setExpanded(true);
            onReply(commentId, text);
          }}
        />
      ) : null}
    </div>
  );
}

function CommentItem({
  postId,
  comment,
  isLiked,
  onLike,
  isReplyOpen,
  onReplyClick,
  onReply,
  onDeleteComment,
  onDeleteReply,
  defaultExpanded,
}: {
  postId: string;
  comment: Comment;
  isLiked: boolean;
  onLike: (commentId: string) => void;
  isReplyOpen: boolean;
  onReplyClick: (commentId: string) => void;
  onReply: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  defaultExpanded: boolean;
}) {
  return (
    <article className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <Avatar size="lg">
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-label-md font-bold text-text-primary">{comment.nickName}</span>
            <time className="ml-auto text-label-md text-text-placeholder">{comment.timeLabel}</time>
            <Badge variant="green" className="rounded-lg">
              {comment.floor}
            </Badge>
            {comment.canEdit ? (
              <Link
                href={`/posts/share/${postId}/comments/new?editCommentId=${comment.commentId}`}
                className="text-label-md font-semibold text-text-muted"
              >
                編輯
              </Link>
            ) : null}
            {comment.canDelete ? (
              <button
                type="button"
                onClick={() => onDeleteComment(comment.commentId)}
                className="cursor-pointer text-label-md font-semibold text-text-muted"
              >
                刪除
              </button>
            ) : null}
          </div>
          <div className="mt-1 text-body-lg leading-[1.7] text-text-primary">{comment.content}</div>
          <AttachedImages images={comment.images} />
          <CommentActions
            likeCount={comment.likeCount}
            isLiked={isLiked}
            isOwner={comment.isOwner}
            onLike={() => onLike(comment.commentId)}
            isReplyOpen={isReplyOpen}
            onReplyClick={() => onReplyClick(comment.commentId)}
          />
        </div>
      </div>

      {(comment.replies && comment.replies.length > 0) || isReplyOpen ? (
        <ReplyList
          postId={postId}
          commentId={comment.commentId}
          replies={comment.replies ?? []}
          isReplyOpen={isReplyOpen}
          onReply={onReply}
          onLikeReply={onLike}
          onDeleteReply={(replyId) => onDeleteReply(comment.commentId, replyId)}
          defaultExpanded={defaultExpanded}
        />
      ) : null}
    </article>
  );
}

export default function CommentBoard({
  postId,
  initialComments,
  focusId,
  expandReplyId,
  isLoggedIn,
}: {
  postId: string;
  initialComments: Comment[];
  focusId?: string;
  expandReplyId?: string;
  isLoggedIn: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const scrollTargetRef = useRef<string | null>(focusId ?? null);

  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'comment'; commentId: string }
    | { type: 'reply'; commentId: string; replyId: string }
    | null
  >(null);

  useEffect(() => {
    const targetId = scrollTargetRef.current;
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    scrollTargetRef.current = null;
    el.scrollIntoView({
      behavior: 'smooth',
      block: targetId.startsWith('reply-') ? 'center' : 'nearest',
    });
    if (focusId) router.replace(pathname, { scroll: false });
  }, [comments, focusId, pathname, router]);

  async function addComment(text: string) {
    const result = await createPostComment(postId, { content: text });
    if (!result.success || !result.data) return;
    const comment = toComment(result.data, `B${comments.length + 1}`);
    setComments((prev) => [...prev, comment]);
    scrollTargetRef.current = `comment-${comment.commentId}`;
  }

  async function addReply(commentId: string, text: string) {
    const result = await createReply(commentId, { content: text });
    if (!result.success || !result.data) return;
    const reply = toReply(result.data);
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId
          ? { ...comment, replies: [...(comment.replies ?? []), reply] }
          : comment,
      ),
    );
    scrollTargetRef.current = `reply-${reply.replyId}`;
    setActiveReplyId(null);
  }

  async function deleteComment(commentId: string) {
    const result = await deleteCommentApi(commentId);
    if (!result.success) return;
    setComments((prev) =>
      prev
        .filter((comment) => comment.commentId !== commentId)
        .map((comment, index) => ({ ...comment, floor: `B${index + 1}` })),
    );
    setDeleteTarget(null);
  }

  async function deleteReply(commentId: string, replyId: string) {
    const result = await deleteCommentApi(replyId);
    if (!result.success) return;
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId
          ? {
              ...comment,
              replies: (comment.replies ?? []).filter((reply) => reply.replyId !== replyId),
            }
          : comment,
      ),
    );
    setDeleteTarget(null);
  }

  function applyLikeState(
    comments: Comment[],
    id: string,
    isLiked: boolean,
    likeCount: number,
  ): Comment[] {
    return comments.map((comment) => {
      if (comment.commentId === id) return { ...comment, isLiked, likeCount };
      if (!comment.replies?.some((reply) => reply.replyId === id)) return comment;
      return {
        ...comment,
        replies: comment.replies.map((reply) =>
          reply.replyId === id ? { ...reply, isLiked, likeCount } : reply,
        ),
      };
    });
  }

  function findLikeState(
    comments: Comment[],
    id: string,
  ): { isLiked: boolean; likeCount: number } | null {
    for (const comment of comments) {
      if (comment.commentId === id)
        return { isLiked: comment.isLiked, likeCount: comment.likeCount };
      const reply = comment.replies?.find((r) => r.replyId === id);
      if (reply) return { isLiked: reply.isLiked, likeCount: reply.likeCount };
    }
    return null;
  }

  async function toggleLike(id: string) {
    if (!isLoggedIn) {
      toast('請先登入才能按讚');
      return;
    }
    const current = findLikeState(comments, id);
    if (!current) return;
    const { isLiked: wasLiked, likeCount: prevCount } = current;
    const next = !wasLiked;
    setComments((prev) => applyLikeState(prev, id, next, prevCount + (next ? 1 : -1)));

    const result = wasLiked ? await unlikeComment(id) : await likeComment(id);
    if (!result.success || !result.data) {
      setComments((prev) => applyLikeState(prev, id, wasLiked, prevCount));
      return;
    }
    setComments((prev) => applyLikeState(prev, id, result.data!.isLiked, result.data!.likeCount));
  }

  return (
    <>
      <ul className="flex flex-1 flex-col gap-5 px-4.5 pt-5 pb-5">
        {comments.map((comment, index) => (
          <li
            key={comment.commentId}
            id={`comment-${comment.commentId}`}
            className="flex flex-col gap-5"
          >
            <CommentItem
              postId={postId}
              comment={comment}
              isLiked={comment.isLiked}
              onLike={toggleLike}
              isReplyOpen={activeReplyId === comment.commentId}
              onReplyClick={(id) => setActiveReplyId((prev) => (prev === id ? null : id))}
              onReply={addReply}
              onDeleteComment={(commentId) => setDeleteTarget({ type: 'comment', commentId })}
              onDeleteReply={(commentId, replyId) =>
                setDeleteTarget({ type: 'reply', commentId, replyId })
              }
              defaultExpanded={expandReplyId === comment.commentId}
            />
            {index < comments.length - 1 ? <Separator aria-hidden="true" /> : null}
          </li>
        ))}
      </ul>

      <CommentComposer onSubmit={addComment} templateHref={`/posts/share/${postId}/comments/new`} />

      {deleteTarget ? (
        <DeleteConfirmModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() =>
            deleteTarget.type === 'comment'
              ? deleteComment(deleteTarget.commentId)
              : deleteReply(deleteTarget.commentId, deleteTarget.replyId)
          }
        />
      ) : null}
    </>
  );
}
