import Link from 'next/link';
import AddCommentForm from './add-comment-form';
import HideScrollbar from '../../hide-scrollbar';

function CloseIcon({ className = 'h-5 w-5' }: { className?: string }) {
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
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default async function NewCommentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  // `?replyTo={commentId}` switches this screen from composing a new top-level
  // commission comment to composing a reply under that comment. A string[] (a
  // repeated param) is not a valid single target, so treat it as no target.
  const replyToParam = (await searchParams).replyTo;
  const replyTo = typeof replyToParam === 'string' ? replyToParam : undefined;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      {/* Header — sticky so it stays pinned to the top while the body scrolls */}
      <header className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-border-default bg-surface-soft px-4.5 pt-5 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <Link href={`/posts/${id}/comments`} aria-label="關閉" className="text-text-primary">
          <CloseIcon />
        </Link>
        <h1 className="text-base font-bold text-text-primary">
          {replyTo ? '回覆留言' : '新增留言'}
        </h1>
        {/* Spacer keeps the title optically centred opposite the close button */}
        <span className="w-5" aria-hidden="true" />
      </header>

      <AddCommentForm postId={id} replyTo={replyTo} />
    </div>
  );
}
