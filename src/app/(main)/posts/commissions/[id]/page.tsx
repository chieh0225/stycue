import { ChevronLeft, Image, User } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopBar } from '@/components/ui/top-bar';
import { getCommissionServer } from '@/lib/commission-server';
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

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCommissionServer(id);
  const created = result.success ? result.data : null;

  const postTypeLabel = '委託';
  const title = created?.title || '希望能找到一套適合我的穿搭';
  const bodyText = created?.content || fallbackBodyText;
  const tags =
    created && created.tags.length > 0 ? created.tags.map((tag) => tag.name) : fallbackTags;
  const height = created?.height ?? '175';
  const weight = created?.weight ?? '67';
  const age = created?.age ?? '25';
  const budgetLabel = created?.budget ? `NT$ ${created.budget}` : 'NT$ 3,000 - 5,000';
  const points = created?.points ?? MOCK_PUBLISH_POINTS;
  const createdAt = created?.createdAt ?? fallbackCreatedAt;
  const deadline = created?.expiredAt ?? fallbackDeadline;
  const authorName = created?.author.displayName || 'Maple';
  const photos = created?.images ?? [];
  const likeCount = created?.likeCount ?? 222;
  const isLiked = created?.isLiked ?? false;
  const commentCount = created?.commentCount ?? 50;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      {/* Header — sticky so it stays pinned to the top while the page scrolls */}
      <TopBar
        center={false}
        left={
          <Link href="/" aria-label="返回全部文章" className="text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
        title="全部文章"
        className="py-4"
      />

      {/* Article body — grows with the page (document scroll) between the
          sticky header and the sticky comment bar. */}
      <article className="flex-1 px-4.5 pt-5 pb-5">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="gold" className="shrink-0">
            {postTypeLabel}
          </Badge>
          <h1 className="text-headline-sm font-bold text-text-primary">{title}</h1>
        </div>

        {/* Author row */}
        <div className="mb-4.5 flex items-center gap-2.5">
          <Avatar size="xl">
            <AvatarFallback>
              <User className="h-4.5 w-4.5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-label-md font-bold text-text-primary">{authorName}</span>
            <time dateTime={createdAt} className="text-label-md text-text-tertiary">
              {formatDate(createdAt)}
            </time>
          </div>
          <Button type="button" size="sm">
            追蹤
          </Button>
        </div>

        <Separator className="mb-4.5" />

        {/* Body text */}
        <div className="mb-5.5 text-body-lg leading-[1.8] whitespace-pre-line text-text-primary">
          {bodyText}
        </div>

        {/* Body images: 身形照片 */}
        <div className="mb-5.5 flex gap-2">
          {photos.length > 0
            ? photos.map((photo, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- uploaded photo URL from real backend
                <img
                  key={photo.imageId}
                  src={photo.url}
                  alt={`身形照片 ${i + 1}`}
                  className="flex-1 rounded-xl object-cover"
                  style={{ aspectRatio: '1 / 1.2' }}
                />
              ))
            : [0, 1, 2].map((i) => (
                <div
                  key={i}
                  role="img"
                  aria-label={`身形照片 ${i + 1}`}
                  className="flex flex-1 items-center justify-center rounded-xl bg-[#D9D2C0] text-text-primary"
                  style={{ aspectRatio: '1 / 1.2' }}
                >
                  <Image className="h-9 w-9" />
                </div>
              ))}
        </div>

        {/* 穿搭標籤 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">穿搭標籤</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>

        {/* 委託條件 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">委託條件</h2>
        <Card variant="info" className="mb-5.5 px-1 py-3.5">
          <dl className="mb-3.5 grid grid-cols-3">
            <div className="flex flex-col items-center gap-0.75">
              <dt className="text-label-md text-text-tertiary">身高</dt>
              <dd className="text-body-lg font-bold text-text-primary">
                {height} <span className="text-label-md font-medium text-text-tertiary">cm</span>
              </dd>
            </div>
            <div className="flex flex-col items-center gap-0.75 border-x border-border-default">
              <dt className="text-label-md text-text-tertiary">體重</dt>
              <dd className="text-body-lg font-bold text-text-primary">
                {weight} <span className="text-label-md font-medium text-text-tertiary">kg</span>
              </dd>
            </div>
            <div className="flex flex-col items-center gap-0.75">
              <dt className="text-label-md text-text-tertiary">年齡</dt>
              <dd className="text-body-lg font-bold text-text-primary">
                {age} <span className="text-label-md font-medium text-text-tertiary">歲</span>
              </dd>
            </div>
          </dl>
          <Separator className="mx-3.5 mb-3 w-auto" />
          <dl className="flex items-center justify-between px-3.5">
            <dt className="text-label-md text-text-tertiary">預算範圍</dt>
            <dd className="text-body-md font-bold text-text-primary">{budgetLabel}</dd>
          </dl>
        </Card>

        {/* 截止資訊 */}
        <div className="mb-4.5 text-body-md leading-[1.7] text-text-placeholder">
          直到 <time dateTime={deadline}>{formatDate(deadline)}</time>
          <br />
          委託者可給予青睞留言 {points} 積分
        </div>

        <Separator className="mb-4" />

        {/* 互動列 */}
        <PostInteractions
          postId={id}
          initialLikes={likeCount}
          initialLiked={isLiked}
          comments={commentCount}
        />
      </article>

      {/* Bottom bar — a launcher into the comments list, not an inline composer */}
      <CommentLauncher postId={id} />
    </div>
  );
}
