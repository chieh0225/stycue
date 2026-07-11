'use client';

import { Image, Send, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomBar } from '@/components/ui/bottom-bar';

export default function CommentComposer({
  onSubmit,
  templateHref,
}: {
  // The parent handles the optimistic UI update and persistence; the composer
  // just clears itself after handing off the text.
  onSubmit?: (text: string) => void;
  // When provided, a hint row + button is shown above the input linking to the
  // dedicated commission-comment template (text + tagged outfit images).
  templateHref?: string;
}) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  function submit() {
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setText('');
  }

  return (
    <BottomBar className="items-center gap-2.5 py-3">
      <Avatar size="md">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      {/* Input pill — text field plus, when a template is available, an image
          button that opens the dedicated commission-comment template */}
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full border border-border-default bg-muted pr-2 pl-4">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={templateHref ? '加入討論，或附上圖片' : '加入討論...'}
          aria-label="加入討論"
          className="h-full min-w-0 flex-1 bg-transparent text-body-md text-text-primary placeholder:text-text-placeholder focus:outline-none"
        />
        {templateHref ? (
          <Link
            href={templateHref}
            aria-label="用穿搭推薦模板附上圖片"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-text-muted"
          >
            <Image className="h-4.25 w-4.25" />
          </Link>
        ) : null}
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!trimmed}
        aria-label="送出留言"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-cta disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </button>
    </BottomBar>
  );
}
