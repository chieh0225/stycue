import Link from 'next/link';

const bodyText = `最近開始想認真學穿搭，但自己研究了一段時間後，還是不太確定什麼樣的版型和配色比較適合自己，所以想請大家根據我的身形給一些建議。

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

const styleTags = ['韓系', '修身', '簡約', '約會'];

function ChevronLeftIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function HeartIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function CommentIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3 20l1.1-4a8.4 8.4 0 0 1-1-4A8.38 8.38 0 0 1 11.5 3a8.4 8.4 0 0 1 9.5 8.5Z" />
    </svg>
  );
}

function BookmarkIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </svg>
  );
}

function SendIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

export default function PostDetailPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-surface-base">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center gap-3.5 border-b border-border-default bg-surface-soft px-4.5 pt-5 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <Link href="/posts" aria-label="返回全部文章" className="text-text-primary">
          <ChevronLeftIcon />
        </Link>
        <span className="text-lg font-bold text-text-primary">全部文章</span>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4.5 pt-5 pb-6">
        {/* Title */}
        <div className="mb-4 flex items-center gap-2">
          <span className="flex-shrink-0 rounded-md bg-[#FCEFDA] px-[9px] py-[3px] text-[13px] font-bold text-accent-amber">
            委託
          </span>
          <span className="text-[19px] leading-[1.4] font-bold text-text-primary">
            希望能找到一套適合我的穿搭
          </span>
        </div>

        {/* Author row */}
        <div className="mb-[18px] flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
            <UserIcon />
          </div>
          <span className="flex-1 text-base font-bold text-text-primary">Maple</span>
          <button
            type="button"
            className="rounded-lg bg-brand-primary px-4.5 py-2 text-[13px] font-bold text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.18)]"
          >
            追蹤
          </button>
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
              className="flex flex-1 items-center justify-center rounded-xl bg-[#D9D2C0] text-text-primary"
              style={{ aspectRatio: '1 / 1.2' }}
            >
              <ImagePlaceholderIcon />
            </div>
          ))}
        </div>

        {/* 穿搭標籤 */}
        <div className="mb-3 text-base font-bold text-text-primary">穿搭標籤</div>
        <div className="mb-6 flex flex-wrap gap-2">
          {styleTags.map((tag) => (
            <div
              key={tag}
              className="rounded-full border border-border-default bg-[#FDF7E9] px-3.5 py-1.75 text-[13px] text-text-primary"
            >
              {tag}
            </div>
          ))}
        </div>

        {/* 委託條件 */}
        <div className="mb-3 text-base font-bold text-text-primary">委託條件</div>
        <div className="mb-[22px] rounded-[14px] border border-border-default bg-[#FDF7E9] px-1 py-3.5">
          <div className="mb-3.5 grid grid-cols-3">
            <div className="flex flex-col items-center gap-[3px]">
              <span className="text-[11px] text-[#9A9080]">身高</span>
              <span className="text-[15px] font-bold text-text-primary">
                175 <span className="text-[11px] font-medium text-[#9A9080]">cm</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-[3px] border-x border-border-default">
              <span className="text-[11px] text-[#9A9080]">體重</span>
              <span className="text-[15px] font-bold text-text-primary">
                67 <span className="text-[11px] font-medium text-[#9A9080]">kg</span>
              </span>
            </div>
            <div className="flex flex-col items-center gap-[3px]">
              <span className="text-[11px] text-[#9A9080]">年齡</span>
              <span className="text-[15px] font-bold text-text-primary">
                25 <span className="text-[11px] font-medium text-[#9A9080]">歲</span>
              </span>
            </div>
          </div>
          <div className="mx-3.5 mb-3 h-px bg-border-default" />
          <div className="flex items-center justify-between px-3.5">
            <span className="text-[12.5px] text-[#9A9080]">預算範圍</span>
            <span className="text-sm font-bold text-text-primary">NT$ 3,000 - 5,000</span>
          </div>
        </div>

        {/* 截止資訊 */}
        <div className="mb-[18px] text-[13px] leading-[1.7] text-[#B8AF9E]">
          直到 2026 年 6 月 24 日
          <br />
          委託者可給予青睞留言 50 積分
        </div>

        <div className="mb-4 h-px bg-border-default" />

        {/* 互動列 */}
        <div className="flex items-center gap-[22px] text-text-primary">
          <div className="flex items-center gap-1.5">
            <HeartIcon />
            <span className="text-[15px]">222</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CommentIcon />
            <span className="text-[15px]">50</span>
          </div>
          <BookmarkIcon className="ml-auto h-5 w-5" />
        </div>
      </div>

      {/* Bottom comment bar */}
      <div className="flex flex-shrink-0 items-center gap-2.5 border-t border-border-default bg-surface-base px-4.5 py-3">
        <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-surface-base">
          <UserIcon className="h-4 w-4" />
        </div>
        <div className="flex h-10 flex-1 items-center rounded-full border border-border-default bg-[#FDF7E9] px-4">
          <span className="text-[13.5px] text-[#B8AF9E]">加入討論...</span>
        </div>
        <button
          type="button"
          aria-label="送出留言"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)]"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
