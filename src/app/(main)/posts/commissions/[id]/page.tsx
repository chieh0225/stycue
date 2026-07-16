import { ChevronLeft, User } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopBar } from '@/components/ui/top-bar';
import { getCommissionServer } from '@/lib/commission-server';
import CommentLauncher from './comment-launcher';
import HideScrollbar from './hide-scrollbar';
import PhotoGallery from './photo-gallery';
import PostInteractions from './post-interactions';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCommissionServer(id);
  const created = result.success ? result.data : null;
  const isLoggedIn = Boolean((await cookies()).get('stycue_access_token')?.value);

  if (!created) notFound();

  const postTypeLabel = '委託';
  const {
    title,
    content: bodyText,
    height,
    weight,
    age,
    budget,
    points,
    createdAt,
    expiredAt: deadline,
    author: { displayName: authorName },
    images: photos,
    likeCount,
    isLiked,
    commentCount,
  } = created;
  const tags = created.tags.map((tag) => tag.name);
  const budgetLabel = budget ? `NT$ ${budget}` : null;

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
        <PhotoGallery photos={photos} />

        {/* 穿搭標籤 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">穿搭標籤</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Badge key={tag} variant="neutral">
                {tag}
              </Badge>
            ))
          ) : (
            <p className="text-label-md text-text-tertiary">尚未選擇標籤</p>
          )}
        </div>

        {/* 委託條件 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">委託條件</h2>
        <Card variant="info" className="mb-5.5 px-1 py-3.5">
          <dl className="mb-3.5 grid grid-cols-3">
            <div className="flex flex-col items-center gap-0.75">
              <dt className="text-label-md text-text-tertiary">身高</dt>
              <dd className="text-body-lg font-bold text-text-primary">
                {height !== null ? (
                  <>
                    {height}{' '}
                    <span className="text-label-md font-medium text-text-tertiary">cm</span>
                  </>
                ) : (
                  <span className="text-label-md font-medium text-text-tertiary">未提供</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col items-center gap-0.75 border-x border-border-default">
              <dt className="text-label-md text-text-tertiary">體重</dt>
              <dd className="text-body-lg font-bold text-text-primary">
                {weight !== null ? (
                  <>
                    {weight}{' '}
                    <span className="text-label-md font-medium text-text-tertiary">kg</span>
                  </>
                ) : (
                  <span className="text-label-md font-medium text-text-tertiary">未提供</span>
                )}
              </dd>
            </div>
            <div className="flex flex-col items-center gap-0.75">
              <dt className="text-label-md text-text-tertiary">年齡</dt>
              <dd className="text-body-lg font-bold text-text-primary">
                {age !== null ? (
                  <>
                    {age} <span className="text-label-md font-medium text-text-tertiary">歲</span>
                  </>
                ) : (
                  <span className="text-label-md font-medium text-text-tertiary">未提供</span>
                )}
              </dd>
            </div>
          </dl>
          <Separator className="mx-3.5 mb-3 w-auto" />
          <dl className="flex items-center justify-between px-3.5">
            <dt className="text-label-md text-text-tertiary">預算範圍</dt>
            <dd className="text-body-md font-bold text-text-primary">{budgetLabel ?? '未提供'}</dd>
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
          isLoggedIn={isLoggedIn}
        />
      </article>

      {/* Bottom bar — a launcher into the comments list, not an inline composer */}
      <CommentLauncher postId={id} />
    </div>
  );
}
