import { ChevronLeft, Image, User } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TopBar } from '@/components/ui/top-bar';
import CommentLauncher from './comment-launcher';
import HideScrollbar from './hide-scrollbar';
import ImageGallery from './image-gallery';
import PostInteractions from './post-interactions';

// No API exists yet to fetch a single share post's full detail (see plan
// notes) — everything below is mock content taken verbatim from the design
// file. Only the postId-scoped interactions (like/bookmark/comment link) are
// real.
const title = '第一次照著大家的建議搭配，真的比以前有自信了！';
const authorName = 'Chris';
const bodyText = `前幾天在平台發文請大家幫我看看穿搭，也收到不少很實用的建議，真的很謝謝每一位願意留言分享的人。

最後我參考了大家推薦的搭配方式，把原本的穿搭稍微調整了一下。

這次改成米白色牛津襯衫搭配白色素 T，褲子則換成垂墜感比較好的深灰色直筒褲，鞋子還是保留原本的小白鞋，再加上一個黑色帆布托特包，整體看起來比之前更有層次，也更符合我想嘗試的韓系簡約風格。

原本一直擔心自己身高太高不好搭配，後來才發現其實只要版型選對，整體比例就會好很多。

這次最大的收穫不是買了新的衣服，而是開始知道怎麼利用現有單品做搭配，也學到很多挑選衣服的小技巧。

真的很感謝平台上的大家，不管是留言建議還是分享自己的穿搭經驗，都讓我學到很多，希望之後也能分享更多自己的穿搭心得！

如果大家覺得還有可以改善的地方，也歡迎繼續留言交流～`;
const tags = ['韓系', 'OOTD', 'CleanFit', '日常', '新手'];
const outfitInfo = [
  { label: '穿搭風格', value: '韓系簡約' },
  { label: '穿搭場合', value: '朋友聚餐、日常外出' },
  { label: '穿搭日期', value: '2026/06/30' },
  { label: '穿搭地點', value: '台灣・高雄' },
];
const items = ['UNIQLO', 'GU', 'NET'];
const colorRatios = [
  { percent: '45%', name: '米白', hex: '#EDE4C8', bg: '#EDE4C8', dark: false, bordered: false },
  { percent: '35%', name: '深灰', hex: '#6B655A', bg: '#6B655A', dark: true, bordered: false },
  { percent: '20%', name: '黑', hex: '#2B2620', bg: '#FFFFFF', dark: false, bordered: true },
];
const likeCount = 312;
const commentCount = 46;

export default async function SharePostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isLoggedIn = Boolean((await cookies()).get('stycue_access_token')?.value);

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
        className="py-4"
      />

      <article className="flex-1 px-4.5 pt-5 pb-5">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="gold" className="shrink-0">
            分享
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
          <span className="flex-1 text-body-md font-bold text-text-primary">{authorName}</span>
          <Button type="button" size="sm">
            追蹤
          </Button>
        </div>

        {/* Image gallery */}
        <ImageGallery />

        <Separator className="mb-4.5" />

        {/* Body text */}
        <div className="mb-6 text-body-lg leading-[1.8] whitespace-pre-line text-text-primary">
          {bodyText}
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

        {/* 穿搭資訊 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">穿搭資訊</h2>
        <Card variant="info" className="mb-6 p-4">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-4">
            {outfitInfo.map((info) => (
              <div key={info.label} className="flex flex-col gap-1">
                <dt className="text-label-md text-text-tertiary">{info.label}</dt>
                <dd className="text-body-md font-bold text-text-primary">{info.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* 使用單品 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">使用單品</h2>
        <div className="mb-6 grid grid-cols-3 gap-2.5">
          {items.map((item) => (
            <div key={item} className="flex flex-col items-center gap-2">
              <div className="flex aspect-square w-full items-center justify-center rounded-card bg-[#d9d2c0]">
                <Image className="h-6.5 w-6.5 text-text-primary" />
              </div>
              <span className="text-label-md font-semibold text-[#5a5248]">{item}</span>
            </div>
          ))}
        </div>

        {/* 搭配比例 */}
        <h2 className="mb-3 text-body-lg font-bold text-text-primary">搭配比例</h2>
        <div className="mb-6 grid grid-cols-3 gap-2.5">
          {colorRatios.map((color) => (
            <div
              key={color.name}
              className={`flex aspect-square flex-col justify-between rounded-card p-3 ${
                color.bordered ? 'border border-border' : ''
              }`}
              style={{ backgroundColor: color.bg }}
            >
              <span
                className={`text-right text-label-md font-bold ${
                  color.dark ? 'text-background' : 'text-text-primary'
                }`}
              >
                {color.percent}
              </span>
              <div>
                <div
                  className={`text-label-md font-bold ${
                    color.dark ? 'text-background' : 'text-text-primary'
                  }`}
                >
                  {color.name}
                </div>
                <div
                  className={
                    color.dark ? 'text-[10.5px] text-[#d9d2c0]' : 'text-[10.5px] text-text-muted'
                  }
                >
                  {color.hex}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* 互動列 */}
        <PostInteractions
          postId={id}
          initialLikes={likeCount}
          initialLiked={false}
          comments={commentCount}
          isLoggedIn={isLoggedIn}
        />
      </article>

      {/* Bottom bar */}
      <CommentLauncher postId={id} />
    </div>
  );
}
