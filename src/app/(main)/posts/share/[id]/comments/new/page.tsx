import { X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/ui/top-bar';
import { getPostCommentsServer } from '@/lib/post-comment-server';
import type { CommentResponse } from '@/types/comment';
import HideScrollbar from '../../hide-scrollbar';
import type { CommentImage } from '../comment-board';
import AddCommentForm from './add-comment-form';

function toCommentImages(images: CommentResponse['images']): CommentImage[] | undefined {
  if (images.length === 0) return undefined;
  return images.map((image) => ({
    imageId: image.imageId,
    imageUrl: image.url,
    category: image.category ?? 99,
    brand: image.brand ?? '',
  }));
}

// Finds the comment or reply matching the given id within the post's real
// comment list, fetched fresh so edit prefill always reflects the current
// backend content rather than a stale local copy.
function findEditTarget(
  comments: CommentResponse[],
  commentId: string,
): CommentResponse | undefined {
  for (const comment of comments) {
    if (String(comment.commentId) === commentId) return comment;
    const reply = comment.replies.find((r) => String(r.commentId) === commentId);
    if (reply) return reply;
  }
  return undefined;
}

export default async function NewSharePostCommentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  // Same query-param contract as posts/commissions/[id]/comments/new/page.tsx
  // — `?replyTo={commentId}` switches to composing a reply, `?editCommentId=`/
  // `?editReplyId=` switch to editing an existing comment/reply.
  const resolvedSearchParams = await searchParams;
  const replyToParam = resolvedSearchParams.replyTo;
  const editCommentIdParam = resolvedSearchParams.editCommentId;
  const editReplyIdParam = resolvedSearchParams.editReplyId;
  const replyTo = typeof replyToParam === 'string' ? replyToParam : undefined;
  const editCommentId = typeof editCommentIdParam === 'string' ? editCommentIdParam : undefined;
  const editReplyId = typeof editReplyIdParam === 'string' ? editReplyIdParam : undefined;

  const cancelHref = `/posts/share/${id}/comments`;
  const isEditingComment = Boolean(editCommentId);
  const isEditingReply = Boolean(editReplyId && replyTo);

  let initialContent: string | undefined;
  let initialImages: CommentImage[] | undefined;

  if (isEditingComment || isEditingReply) {
    const targetId = (isEditingReply ? editReplyId : editCommentId)!;
    const result = await getPostCommentsServer(id);
    const target =
      result.success && result.data ? findEditTarget(result.data, targetId) : undefined;
    // Missing/stale id (deleted comment, bad link) — fall back to a plain
    // cancel-navigation rather than rendering an edit form with nothing to edit.
    if (!target) redirect(cancelHref);
    initialContent = target.content;
    initialImages = toCommentImages(target.images);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      <TopBar
        left={
          <Link href={cancelHref} aria-label="關閉" className="text-foreground">
            <X className="h-5 w-5" />
          </Link>
        }
        title={
          editReplyId ? '編輯回覆' : editCommentId ? '編輯留言' : replyTo ? '回覆留言' : '新增留言'
        }
        className="py-4"
      />

      <AddCommentForm
        postId={id}
        replyTo={replyTo}
        editCommentId={editCommentId}
        editReplyId={editReplyId}
        initialContent={initialContent}
        initialImages={initialImages}
      />
    </div>
  );
}
