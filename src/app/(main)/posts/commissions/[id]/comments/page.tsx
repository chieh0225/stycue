import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { TopBar } from '@/components/ui/top-bar';
import { getCommentsServer } from '@/lib/comment-server';
import { getCommissionServer } from '@/lib/commission-server';
import type { CommentResponse } from '@/types/comment';
import CommentBoard, { type Comment, type CommentImage, type Reply } from './comment-board';
import HideScrollbar from '../hide-scrollbar';
import { MOCK_PUBLISH_POINTS } from '../mock-commission';

// Relative-time label to match the design copy (e.g. "43 分前", "剛剛"). The
// API only returns an ISO createdAt, so this is computed on render rather
// than stored.
//
// The backend serializes createdAt without a timezone suffix (e.g.
// "2026-07-14T15:35:15.4624895") even though the value is UTC. `new Date()`
// treats an offset-less ISO string as local time, so without this it would
// silently be off by the server/browser's UTC offset (8 hours in Taipei).
// Append "Z" whenever the string has no explicit zone marker.
function parseServerDate(iso: string): Date {
  const hasTimezone = /[Zz]|[+-]\d{2}:\d{2}$/.test(iso);
  return new Date(hasTimezone ? iso : `${iso}Z`);
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - parseServerDate(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return '剛剛';
  if (diffMinutes < 60) return `${diffMinutes} 分前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} 小時前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} 天前`;
}

function toCommentImages(images: CommentResponse['images']): CommentImage[] | undefined {
  if (images.length === 0) return undefined;
  return images.map((image) => ({
    imageId: image.imageId,
    imageUrl: image.url,
    category: image.category ?? 99,
    brand: image.brand ?? '',
  }));
}

function toReply(response: CommentResponse, commissionAuthorId: number | undefined): Reply {
  return {
    replyId: String(response.commentId),
    nickName: response.author.displayName,
    timeLabel: formatRelativeTime(response.createdAt),
    content: response.content,
    isCommissioner:
      commissionAuthorId !== undefined && response.author.userId === commissionAuthorId,
    images: toCommentImages(response.images),
    canEdit: response.canEdit,
    canDelete: response.canDelete,
  };
}

function toComment(
  response: CommentResponse,
  index: number,
  commissionAuthorId: number | undefined,
): Comment {
  return {
    commentId: String(response.commentId),
    floor: `B${index + 1}`,
    nickName: response.author.displayName,
    timeLabel: formatRelativeTime(response.createdAt),
    content: response.content,
    likeCount: response.likeCount,
    images: toCommentImages(response.images),
    replies: response.replies.map((reply) => toReply(reply, commissionAuthorId)),
    canEdit: response.canEdit,
    canDelete: response.canDelete,
  };
}

export default async function PostCommentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ focus?: string | string[]; expand?: string | string[] }>;
}) {
  const { id } = await params;
  // The full-page template redirects back with ?focus={domId} to scroll the
  // board to the just-posted item, and ?expand={parentId} when it was a reply so
  // its reply list opens. Read them here (server) and hand them to the board as
  // plain props so the client component avoids useSearchParams (which would
  // force a Suspense boundary). Duplicated params (arrays) are ignored.
  const { focus, expand } = await searchParams;
  const focusId = typeof focus === 'string' ? focus : undefined;
  const expandReplyId = typeof expand === 'string' ? expand : undefined;

  const [commentsResult, commissionResult] = await Promise.all([
    getCommentsServer(id),
    getCommissionServer(id),
  ]);
  const commissionAuthorId = commissionResult.success
    ? commissionResult.data?.author.userId
    : undefined;
  const publishPoints = commissionResult.success
    ? (commissionResult.data?.points ?? MOCK_PUBLISH_POINTS)
    : MOCK_PUBLISH_POINTS;
  const comments =
    commentsResult.success && commentsResult.data
      ? commentsResult.data.map((comment, index) => toComment(comment, index, commissionAuthorId))
      : [];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      {/* Header — sticky so it stays pinned to the top while the page scrolls */}
      <TopBar
        left={
          <Link href={`/posts/commissions/${id}`} aria-label="返回文章" className="text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
        title="全部留言"
        className="py-4"
      />

      <CommentBoard
        postId={id}
        initialComments={comments}
        publishPoints={publishPoints}
        focusId={focusId}
        expandReplyId={expandReplyId}
      />
    </div>
  );
}
