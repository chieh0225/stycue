import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { AlertTriangleIcon, StarIcon } from './comment-icons';

// The give-points options start at the commission's 本次委託發佈積分 (the amount
// the commissioner chose when publishing) as the minimum, then step up by 25.
const GIVE_POINTS_STEP = 25;
const GIVE_POINTS_OPTION_COUNT = 3;

export function buildGivePointsAmounts(publishPoints: number) {
  return Array.from(
    { length: GIVE_POINTS_OPTION_COUNT },
    (_, index) => publishPoints + index * GIVE_POINTS_STEP,
  );
}

// Mock balance — replace with GET /api/v1/points/balance (availablePoints).
export const MOCK_USER_POINTS = 60;

export function GivePointsModal({
  targetName,
  amounts,
  selectedAmount,
  onSelectAmount,
  onClose,
  onConfirm,
}: {
  targetName: string;
  amounts: number[];
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex flex-col items-center px-5.5 pt-6.5 pb-5 text-center">
        <div className="mb-4 flex size-13 items-center justify-center rounded-full bg-gold-soft text-gold">
          <StarIcon className="h-6 w-6" />
        </div>
        <DialogTitle className="mb-2 text-body-lg leading-[1.5]">
          將 {targetName} 選為最佳留言並給予積分
        </DialogTitle>
        <DialogDescription className="mb-5">
          確定要將積分給予 {targetName} 嗎？
          <br />
          此操作無法復原。
        </DialogDescription>

        <div className="flex w-full justify-center gap-3">
          {amounts.map((amount) => {
            const isSelected = amount === selectedAmount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => onSelectAmount(amount)}
                aria-pressed={isSelected}
                className={`flex h-10 w-18 items-center justify-center rounded-full border text-body-lg text-text-primary ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary font-bold'
                    : 'border-border bg-muted font-medium'
                }`}
              >
                {amount}
              </button>
            );
          })}
        </div>

        <Separator className="mt-5 mb-4" />

        <DialogFooter>
          <Button type="button" variant="secondary" size="md" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button type="button" variant="primary" size="md" onClick={onConfirm} className="flex-1">
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InsufficientPointsModal({
  targetName,
  amount,
  onClose,
}: {
  targetName: string;
  amount: number;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex flex-col items-center px-5.5 pt-6.5 pb-5 text-center">
        <div className="mb-4 flex size-13 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="h-6.5 w-6.5" />
        </div>
        <DialogTitle className="mb-2 whitespace-nowrap">積分不足</DialogTitle>
        <DialogDescription className="mb-5">
          您目前的積分不足以給予 {targetName} {amount} 積分，請前往儲值積分！
        </DialogDescription>

        <Separator className="mb-4" />

        <DialogFooter>
          <Button type="button" variant="secondary" size="md" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Link
            href="/profile/points/buy"
            className={cn(buttonVariants({ variant: 'goldDark', size: 'md' }), 'flex-1')}
          >
            前往儲值
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Deletion has no button wired to it yet — this modal is ready for a teammate
// to trigger via setDeleteTarget once a delete entry point is added.
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
