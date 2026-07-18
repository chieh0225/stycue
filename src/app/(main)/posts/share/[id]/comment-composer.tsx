'use client';

import { Send, User } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomBar } from '@/components/ui/bottom-bar';

// Same structure as posts/commissions/[id]/comment-composer.tsx, kept as its
// own copy per the share-post convention (see plan notes) — minus the
// template-href image button, since there's no image-attached comment
// template built for share posts yet (text-only comments for now).
export default function CommentComposer({ onSubmit }: { onSubmit?: (text: string) => void }) {
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
          placeholder="加入討論..."
          aria-label="加入討論"
          className="h-full min-w-0 flex-1 bg-transparent text-body-md text-text-primary placeholder:text-text-placeholder focus:outline-none"
        />
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
