'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
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
  showReplyBox?: boolean;
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

function ImageCell({ label, variant }: { label?: string; variant: 'lg' | 'grid' }) {
  const isGrid = variant === 'grid';
  return (
    <div
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

function CommentActions({ likeCount }: { likeCount: number }) {
  return (
    <div className="mt-4 flex items-center gap-[18px]">
      <div className="flex items-center gap-1.5 text-text-primary">
        <HeartIcon />
        <span className="sr-only">讚</span>
        <span className="text-[13px]">{likeCount}</span>
      </div>
      {/* TODO: wire up the give-points modal + best-comment API in a later step. */}
      <div className="flex items-center gap-1.5 text-accent-amber">
        <StarIcon />
        <span className="text-[13px] font-semibold">給予積分</span>
      </div>
    </div>
  );
}

function ReplyComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  function submit() {
    if (!trimmed) return;
    setText('');
    onSubmit(trimmed);
  }

  return (
    <div className="flex items-center gap-2">
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
        placeholder="加入討論..."
        aria-label="加入討論"
        className="h-9 flex-1 rounded-full border border-[#E5DDBF] bg-[#FDF7E9] px-3.5 text-[12.5px] text-text-primary placeholder:text-[#B8AF9E] focus:outline-none"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!trimmed}
        aria-label="送出回覆"
        className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)] disabled:opacity-40"
      >
        <SendIcon />
      </button>
    </div>
  );
}

function ReplyList({
  commentId,
  replies,
  showReplyBox,
  onReply,
}: {
  commentId: string;
  replies: Reply[];
  showReplyBox?: boolean;
  onReply: (commentId: string, text: string) => void;
}) {
  return (
    <div className="mt-1.5 ml-[46px] flex flex-col gap-3.5 border-l-2 border-[#EFE7CE] pl-3.5">
      {replies.map((reply) => (
        <div key={reply.replyId} className="flex gap-[9px]">
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
            <div className="mt-[3px] text-sm leading-[1.7] text-text-primary">{reply.content}</div>
            {reply.hasImage ? (
              <div className="mt-2">
                <ImageCell variant="lg" />
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {showReplyBox ? <ReplyComposer onSubmit={(text) => onReply(commentId, text)} /> : null}
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (commentId: string, text: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
          <UserIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-text-primary">{comment.nickName}</span>
            <span className="ml-auto text-[12px] text-[#B8AF9E]">{comment.timeLabel}</span>
            <span className="rounded-md bg-[rgba(169,184,142,0.15)] px-[7px] py-0.5 text-[11px] font-bold text-[#4E6B45]">
              {comment.floor}
            </span>
          </div>
          <div className="mt-1 text-[14.5px] leading-[1.7] text-text-primary">
            {comment.content}
          </div>
          <CommentImages comment={comment} />
          <CommentActions likeCount={comment.likeCount} />
        </div>
      </div>

      {(comment.replies && comment.replies.length > 0) || comment.showReplyBox ? (
        <ReplyList
          commentId={comment.commentId}
          replies={comment.replies ?? []}
          showReplyBox={comment.showReplyBox}
          onReply={onReply}
        />
      ) : null}
    </div>
  );
}

export default function CommentBoard({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const bottomRef = useRef<HTMLDivElement>(null);
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
  // (mock) network write. Mirrors addComment: fire-and-forget, no rollback
  // until POST /api/v1/comments/{commentId}/replies is wired up.
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
  }

  return (
    <>
      {/* Scrollable body — extra bottom padding clears the fixed comment bar */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4.5 pt-5 pb-24">
        {comments.map((comment, index) => (
          <Fragment key={comment.commentId}>
            <CommentItem comment={comment} onReply={addReply} />
            {index < comments.length - 1 ? <div className="h-px bg-[#E0D4AA]" /> : null}
          </Fragment>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Bottom comment bar */}
      <CommentComposer postId={postId} onSubmit={addComment} />
    </>
  );
}
