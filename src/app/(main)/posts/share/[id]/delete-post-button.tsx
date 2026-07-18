'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { deletePost } from '@/lib/post-api';

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setDeleting(true);
    setError(null);
    const result = await deletePost(postId);
    if (!result.success) {
      setError(result.message || '刪除失敗，請稍後再試');
      setDeleting(false);
      return;
    }
    router.push('/');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-label-md font-semibold text-text-muted"
      >
        刪除
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!deleting) setOpen(next);
        }}
      >
        <DialogContent className="flex flex-col items-center px-5.5 pt-6.5 pb-5 text-center">
          <DialogTitle className="mb-2">刪除貼文？</DialogTitle>
          <DialogDescription className="mb-5">
            確定要刪除這篇貼文嗎？此操作無法復原。
          </DialogDescription>

          {error ? <p className="mb-4 text-body-md text-destructive">{error}</p> : null}

          <Separator className="mb-4" />

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setOpen(false)}
              disabled={deleting}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? '刪除中...' : '刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
