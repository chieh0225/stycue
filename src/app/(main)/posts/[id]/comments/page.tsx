import Link from 'next/link';
import CommentBoard, { type Comment } from './comment-board';
import { MOCK_PUBLISH_POINTS } from '../mock-commission';

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

export default async function PostCommentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      {/* Header */}
      <header className="relative flex flex-shrink-0 items-center gap-3.5 border-b border-border-default bg-surface-soft px-4.5 pt-5 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <Link href={`/posts/${id}`} aria-label="返回文章" className="text-text-primary">
          <ChevronLeftIcon />
        </Link>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-text-primary">
          全部留言
        </h1>
      </header>

      <CommentBoard postId={id} initialComments={comments} publishPoints={MOCK_PUBLISH_POINTS} />
    </div>
  );
}
