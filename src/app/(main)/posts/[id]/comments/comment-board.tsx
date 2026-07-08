'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CommentComposer from '../comment-composer';

export type CommentImage = { label?: string };

export type Reply = {
  replyId: string;
  nickName: string;
  content: string;
  isCommissioner?: boolean;
  hasImage?: boolean;
};

export type Comment = {
  commentId: string;
  floor: string;
  nickName: string;
  timeLabel: string;
  content: string;
  likeCount: number;
  images?: CommentImage[];
  imageLayout?: 'scroll' | 'single' | 'grid';
  replies?: Reply[];
};

function UserIcon({ className = 'h-[17px] w-[17px]' }: { className?: string }) {
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

function ImagePlaceholderIcon({ className = 'h-[22px] w-[22px]' }: { className?: string }) {
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

function HeartIcon({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function StarIcon({ className = 'h-4 w-4' }: { className?: string }) {
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
      <path d="M12 2l3 6 6.6.9-4.8 4.7 1.1 6.6L12 17l-5.9 3.2 1.1-6.6L2.4 8.9 9 8z" />
    </svg>
  );
}

function ChevronDownIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SendIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
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
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

function ReplyIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3 20l1.1-4a8.4 8.4 0 0 1-1-4A8.38 8.38 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5Z" />
    </svg>
  );
}

function ImageCell({ label, variant }: { label?: string; variant: 'lg' | 'grid' }) {
  const isGrid = variant === 'grid';
  return (
    <div
      role="img"
      aria-label={label ?? '穿搭參考圖'}
      className={
        isGrid
          ? 'relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#EAE2CB] text-[#B8AF9E]'
          : 'relative flex h-[114px] w-[114px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#EAE2CB] text-[#B8AF9E]'
      }
    >
      <ImagePlaceholderIcon className={isGrid ? 'h-[18px] w-[18px]' : 'h-[22px] w-[22px]'} />
      {label ? (
        <span
          className={`absolute inset-x-0 bottom-0 bg-[rgba(64,58,50,0.55)] text-center font-semibold text-surface-base ${
            isGrid ? 'px-1 py-[3px] text-[9px]' : 'px-1.5 py-1 text-[10.5px]'
          }`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function CommentImages({ comment }: { comment: Comment }) {
  if (!comment.images || comment.images.length === 0) return null;

  if (comment.imageLayout === 'grid') {
    return (
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {comment.images.map((image, i) => (
          <ImageCell key={i} label={image.label} variant="grid" />
        ))}
      </div>
    );
  }

  if (comment.imageLayout === 'single') {
    return (
      <div className="mt-2.5">
        <ImageCell label={comment.images[0]?.label} variant="lg" />
      </div>
    );
  }

  // scroll strip
  return (
    <div className="mt-2.5 flex [scrollbar-width:none] gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {comment.images.map((image, i) => (
        <ImageCell key={i} label={image.label} variant="lg" />
      ))}
    </div>
  );
}

function CommentActions({
  likeCount,
  isLiked,
  onLike,
  isReplyOpen,
  onReplyClick,
  onGivePoints,
  isAwarded,
  awardedAmount,
  canAward,
}: {
  likeCount: number;
  isLiked: boolean;
  onLike: () => void;
  isReplyOpen: boolean;
  onReplyClick: () => void;
  onGivePoints: () => void;
  isAwarded: boolean;
  awardedAmount?: number;
  canAward: boolean;
}) {
  // Base count plus an optimistic +1 while the current user's like is on.
  const displayLikeCount = likeCount + (isLiked ? 1 : 0);
  return (
    <div className="mt-4 flex items-center gap-[18px]">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={isLiked}
        className={`flex items-center gap-1.5 ${isLiked ? 'text-accent-amber' : 'text-text-primary'}`}
      >
        <HeartIcon className={isLiked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
        <span className="sr-only">讚</span>
        <span className="text-[13px]">{displayLikeCount}</span>
      </button>
      <button
        type="button"
        onClick={onReplyClick}
        aria-expanded={isReplyOpen}
        className="flex items-center gap-1.5 text-text-muted"
      >
        <ReplyIcon />
        <span className="text-[13px] font-semibold">回覆</span>
      </button>
      {/* Once the commission's reward is awarded it is a one-time state
          (best-comment API 409s on a second call), so the give-points button
          only ever shows before an award — and afterwards only the winning
          comment shows the awarded badge. */}
      {isAwarded ? (
        <span className="flex items-center gap-1.5 text-accent-amber">
          <StarIcon className="h-4 w-4 fill-current" />
          <span className="text-[13px] font-semibold">已給予 {awardedAmount} 積分</span>
        </span>
      ) : canAward ? (
        <button
          type="button"
          onClick={onGivePoints}
          className="flex items-center gap-1.5 text-accent-amber"
        >
          <StarIcon />
          <span className="text-[13px] font-semibold">給予積分</span>
        </button>
      ) : null}
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
          image button that opens the full template. The template is
          reply-aware via ?replyTo, so it posts to 回覆留言
          (/comments/{commentId}/replies) with images attached through the
          shared /comments/{commentId}/images endpoint, rather than creating a
          new top-level commission comment. */}
      <div className="flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full border border-[#E5DDBF] bg-[#FDF7E9] pr-2 pl-3.5">
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
          className="h-full min-w-0 flex-1 bg-transparent text-[12.5px] text-text-primary placeholder:text-[#B8AF9E] focus:outline-none"
        />
        <Link
          href={`/posts/${postId}/comments/new?replyTo=${commentId}`}
          aria-label="用整頁模板附上圖片回覆"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-text-muted"
        >
          <ImagePlaceholderIcon className="h-[15px] w-[15px]" />
        </Link>
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="送出回覆"
        className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)] disabled:opacity-40"
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
}: {
  postId: string;
  commentId: string;
  replies: Reply[];
  isReplyOpen: boolean;
  onReply: (commentId: string, text: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasReplies = replies.length > 0;

  return (
    <div className="mt-1.5 ml-[46px] flex flex-col gap-3.5 border-l-2 border-[#EFE7CE] pl-3.5">
      {hasReplies ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="flex items-center gap-1 self-start text-[13px] font-semibold text-text-muted"
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
            <li key={reply.replyId} className="flex gap-[9px]">
              <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[7px]">
                  <span className="text-sm font-bold text-text-primary">{reply.nickName}</span>
                  {reply.isCommissioner ? (
                    <span className="rounded-full bg-[#E7EDFA] px-[9px] py-0.5 text-[11px] font-bold text-[#5B7FBE]">
                      委託人
                    </span>
                  ) : null}
                </div>
                <div className="mt-[3px] text-sm leading-[1.7] text-text-primary">
                  {reply.content}
                </div>
                {reply.hasImage ? (
                  <div className="mt-2">
                    <ImageCell variant="lg" />
                  </div>
                ) : null}
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

// The give-points options start at the commission's 本次委託發佈積分 (the amount
// the commissioner chose when publishing) as the minimum, then step up by 25.
const GIVE_POINTS_STEP = 25;
const GIVE_POINTS_OPTION_COUNT = 3;

function buildGivePointsAmounts(publishPoints: number) {
  return Array.from(
    { length: GIVE_POINTS_OPTION_COUNT },
    (_, index) => publishPoints + index * GIVE_POINTS_STEP,
  );
}

// Mock balance — replace with GET /api/v1/points/balance (availablePoints).
const MOCK_USER_POINTS = 60;

function GivePointsModal({
  targetName,
  amounts,
  selectedAmount,
  onSelectAmount,
  onClose,
  onConfirm,
}: {
  targetName: string;
  amounts: number[];
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-y-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-[rgba(64,58,50,0.42)] px-7"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="give-points-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-surface-base px-[22px] pt-[26px] pb-5 text-center shadow-[0_12px_32px_rgba(64,58,50,0.28)]"
      >
        <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#FCEFDA] text-accent-amber">
          <StarIcon className="h-6 w-6" />
        </div>
        <span
          id="give-points-title"
          className="mb-2 text-base leading-[1.5] font-bold text-text-primary"
        >
          將 {targetName} 選為最佳留言並給予積分
        </span>
        <span className="mb-5 text-[13px] leading-[1.6] text-text-muted">
          確定要將積分給予 {targetName} 嗎？此操作無法復原。
        </span>

        <div className="flex w-full justify-center gap-3">
          {amounts.map((amount) => {
            const isSelected = amount === selectedAmount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => onSelectAmount(amount)}
                aria-pressed={isSelected}
                className={`flex h-10 w-[72px] items-center justify-center rounded-full border-[1.5px] text-[15px] text-text-primary ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary font-bold'
                    : 'border-[#E5DDBF] bg-[#FDF7E9] font-medium'
                }`}
              >
                {amount}
              </button>
            );
          })}
        </div>

        <div className="mt-5 mb-4 h-px w-full bg-[#EFE7CE]" />

        <div className="flex w-full items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg border-[1.5px] border-[#E5DDBF] text-sm font-bold text-text-primary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-brand-primary text-sm font-bold text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)]"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertTriangleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 2.5 1.5 21h21L12 2.5Z" fill="currentColor" />
      <rect x="11" y="9" width="2" height="6.2" rx="1" fill="#FFFDF7" />
      <circle cx="12" cy="17.6" r="1.15" fill="#FFFDF7" />
    </svg>
  );
}

function InsufficientPointsModal({
  targetName,
  amount,
  onClose,
}: {
  targetName: string;
  amount: number;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-y-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-[rgba(64,58,50,0.42)] px-7"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="insufficient-points-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-surface-base px-[22px] pt-[26px] pb-5 text-center shadow-[0_12px_32px_rgba(64,58,50,0.28)]"
      >
        <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[rgba(196,62,50,0.1)] text-[#C43E32]">
          <AlertTriangleIcon className="h-[26px] w-[26px]" />
        </div>
        <span
          id="insufficient-points-title"
          className="mb-2 text-[14.5px] font-bold whitespace-nowrap text-text-primary"
        >
          積分不足
        </span>
        <span className="mb-5 text-[13px] leading-[1.6] text-text-muted">
          您目前的積分不足以給予 {targetName} {amount} 積分，請前往儲值積分！
        </span>

        <div className="mb-4 h-px w-full bg-[#EFE7CE]" />

        <div className="flex w-full items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg border-[1.5px] border-[#E5DDBF] text-sm font-bold text-text-primary"
          >
            取消
          </button>
          <Link
            href="/profile/points/buy"
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-[#835500] text-sm font-bold text-white shadow-[0_4px_12px_rgba(131,85,0,0.24)]"
          >
            前往儲值
          </Link>
        </div>
      </div>
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
  onGivePoints,
  isAwarded,
  awardedAmount,
  canAward,
}: {
  postId: string;
  comment: Comment;
  isLiked: boolean;
  onLike: (commentId: string) => void;
  isReplyOpen: boolean;
  onReplyClick: (commentId: string) => void;
  onReply: (commentId: string, text: string) => void;
  onGivePoints: (comment: Comment) => void;
  isAwarded: boolean;
  awardedAmount?: number;
  canAward: boolean;
}) {
  return (
    <article className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
          <UserIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-text-primary">{comment.nickName}</span>
            {isAwarded ? (
              <span className="flex items-center gap-1 rounded-full bg-[#FCEFDA] px-[9px] py-0.5 text-[11px] font-bold text-accent-amber">
                <StarIcon className="h-3 w-3 fill-current" />
                最佳留言
              </span>
            ) : null}
            <time className="ml-auto text-[12px] text-[#B8AF9E]">{comment.timeLabel}</time>
            <span className="rounded-md bg-[rgba(169,184,142,0.15)] px-[7px] py-0.5 text-[11px] font-bold text-[#4E6B45]">
              {comment.floor}
            </span>
          </div>
          <div className="mt-1 text-[14.5px] leading-[1.7] text-text-primary">
            {comment.content}
          </div>
          <CommentImages comment={comment} />
          <CommentActions
            likeCount={comment.likeCount}
            isLiked={isLiked}
            onLike={() => onLike(comment.commentId)}
            isReplyOpen={isReplyOpen}
            onReplyClick={() => onReplyClick(comment.commentId)}
            onGivePoints={() => onGivePoints(comment)}
            isAwarded={isAwarded}
            awardedAmount={awardedAmount}
            canAward={canAward}
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
        />
      ) : null}
    </article>
  );
}

export default function CommentBoard({
  postId,
  initialComments,
  publishPoints,
}: {
  postId: string;
  initialComments: Comment[];
  publishPoints: number;
}) {
  const giveAmounts = buildGivePointsAmounts(publishPoints);
  const [comments, setComments] = useState(initialComments);
  // Tracks which comments the current user has liked. The base like count lives
  // on each comment; this only records the current user's optimistic toggle.
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [pointsTarget, setPointsTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(publishPoints);
  const [insufficient, setInsufficient] = useState<{ name: string; amount: number } | null>(null);
  // A commission's reward is awarded at most once. Once set, the winning
  // comment shows the best-comment style and every comment's give-points button
  // is hidden — mirroring the best-comment API, which 409s on a second award.
  const [awarded, setAwarded] = useState<{ commentId: string; amount: number } | null>(null);
  // Only one comment's reply box is open at a time — cleaner on the mobile
  // width and keeps the composer focus unambiguous.
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLLIElement>(null);
  const isFirstRender = useRef(true);

  // Scroll the newest comment into view after it is appended, but not on the
  // initial render (the board should open scrolled to the top).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  // Optimistically append the new comment. The network write is handled by
  // CommentComposer; we mirror the existing fire-and-forget pattern and do not
  // roll back on failure until the real comments API is wired up.
  function addComment(text: string) {
    setComments((prev) => [
      ...prev,
      {
        commentId: `tmp_${Date.now()}`,
        floor: `B${prev.length + 1}`,
        nickName: '你',
        timeLabel: '剛剛',
        content: text,
        likeCount: 0,
      },
    ]);
  }

  // Optimistically insert the reply into its parent comment, then fire the
  // (mock) network write. This is the quick text-only path; a reply with images
  // goes through the reply-aware full template instead (see ReplyComposer).
  // Mirrors addComment: fire-and-forget, no rollback until POST
  // /api/v1/comments/{commentId}/replies is wired up.
  function addReply(commentId: string, text: string) {
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId
          ? {
              ...comment,
              replies: [
                ...(comment.replies ?? []),
                { replyId: `tmp_${Date.now()}`, nickName: '你', content: text },
              ],
            }
          : comment,
      ),
    );
    void fetch(`/api/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    }).catch(() => {});
    // Collapse the composer now that the reply has been sent.
    setActiveReplyId(null);
  }

  // Optimistically toggle the current user's like, then fire the (mock) write.
  // Mirrors addReply: fire-and-forget, no rollback until POST
  // /api/comments/{commentId}/like is wired up.
  function toggleLike(commentId: string) {
    const liked = !likedComments[commentId];
    setLikedComments((prev) => ({ ...prev, [commentId]: liked }));
    void fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked }),
    }).catch(() => {});
  }

  function openGivePoints(comment: Comment) {
    setPointsTarget({ id: comment.commentId, name: comment.nickName });
    setSelectedAmount(publishPoints);
  }

  function closeGivePoints() {
    setPointsTarget(null);
  }

  function confirmGivePoints() {
    if (!pointsTarget) return;
    // Not enough points: surface the insufficient-points modal instead.
    if (selectedAmount > MOCK_USER_POINTS) {
      setInsufficient({ name: pointsTarget.name, amount: selectedAmount });
      setPointsTarget(null);
      return;
    }
    // Optimistically mark the winning comment, then fire the award write. The
    // Idempotency-Key guards against a double confirm resulting in two awards;
    // fire-and-forget with no rollback mirrors addComment/addReply until the
    // real best-comment API is wired up.
    const commentId = pointsTarget.id;
    setAwarded({ commentId, amount: selectedAmount });
    setPointsTarget(null);
    void fetch(`/api/commissions/${postId}/best-comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ commentId }),
    }).catch(() => {});
  }

  return (
    <>
      {/* Comment list — grows with the page (document scroll); flex-1 keeps the
          sticky composer pinned to the bottom even when there are few comments. */}
      <ul className="flex flex-1 flex-col gap-5 px-4.5 pt-5 pb-5">
        {comments.map((comment, index) => (
          <li key={comment.commentId} className="flex flex-col gap-5">
            <CommentItem
              postId={postId}
              comment={comment}
              isLiked={likedComments[comment.commentId] ?? false}
              onLike={toggleLike}
              isReplyOpen={activeReplyId === comment.commentId}
              onReplyClick={(id) => setActiveReplyId((prev) => (prev === id ? null : id))}
              onReply={addReply}
              onGivePoints={openGivePoints}
              isAwarded={awarded?.commentId === comment.commentId}
              awardedAmount={awarded?.amount}
              canAward={awarded === null}
            />
            {index < comments.length - 1 ? (
              <div className="h-px bg-[#E0D4AA]" aria-hidden="true" />
            ) : null}
          </li>
        ))}
        <li ref={bottomRef} aria-hidden="true" />
      </ul>

      {/* Bottom comment bar — quick text inline, or the dedicated template */}
      <CommentComposer
        postId={postId}
        onSubmit={addComment}
        templateHref={`/posts/${postId}/comments/new`}
      />

      {pointsTarget ? (
        <GivePointsModal
          targetName={pointsTarget.name}
          amounts={giveAmounts}
          selectedAmount={selectedAmount}
          onSelectAmount={setSelectedAmount}
          onClose={closeGivePoints}
          onConfirm={confirmGivePoints}
        />
      ) : null}

      {insufficient ? (
        <InsufficientPointsModal
          targetName={insufficient.name}
          amount={insufficient.amount}
          onClose={() => setInsufficient(null)}
        />
      ) : null}
    </>
  );
}
