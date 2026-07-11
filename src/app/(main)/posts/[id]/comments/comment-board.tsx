'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getPointWallet } from '@/lib/points-api';
import { getAuthedUser } from '../../../../auth';
import CommentComposer from '../comment-composer';
import {
  ChevronDownIcon,
  HeartIcon,
  ImagePlaceholderIcon,
  ReplyIcon,
  SendIcon,
  StarIcon,
  UserIcon,
} from './comment-icons';
import {
  buildGivePointsAmounts,
  DeleteConfirmModal,
  GivePointsModal,
  InsufficientPointsModal,
} from './comment-modals';
import { categoryLabel } from '../image-categories';
import {
  addPendingComment,
  addPendingReply,
  mergePendingComments,
  removePendingComment,
  removePendingReply,
} from '../pending-comments';

// Shape returned by the (future) POST /uploads endpoint plus the category/brand
// the user tagged it with — matches the backend's per-image record.
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
  isCommissioner?: boolean;
  images?: CommentImage[];
  // Captured from the author's login identity at creation time — never
  // rendered. Used only to gate the 編輯 entry point to the actual author,
  // since nickName alone could collide between two real users.
  authorEmail?: string;
};

export type Comment = {
  commentId: string;
  floor: string;
  nickName: string;
  timeLabel: string;
  content: string;
  likeCount: number;
  images?: CommentImage[];
  replies?: Reply[];
  // Same as Reply.authorEmail — never rendered.
  authorEmail?: string;
};

function ImageCell({ label, variant }: { label?: string; variant: 'lg' | 'grid' }) {
  const isGrid = variant === 'grid';
  return (
    <div
      role="img"
      aria-label={label ?? '穿搭參考圖'}
      className={
        isGrid
          ? 'relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#EAE2CB] text-text-placeholder'
          : 'relative flex h-28.5 w-28.5 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#EAE2CB] text-text-placeholder'
      }
    >
      <ImagePlaceholderIcon className={isGrid ? 'h-4.5 w-4.5' : 'h-5.5 w-5.5'} />
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

// A labelled overlay only makes sense once a brand is attached — an untagged
// category alone ("上衣" with nothing else) is not worth showing on the card.
function imageLabel(image: CommentImage): string | undefined {
  return image.brand ? `${categoryLabel(image.category)}：${image.brand}` : undefined;
}

// Layout is derived from the count rather than stored, so comments and
// replies (which share this same image shape) render consistently.
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
          <ImageCell key={image.imageId} label={imageLabel(image)} variant="grid" />
        ))}
      </div>
    );
  }

  if (layout === 'single') {
    return (
      <div className="mt-2.5">
        <ImageCell label={imageLabel(images[0])} variant="lg" />
      </div>
    );
  }

  // scroll strip
  return (
    <div className="mt-2.5 flex [scrollbar-width:none] gap-2 overflow-x-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {images.map((image) => (
        <ImageCell key={image.imageId} label={imageLabel(image)} variant="lg" />
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
    <div className="mt-4 flex items-center gap-4.5">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={isLiked}
        className={`flex items-center gap-1.5 ${isLiked ? 'text-accent-amber' : 'text-text-primary'}`}
      >
        <HeartIcon className={isLiked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
        <span className="sr-only">讚</span>
        <span className="text-label-md">{displayLikeCount}</span>
      </button>
      <button
        type="button"
        onClick={onReplyClick}
        aria-expanded={isReplyOpen}
        className="flex items-center gap-1.5 text-text-muted"
      >
        <ReplyIcon />
        <span className="text-label-md font-semibold">回覆</span>
      </button>
      {/* Once the commission's reward is awarded it is a one-time state
          (best-comment API 409s on a second call), so the give-points button
          only ever shows before an award — and afterwards only the winning
          comment shows the awarded badge. */}
      {isAwarded ? (
        <span className="flex items-center gap-1.5 text-accent-amber">
          <StarIcon className="h-4 w-4 fill-current" />
          <span className="text-label-md font-semibold">已給予 {awardedAmount} 積分</span>
        </span>
      ) : canAward ? (
        <button
          type="button"
          onClick={onGivePoints}
          className="flex items-center gap-1.5 text-accent-amber"
        >
          <StarIcon />
          <span className="text-label-md font-semibold">給予積分</span>
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
          href={`/posts/${postId}/comments/new?replyTo=${commentId}`}
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
        className="flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-cta disabled:opacity-40"
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
  onDeleteReply,
  defaultExpanded,
  currentUserEmail,
}: {
  postId: string;
  commentId: string;
  replies: Reply[];
  isReplyOpen: boolean;
  onReply: (commentId: string, text: string) => void;
  onDeleteReply: (replyId: string) => void;
  // Start expanded when the user just replied here via the template, so the new
  // reply shows immediately instead of collapsed behind the toggle.
  defaultExpanded: boolean;
  // The logged-in user's email, used to gate the 編輯 entry point to only the
  // current user's own replies (matched against Reply.authorEmail, not the
  // displayed nickname — two real users could share a nickname).
  currentUserEmail: string | null;
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
          className="flex items-center gap-1 self-start text-label-md font-semibold text-text-muted"
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
                  {reply.isCommissioner ? <Badge variant="blue">委託人</Badge> : null}
                  <time className="ml-auto text-label-md text-text-placeholder">
                    {reply.timeLabel}
                  </time>
                  {reply.authorEmail !== undefined && reply.authorEmail === currentUserEmail ? (
                    <>
                      <Link
                        href={`/posts/${postId}/comments/new?replyTo=${commentId}&editReplyId=${reply.replyId}`}
                        className="text-label-md font-semibold text-text-muted"
                      >
                        編輯
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDeleteReply(reply.replyId)}
                        className="text-label-md font-semibold text-text-muted"
                      >
                        刪除
                      </button>
                    </>
                  ) : null}
                </div>
                <div className="mt-0.75 text-body-lg leading-[1.7] text-text-primary">
                  {reply.content}
                </div>
                <AttachedImages images={reply.images} />
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
  onGivePoints,
  isAwarded,
  awardedAmount,
  canAward,
  defaultExpanded,
  currentUserEmail,
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
  onGivePoints: (comment: Comment) => void;
  isAwarded: boolean;
  awardedAmount?: number;
  canAward: boolean;
  defaultExpanded: boolean;
  // The logged-in user's email, used to gate the 編輯 entry point to only the
  // current user's own comment/replies (matched against authorEmail, not the
  // displayed nickName — two real users could share a nickname).
  currentUserEmail: string | null;
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
            {isAwarded ? (
              <Badge variant="gold">
                <StarIcon className="h-3 w-3 fill-current" />
                最佳留言
              </Badge>
            ) : null}
            <time className="ml-auto text-label-md text-text-placeholder">{comment.timeLabel}</time>
            {/* Square corner (not the default pill) to read as a compact button
                like 追蹤, distinguishing the floor number from the tag chips. */}
            <Badge variant="green" className="rounded-lg">
              {comment.floor}
            </Badge>
            {comment.authorEmail !== undefined && comment.authorEmail === currentUserEmail ? (
              <>
                <Link
                  href={`/posts/${postId}/comments/new?editCommentId=${comment.commentId}`}
                  className="text-label-md font-semibold text-text-muted"
                >
                  編輯
                </Link>
                <button
                  type="button"
                  onClick={() => onDeleteComment(comment.commentId)}
                  className="text-label-md font-semibold text-text-muted"
                >
                  刪除
                </button>
              </>
            ) : null}
          </div>
          <div className="mt-1 text-body-lg leading-[1.7] text-text-primary">{comment.content}</div>
          <AttachedImages images={comment.images} />
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
          onDeleteReply={(replyId) => onDeleteReply(comment.commentId, replyId)}
          defaultExpanded={defaultExpanded}
          currentUserEmail={currentUserEmail}
        />
      ) : null}
    </article>
  );
}

export default function CommentBoard({
  postId,
  initialComments,
  publishPoints,
  focusId,
  expandReplyId,
}: {
  postId: string;
  initialComments: Comment[];
  publishPoints: number;
  // Set (from ?focus=) when the user just posted via the full-page template: the
  // DOM id (`comment-{id}` / `reply-{id}`) to scroll into view once the pending
  // merge brings it in. Undefined on a plain navigation in.
  focusId?: string;
  // Set (from ?expand=) when the user just replied via the template: the parent
  // comment id whose reply list should open so the new reply is not hidden
  // behind the collapse toggle.
  expandReplyId?: string;
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
  // The logged-in user's email, used to gate the 編輯 entry point to only the
  // current user's own comments/replies (matched against authorEmail, never
  // the displayed nickName — two real users could share a nickname). Read in
  // an effect (not inline during render) since it comes from localStorage and
  // would otherwise mismatch between the server render and the client, same
  // as the pending merge below.
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUserEmail(getAuthedUser()?.email ?? null);
  }, []);

  // The give-points affordability check needs the real wallet balance, not
  // the MOCK_USER_POINTS placeholder. Defaults to 0 (rather than leaving it
  // unset) so the check fails closed while the fetch is in flight.
  const [userPoints, setUserPoints] = useState(0);
  useEffect(() => {
    let active = true;
    getPointWallet().then((res) => {
      if (active && res.success && res.data) setUserPoints(res.data.currentPoints);
    });
    return () => {
      active = false;
    };
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  // We only ever auto-scroll when the user just posted: `focusId` (from the
  // template's ?focus=) on arrival, or an inline add this session (below). A
  // plain navigation in carries no focus, so the last browsed scroll position is
  // left untouched/restored.
  //
  // Which item to scroll to once it is present in the list; consumed once, then
  // cleared. Seeded from `focusId` so a return from the template scrolls after
  // the pending merge brings the new comment in.
  const scrollTargetRef = useRef<string | null>(focusId ?? null);

  // Set by a delete button (not yet wired to any UI — see deleteComment/
  // deleteReply below) to drive the confirmation modal.
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'comment'; commentId: string }
    | { type: 'reply'; commentId: string; replyId: string }
    | null
  >(null);

  // Merge any optimistically-added comments/replies from earlier in the session
  // (e.g. submitted via the full-page template, which navigates away and back)
  // onto the server mock data. Runs on mount only; `mergePendingComments` is pure
  // in `initialComments`, so re-running would produce the same list.
  //
  // This deliberately syncs state after mount rather than in a lazy `useState`
  // initializer: the pending store lives in sessionStorage (client-only), so
  // reading it during render would mismatch the server-rendered HTML. That is
  // exactly the client-only-external-store case the set-state-in-effect rule
  // does not account for, hence the disable.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setComments(mergePendingComments(postId, initialComments));
  }, [postId, initialComments]);

  // Scroll to the just-posted comment/reply once it appears in the list — either
  // an inline add this session or a return from the full-page template (?focus=).
  // `scrollTargetRef` holds the target's DOM id (`comment-{id}` or `reply-{id}`).
  // Runs on every comments change but only acts while a target is pending, so a
  // plain navigation in (no target) never scrolls and the last position stays.
  useEffect(() => {
    const targetId = scrollTargetRef.current;
    if (!targetId) return;
    const el = document.getElementById(targetId);
    // Not rendered yet (awaiting the pending merge, or the parent's replies not
    // expanded) — wait for the next comments change rather than clearing it.
    if (!el) return;
    scrollTargetRef.current = null;
    // A new top-level comment always lands as the last list item, right above
    // the sticky composer — there's no room below it to satisfy `block:
    // 'center'` (the browser can't scroll past the end of the document), so
    // it would just stop short of centre; `nearest` has no such requirement
    // and reliably brings it into view. A reply's parent comment is rarely
    // the last one in the thread, so there is usually enough content below
    // it for `center` to actually work, and it reads better centred.
    el.scrollIntoView({
      behavior: 'smooth',
      block: targetId.startsWith('reply-') ? 'center' : 'nearest',
    });
    // Drop the ?focus= param so a reload or back-navigation does not re-scroll.
    if (focusId) router.replace(pathname, { scroll: false });
  }, [comments, focusId, pathname, router]);

  // Optimistically append the new comment and persist it to the pending store so
  // it survives navigation/reload within the session (no comments backend yet).
  function addComment(text: string) {
    const authedUser = getAuthedUser();
    const comment = {
      commentId: crypto.randomUUID(),
      nickName: authedUser?.nickName ?? '你',
      timeLabel: '剛剛',
      content: text,
      likeCount: 0,
      authorEmail: authedUser?.email,
    };
    setComments((prev) => [...prev, { ...comment, floor: `B${prev.length + 1}` }]);
    addPendingComment(postId, comment);
    // Scroll to it once it renders (the effect keyed on `comments` picks this up).
    scrollTargetRef.current = `comment-${comment.commentId}`;
  }

  // Optimistically insert the reply into its parent comment and persist it. This
  // is the quick text-only path; a reply with images goes through the
  // reply-aware full template instead (see ReplyComposer). No rollback — there
  // is no backend to reconcile against yet.
  function addReply(commentId: string, text: string) {
    const authedUser = getAuthedUser();
    const reply = {
      replyId: crypto.randomUUID(),
      nickName: authedUser?.nickName ?? '你',
      timeLabel: '剛剛',
      content: text,
      authorEmail: authedUser?.email,
    };
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId
          ? { ...comment, replies: [...(comment.replies ?? []), reply] }
          : comment,
      ),
    );
    addPendingReply(postId, commentId, reply);
    // Scroll the new reply into view once it renders (its parent's reply list is
    // expanded by the ReplyComposer's submit handler, so it is on screen).
    scrollTargetRef.current = `reply-${reply.replyId}`;
    // Collapse the composer now that the reply has been sent.
    setActiveReplyId(null);
  }

  // Removes a top-level comment optimistically and drops it from the pending
  // store. Not yet wired to any button — the delete confirmation modal below
  // is ready for a teammate to trigger via setDeleteTarget.
  function deleteComment(commentId: string) {
    removePendingComment(postId, commentId);
    setComments((prev) =>
      prev
        .filter((comment) => comment.commentId !== commentId)
        // Floors are assigned by position, not a stable id, so removing one
        // leaves a gap unless the rest are renumbered to match their new order.
        .map((comment, index) => ({ ...comment, floor: `B${index + 1}` })),
    );
    setDeleteTarget(null);
  }

  function deleteReply(commentId: string, replyId: string) {
    removePendingReply(postId, commentId, replyId);
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
    if (selectedAmount > userPoints) {
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
          <li
            key={comment.commentId}
            id={`comment-${comment.commentId}`}
            className="flex flex-col gap-5"
          >
            <CommentItem
              postId={postId}
              comment={comment}
              isLiked={likedComments[comment.commentId] ?? false}
              onLike={toggleLike}
              isReplyOpen={activeReplyId === comment.commentId}
              onReplyClick={(id) => setActiveReplyId((prev) => (prev === id ? null : id))}
              onReply={addReply}
              onDeleteComment={(commentId) => setDeleteTarget({ type: 'comment', commentId })}
              onDeleteReply={(commentId, replyId) =>
                setDeleteTarget({ type: 'reply', commentId, replyId })
              }
              onGivePoints={openGivePoints}
              isAwarded={awarded?.commentId === comment.commentId}
              awardedAmount={awarded?.amount}
              canAward={awarded === null}
              defaultExpanded={expandReplyId === comment.commentId}
              currentUserEmail={currentUserEmail}
            />
            {index < comments.length - 1 ? <Separator aria-hidden="true" /> : null}
          </li>
        ))}
      </ul>

      {/* Bottom comment bar — quick text inline, or the dedicated template */}
      <CommentComposer onSubmit={addComment} templateHref={`/posts/${postId}/comments/new`} />

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
