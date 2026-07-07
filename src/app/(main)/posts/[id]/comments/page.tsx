import Link from 'next/link';
import { Fragment } from 'react';
import CommentComposer from '../comment-composer';

type CommentImage = { label?: string };

type Reply = {
  replyId: string;
  nickName: string;
  content: string;
  isCommissioner?: boolean;
  hasImage?: boolean;
};

type Comment = {
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

// Mock data shaped after GET /api/v1/commisions/{id}/comments — swap for the
// real comments API once it exists.
const comments: Comment[] = [
  {
    commentId: 'cmt_b1',
    floor: 'B1',
    nickName: 'Chris',
    timeLabel: '43 分前',
    content: '181cm 身高很有優勢，推薦 NET 寬鬆襯衫搭配直筒褲，簡單又有韓系感。',
    likeCount: 100,
    imageLayout: 'scroll',
    images: [{ label: '上衣：NET' }, { label: '下著：NET' }, {}],
    replies: [
      {
        replyId: 'rpl_b1_1',
        nickName: 'Maple',
        isCommissioner: true,
        content: '謝謝！我最近剛好有看到 NET 的襯衫，之後會去試穿看看。',
      },
      {
        replyId: 'rpl_b1_2',
        nickName: 'GD',
        content: '補充一下，NET 可以先買襯衫，褲子我比較推薦 GU 的版型。',
        hasImage: true,
      },
    ],
    showReplyBox: true,
  },
  {
    commentId: 'cmt_b2',
    floor: 'B2',
    nickName: 'GD',
    timeLabel: '5 分前',
    content: '身形比例不錯，可以試試白 T 加 GU 寬版西裝褲的 Clean 韓系穿搭。',
    likeCount: 20,
    imageLayout: 'single',
    images: [{}],
  },
  {
    commentId: 'cmt_b3',
    floor: 'B3',
    nickName: 'Mao',
    timeLabel: '3 分前',
    content: '建議以黑白灰為主色系，搭配寬褲和薄襯衫，乾淨耐看又好上手。',
    likeCount: 159,
  },
  {
    commentId: 'cmt_b4',
    floor: 'B4',
    nickName: 'Hank',
    timeLabel: '剛剛',
    content:
      '這裡分享一套完整的九宮格穿搭提案，建議可以嘗試大地色系的疊穿，增加層次感而不顯得雜亂。',
    likeCount: 0,
    imageLayout: 'grid',
    images: [
      { label: '外套：ORIVOE' },
      { label: '毛衣：L.L.Bean' },
      { label: '上衣/褲子：MUJI' },
      {},
      { label: '配件：Leather' },
      { label: '鞋款：Clarks' },
      { label: '下著：UNIQLO' },
      { label: '圍巾：Wool' },
      { label: '其他：ORIVOE' },
    ],
  },
];

function ChevronLeftIcon({ className = 'h-5 w-5' }: { className?: string }) {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

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

function ReplyList({ replies, showReplyBox }: { replies: Reply[]; showReplyBox?: boolean }) {
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

      {showReplyBox ? (
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center rounded-full border border-[#E5DDBF] bg-[#FDF7E9] px-3.5">
            <span className="text-[12.5px] text-[#B8AF9E]">加入討論...</span>
          </div>
          <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)]">
            <SendIcon />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
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

      {comment.replies && comment.replies.length > 0 ? (
        <ReplyList replies={comment.replies} showReplyBox={comment.showReplyBox} />
      ) : null}
    </div>
  );
}

export default async function PostCommentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      {/* Header */}
      <header className="relative flex flex-shrink-0 items-center gap-3.5 border-b border-border-default bg-surface-soft px-4.5 pt-5 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <Link href={`/posts/${id}`} aria-label="返回文章" className="text-text-primary">
          <ChevronLeftIcon />
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-text-primary">
          全部留言
        </span>
      </header>

      {/* Scrollable body — extra bottom padding clears the fixed comment bar */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4.5 pt-5 pb-24">
        {comments.map((comment, index) => (
          <Fragment key={comment.commentId}>
            <CommentItem comment={comment} />
            {index < comments.length - 1 ? <div className="h-px bg-[#E0D4AA]" /> : null}
          </Fragment>
        ))}
      </div>

      {/* Bottom comment bar */}
      <CommentComposer postId={id} />
    </div>
  );
}
