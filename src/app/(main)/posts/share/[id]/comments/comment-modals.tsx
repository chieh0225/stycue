import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AlertTriangleIcon } from './comment-icons';

// Share posts have no give-points/best-comment concept, so this only carries
// the delete confirmation (unlike the commission comment-modals.tsx).
export function DeleteConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="flex flex-col items-center px-5.5 pt-6.5 pb-5 text-center">
        <div className="mb-4 flex size-13 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="h-6.5 w-6.5" />
        </div>
        <DialogTitle className="mb-2">刪除留言？</DialogTitle>
        <DialogDescription className="mb-5">
          確定要刪除這則留言嗎？此操作無法復原。
        </DialogDescription>

        <Separator className="mb-4" />

        <DialogFooter>
          <Button type="button" variant="secondary" size="md" onClick={onCancel} className="flex-1">
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={onConfirm}
            className="flex-1"
          >
            刪除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
