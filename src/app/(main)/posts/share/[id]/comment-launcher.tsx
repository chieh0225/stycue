import { ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomBar } from '@/components/ui/bottom-bar';

// Same structure as posts/commissions/[id]/comment-launcher.tsx, kept as its
// own copy because the target route is share-specific — see plan notes.
export default function CommentLauncher({ postId }: { postId: string }) {
  return (
    <BottomBar className="p-0">
      <Link
        href={`/posts/share/${postId}/comments`}
        aria-label="查看並加入留言討論"
        className="flex flex-1 items-center gap-2.5 px-4.5 py-3.5"
      >
        <Avatar size="md">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-body-md text-text-muted">
          查看並加入留言討論…
        </span>
        <ChevronRight className="h-5 w-5 flex-shrink-0 text-text-primary" />
      </Link>
    </BottomBar>
  );
}
