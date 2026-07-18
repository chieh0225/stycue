import { ChevronLeft } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/ui/top-bar';
import { getPostCommentsServer } from '@/lib/post-comment-server';
import { getPostServer } from '@/lib/post-server';
import type { CommentResponse } from '@/types/comment';
import CommentBoard, { type Comment, type CommentImage, type Reply } from './comment-board';
import HideScrollbar from '../hide-scrollbar';

// Same relative-time treatment as posts/commissions/[id]/comments/page.tsx —
// the backend serializes createdAt without a timezone suffix even though the
// value is UTC, so an offset-less ISO string needs "Z" appended before
// new Date() would otherwise silently be off by the local UTC offset.
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

function toReply(response: CommentResponse): Reply {
  return {
    replyId: String(response.commentId),
    nickName: response.author.displayName,
    timeLabel: formatRelativeTime(response.createdAt),
    content: response.content,
    images: toCommentImages(response.images),
    likeCount: response.likeCount,
    isLiked: response.isLiked,
    isOwner: response.isOwner,
    canEdit: response.canEdit,
    canDelete: response.canDelete,
  };
}

function toComment(response: CommentResponse, index: number): Comment {
  return {
    commentId: String(response.commentId),
    floor: `B${index + 1}`,
    nickName: response.author.displayName,
    timeLabel: formatRelativeTime(response.createdAt),
    content: response.content,
    likeCount: response.likeCount,
    isLiked: response.isLiked,
    isOwner: response.isOwner,
    images: toCommentImages(response.images),
    replies: response.replies.map(toReply),
    canEdit: response.canEdit,
    canDelete: response.canDelete,
  };
}

export default async function SharePostCommentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ focus?: string | string[]; expand?: string | string[] }>;
}) {
  const { id } = await params;
  const isLoggedIn = Boolean((await cookies()).get('stycue_access_token')?.value);
  const { focus, expand } = await searchParams;
  const focusId = typeof focus === 'string' ? focus : undefined;
  const expandReplyId = typeof expand === 'string' ? expand : undefined;

  const [commentsResult, postResult] = await Promise.all([
    getPostCommentsServer(id),
    getPostServer(id),
  ]);
  if (!postResult.success || !postResult.data) notFound();
  const comments =
    commentsResult.success && commentsResult.data
      ? commentsResult.data.map((comment, index) => toComment(comment, index))
      : [];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      <TopBar
        left={
          <Link href={`/posts/share/${id}`} aria-label="返回文章" className="text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
        title="全部留言"
        className="py-4"
      />

      <CommentBoard
        postId={id}
        initialComments={comments}
        focusId={focusId}
        expandReplyId={expandReplyId}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
