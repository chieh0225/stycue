import { ChevronLeft, User } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopBar } from '@/components/ui/top-bar';
import { getPostServer } from '@/lib/post-server';
import CommentLauncher from './comment-launcher';
import DeletePostButton from './delete-post-button';
import FollowButton from './follow-button';
import HideScrollbar from './hide-scrollbar';
import ImageGallery from './image-gallery';
import PostInteractions from './post-interactions';

const POST_TYPE_LABEL = { share: '分享', question: '提問' } as const;

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCFullYear()} 年 ${date.getUTCMonth() + 1} 月 ${date.getUTCDate()} 日`;
}

export default async function SharePostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isLoggedIn = Boolean((await cookies()).get('stycue_access_token')?.value);
  const result = await getPostServer(id);
  if (!result.success || !result.data) notFound();
  const post = result.data;
  // De-duplicated, in case the same brand was tagged on multiple photos.
  const itemBrands = [
    ...new Set(post.images.map((image) => image.brand).filter(Boolean)),
  ] as string[];
  const outfitInfo = [
    { label: '穿搭風格', value: post.outfitStyle },
    { label: '穿搭場合', value: post.outfitOccasion },
    { label: '穿搭日期', value: post.outfitDate ? formatDate(post.outfitDate) : null },
    { label: '穿搭地點', value: post.outfitLocation },
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      <HideScrollbar />
      {/* Header */}
      <TopBar
        center={false}
        left={
          <Link href="/" aria-label="返回全部文章" className="text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
        title="全部文章"
        right={
          post.canEdit || post.canDelete ? (
            <div className="flex items-center gap-3.5">
              {post.canEdit ? (
                <Link
                  href={`/posts/share/${id}/edit`}
                  className="text-label-md font-semibold text-text-muted"
                >
                  編輯
                </Link>
              ) : null}
              {post.canDelete ? <DeletePostButton postId={id} /> : null}
            </div>
          ) : undefined
        }
        className="py-4"
      />

      <article className="flex-1 px-4.5 pt-5 pb-5">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="gold" className="shrink-0">
            {POST_TYPE_LABEL[post.postType]}
          </Badge>
          <h1 className="text-headline-sm font-bold text-text-primary">{post.title}</h1>
        </div>

        {/* Author row */}
        <div className="mb-4.5 flex items-center gap-2.5">
          <Avatar size="xl">
            <AvatarFallback>
              <User className="h-4.5 w-4.5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-body-md font-bold text-text-primary">
              {post.author.displayName}
            </span>
            <time dateTime={post.createdAt} className="text-label-md text-text-tertiary">
              {formatDate(post.createdAt)}
            </time>
          </div>
          {!post.isOwner ? (
            <FollowButton
              targetUserId={String(post.author.userId)}
              initialFollowing={post.author.isFollowing ?? false}
              isLoggedIn={isLoggedIn}
            />
          ) : null}
        </div>

        {/* Image gallery */}
        <ImageGallery photos={post.images} />

        <Separator className="mb-4.5" />

        {/* Body text */}
        <div className="mb-6 text-body-lg leading-[1.8] whitespace-pre-line text-text-primary">
          {post.content}
        </div>

        {/* 標籤 */}
        {post.tags.length > 0 ? (
          <>
            <h2 className="mb-3 text-body-lg font-bold text-text-primary">標籤</h2>
            <div className="mb-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag.tagId} variant="neutral">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </>
        ) : null}

        {/* 穿搭資訊 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">穿搭資訊</h2>
        <Card variant="info" className="mb-6 p-4">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
            {outfitInfo.map((info) => (
              <div key={info.label} className="flex flex-col gap-1">
                <dt className="text-label-md text-text-tertiary">{info.label}</dt>
                <dd className="text-body-md font-bold text-text-primary">{info.value ?? '-'}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* 使用單品 — brand tagged on each uploaded image */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">使用單品</h2>
        {itemBrands.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {itemBrands.map((brand) => (
              <Badge key={brand} variant="neutral">
                {brand}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mb-6 text-body-md text-text-tertiary">-</p>
        )}

        {/* 搭配比例 — no data model or input UI yet, see color-ratio-section.tsx */}

        <Separator className="mb-4" />

        {/* 互動列 */}
        <PostInteractions
          postId={id}
          initialLikes={post.likeCount}
          initialLiked={post.isLiked ?? false}
          initialFavorites={post.favoriteCount}
          initialFavorited={post.isFavorited ?? false}
          comments={post.commentCount}
          isLoggedIn={isLoggedIn}
        />
      </article>

      {/* Bottom bar */}
      <CommentLauncher postId={id} />
    </div>
  );
}
