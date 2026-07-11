import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { TopBar } from '@/components/ui/top-bar';
import CommentBoard, { type Comment } from './comment-board';
import HideScrollbar from '../hide-scrollbar';
import { MOCK_PUBLISH_POINTS } from '../mock-commission';

// Mock data shaped after GET /api/v1/commissions/{id}/comments — swap for the
// real comments API once it exists.
const comments: Comment[] = [
  {
    commentId: 'cmt_b1',
    floor: 'B1',
    nickName: 'Chris',
    timeLabel: '43 分前',
    content: '181cm 身高很有優勢，推薦 NET 寬鬆襯衫搭配直筒褲，簡單又有韓系感。',
    likeCount: 100,
    images: [
      { imageId: 1, imageUrl: '', category: 1, brand: 'NET' },
      { imageId: 2, imageUrl: '', category: 2, brand: 'NET' },
      { imageId: 3, imageUrl: '', category: 1, brand: '' },
    ],
    replies: [
      {
        replyId: 'rpl_b1_1',
        nickName: 'Maple',
        timeLabel: '40 分前',
        isCommissioner: true,
        content: '謝謝！我最近剛好有看到 NET 的襯衫，之後會去試穿看看。',
      },
      {
        replyId: 'rpl_b1_2',
        nickName: 'GD',
        timeLabel: '38 分前',
        content: '補充一下，NET 可以先買襯衫，褲子我比較推薦 GU 的版型。',
        images: [{ imageId: 4, imageUrl: '', category: 2, brand: 'GU' }],
      },
    ],
  },
  {
    commentId: 'cmt_b2',
    floor: 'B2',
    nickName: 'GD',
    timeLabel: '5 分前',
    content: '身形比例不錯，可以試試白 T 加 GU 寬版西裝褲的 Clean 韓系穿搭。',
    likeCount: 20,
    images: [{ imageId: 5, imageUrl: '', category: 1, brand: '' }],
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
    images: [
      { imageId: 6, imageUrl: '', category: 6, brand: 'ORIVOE' },
      { imageId: 7, imageUrl: '', category: 1, brand: 'L.L.Bean' },
      { imageId: 8, imageUrl: '', category: 1, brand: 'MUJI' },
      { imageId: 9, imageUrl: '', category: 1, brand: '' },
      { imageId: 10, imageUrl: '', category: 4, brand: 'Leather' },
      { imageId: 11, imageUrl: '', category: 3, brand: 'Clarks' },
      { imageId: 12, imageUrl: '', category: 2, brand: 'UNIQLO' },
      { imageId: 13, imageUrl: '', category: 4, brand: 'Wool' },
      { imageId: 14, imageUrl: '', category: 99, brand: 'ORIVOE' },
    ],
  },
];

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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      {/* Header — sticky so it stays pinned to the top while the page scrolls */}
      <TopBar
        left={
          <Link href={`/posts/${id}`} aria-label="返回文章" className="text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
        title="全部留言"
        className="py-4"
      />

      <CommentBoard
        postId={id}
        initialComments={comments}
        publishPoints={MOCK_PUBLISH_POINTS}
        focusId={focusId}
        expandReplyId={expandReplyId}
      />
    </div>
  );
}
