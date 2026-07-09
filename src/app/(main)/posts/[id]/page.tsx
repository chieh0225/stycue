import Link from 'next/link';
import { getCreatedPost } from '@/app/api/posts/store';
import { Button } from '@/components/ui/button';
import CommentLauncher from './comment-launcher';
import HideScrollbar from './hide-scrollbar';
import { MOCK_PUBLISH_POINTS } from './mock-commission';
import PostInteractions from './post-interactions';

const fallbackBodyText = `最近開始想認真學穿搭，但自己研究了一段時間後，還是不太確定什麼樣的版型和配色比較適合自己，所以想請大家根據我的身形給一些建議。

我有附上幾張不同角度的身形照片，希望大家可以依照我的比例推薦一套適合我的韓系簡約穿搭。

我平常主要會穿去上課、朋友聚餐或日常外出，希望整體看起來乾淨、舒服，不需要太浮誇，也不要太正式。

目前衣櫃裡比較常穿的衣服有：
・白色素 T
・黑色直筒褲
・深藍牛仔褲
・小白鞋

如果可以，希望能以現有單品搭配，再推薦一兩件需要添購的衣服即可。

預算希望控制在 3000～5000 元左右，如果有平價品牌或台灣容易購買的店家也歡迎一起推薦。

另外，如果你認為我其實不適合韓系，而是有其他更適合的風格，也歡迎直接提出建議，我都很願意參考。

謝謝願意花時間幫忙回覆的人！`;

const fallbackTags = ['韓系', '修身', '簡約', '約會'];

const fallbackCreatedAt = '2026-07-02T14:30:00Z';
const fallbackDeadline = '2026-07-08';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
}

function ChevronLeftIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function UserIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function ImagePlaceholderIcon({ className = 'h-9 w-9' }: { className?: string }) {
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

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const created = getCreatedPost(id);

  const postTypeLabel = created?.postType || '委託';
  const title = created?.title || '希望能找到一套適合我的穿搭';
  const bodyText = created?.description || fallbackBodyText;
  const tags = created && created.tags.length > 0 ? created.tags : fallbackTags;
  const height = created?.height || '175';
  const weight = created?.weight || '67';
  const age = created?.age || '25';
  const budgetLabel = created ? `NT$ ${created.budget}` : 'NT$ 3,000 - 5,000';
  const points = created?.points || String(MOCK_PUBLISH_POINTS);
  const createdAt = created?.createdAt ?? fallbackCreatedAt;
  const deadline = created
    ? new Date(new Date(created.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : fallbackDeadline;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      {/* Header — sticky so it stays pinned to the top while the page scrolls */}
      <header className="sticky top-0 z-10 flex flex-shrink-0 items-center gap-3.5 border-b border-border-default bg-surface-soft px-4.5 pt-5 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <Link href="/" aria-label="返回全部文章" className="text-text-primary">
          <ChevronLeftIcon />
        </Link>
        <span className="text-lg font-bold text-text-primary">全部文章</span>
      </header>

      {/* Article body — grows with the page (document scroll) between the
          sticky header and the sticky comment bar. */}
      <article className="flex-1 px-4.5 pt-5 pb-5">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <span className="flex-shrink-0 rounded-md bg-[#FCEFDA] px-[9px] py-[3px] text-[13px] font-bold text-accent-amber">
            {postTypeLabel}
          </span>
          <h1 className="text-[19px] leading-[1.4] font-bold text-text-primary">{title}</h1>
        </div>

        {/* Author row */}
        <div className="mb-[18px] flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
            <UserIcon />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-base font-bold text-text-primary">Maple</span>
            <time dateTime={createdAt} className="text-[12px] text-[#9A9080]">
              {formatDate(createdAt)}
            </time>
          </div>
          <Button type="button" size="sm">
            追蹤
          </Button>
        </div>

        <div className="mb-[18px] h-px bg-border-default" />

        {/* Body text */}
        <div className="mb-[22px] text-[15.5px] leading-[1.8] whitespace-pre-line text-text-primary">
          {bodyText}
        </div>

        {/* Body images: 身形照片 */}
        <div className="mb-[22px] flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              role="img"
              aria-label={`身形照片 ${i + 1}`}
              className="flex flex-1 items-center justify-center rounded-xl bg-[#D9D2C0] text-text-primary"
              style={{ aspectRatio: '1 / 1.2' }}
            >
              <ImagePlaceholderIcon />
            </div>
          ))}
        </div>

        {/* 穿搭標籤 */}
        <h2 className="mb-3 text-base font-bold text-text-primary">穿搭標籤</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="rounded-full border border-border-default bg-[#FDF7E9] px-3.5 py-1.75 text-[13px] text-text-primary"
            >
              {tag}
            </div>
          ))}
        </div>

        {/* 委託條件 */}
        <h2 className="mb-3 text-base font-bold text-text-primary">委託條件</h2>
        <div className="mb-[22px] rounded-[14px] border border-border-default bg-[#FDF7E9] px-1 py-3.5">
          <dl className="mb-3.5 grid grid-cols-3">
            <div className="flex flex-col items-center gap-[3px]">
              <dt className="text-[11px] text-[#9A9080]">身高</dt>
              <dd className="text-[15px] font-bold text-text-primary">
                {height} <span className="text-[11px] font-medium text-[#9A9080]">cm</span>
              </dd>
            </div>
            <div className="flex flex-col items-center gap-[3px] border-x border-border-default">
              <dt className="text-[11px] text-[#9A9080]">體重</dt>
              <dd className="text-[15px] font-bold text-text-primary">
                {weight} <span className="text-[11px] font-medium text-[#9A9080]">kg</span>
              </dd>
            </div>
            <div className="flex flex-col items-center gap-[3px]">
              <dt className="text-[11px] text-[#9A9080]">年齡</dt>
              <dd className="text-[15px] font-bold text-text-primary">
                {age} <span className="text-[11px] font-medium text-[#9A9080]">歲</span>
              </dd>
            </div>
          </dl>
          <div className="mx-3.5 mb-3 h-px bg-border-default" />
          <dl className="flex items-center justify-between px-3.5">
            <dt className="text-[12.5px] text-[#9A9080]">預算範圍</dt>
            <dd className="text-sm font-bold text-text-primary">{budgetLabel}</dd>
          </dl>
        </div>

        {/* 截止資訊 */}
        <div className="mb-[18px] text-[13px] leading-[1.7] text-[#B8AF9E]">
          直到 <time dateTime={deadline}>{formatDate(deadline)}</time>
          <br />
          委託者可給予青睞留言 {points} 積分
        </div>

        <div className="mb-4 h-px bg-border-default" />

        {/* 互動列 */}
        <PostInteractions postId={id} initialLikes={222} comments={50} />
      </article>

      {/* Bottom bar — a launcher into the comments list, not an inline composer */}
      <CommentLauncher postId={id} />
    </div>
  );
}
