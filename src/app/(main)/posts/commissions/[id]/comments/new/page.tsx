import { X } from 'lucide-react';
import Link from 'next/link';
import { TopBar } from '@/components/ui/top-bar';
import AddCommentForm from './add-comment-form';
import HideScrollbar from '../../hide-scrollbar';

export default async function NewCommentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  // `?replyTo={commentId}` switches this screen from composing a new top-level
  // commission comment to composing a reply under that comment. `?editCommentId=`/
  // `?editReplyId=` switch it to editing an existing comment/reply instead of
  // composing a new one (editReplyId is always paired with replyTo, which
  // doubles as the parent comment id). A string[] (a repeated param) is not a
  // valid single target, so treat it as no target.
  const resolvedSearchParams = await searchParams;
  const replyToParam = resolvedSearchParams.replyTo;
  const editCommentIdParam = resolvedSearchParams.editCommentId;
  const editReplyIdParam = resolvedSearchParams.editReplyId;
  const replyTo = typeof replyToParam === 'string' ? replyToParam : undefined;
  const editCommentId = typeof editCommentIdParam === 'string' ? editCommentIdParam : undefined;
  const editReplyId = typeof editReplyIdParam === 'string' ? editReplyIdParam : undefined;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      {/* Header — sticky so it stays pinned to the top while the body scrolls */}
      <TopBar
        left={
          <Link
            href={`/posts/commissions/${id}/comments`}
            aria-label="關閉"
            className="text-foreground"
          >
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
      />
    </div>
  );
}
