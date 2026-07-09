import Link from 'next/link';
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
    <div
      onClick={onClose}
      className="fixed inset-y-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-[rgba(64,58,50,0.42)] px-7"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="give-points-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-surface-base px-[22px] pt-[26px] pb-5 text-center shadow-[0_12px_32px_rgba(64,58,50,0.28)]"
      >
        <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#FCEFDA] text-accent-amber">
          <StarIcon className="h-6 w-6" />
        </div>
        <span
          id="give-points-title"
          className="mb-2 text-base leading-[1.5] font-bold text-text-primary"
        >
          將 {targetName} 選為最佳留言並給予積分
        </span>
        <span className="mb-5 text-[13px] leading-[1.6] text-text-muted">
          確定要將積分給予 {targetName} 嗎？此操作無法復原。
        </span>

        <div className="flex w-full justify-center gap-3">
          {amounts.map((amount) => {
            const isSelected = amount === selectedAmount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => onSelectAmount(amount)}
                aria-pressed={isSelected}
                className={`flex h-10 w-[72px] items-center justify-center rounded-full border-[1.5px] text-[15px] text-text-primary ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary font-bold'
                    : 'border-[#E5DDBF] bg-[#FDF7E9] font-medium'
                }`}
              >
                {amount}
              </button>
            );
          })}
        </div>

        <div className="mt-5 mb-4 h-px w-full bg-[#EFE7CE]" />

        <div className="flex w-full items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg border-[1.5px] border-[#E5DDBF] text-sm font-bold text-text-primary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-brand-primary text-sm font-bold text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)]"
          >
            確認
          </button>
        </div>
      </div>
    </div>
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
    <div
      onClick={onClose}
      className="fixed inset-y-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-[rgba(64,58,50,0.42)] px-7"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="insufficient-points-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-surface-base px-[22px] pt-[26px] pb-5 text-center shadow-[0_12px_32px_rgba(64,58,50,0.28)]"
      >
        <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[rgba(196,62,50,0.1)] text-[#C43E32]">
          <AlertTriangleIcon className="h-[26px] w-[26px]" />
        </div>
        <span
          id="insufficient-points-title"
          className="mb-2 text-[14.5px] font-bold whitespace-nowrap text-text-primary"
        >
          積分不足
        </span>
        <span className="mb-5 text-[13px] leading-[1.6] text-text-muted">
          您目前的積分不足以給予 {targetName} {amount} 積分，請前往儲值積分！
        </span>

        <div className="mb-4 h-px w-full bg-[#EFE7CE]" />

        <div className="flex w-full items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg border-[1.5px] border-[#E5DDBF] text-sm font-bold text-text-primary"
          >
            取消
          </button>
          <Link
            href="/profile/points/buy"
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-[#835500] text-sm font-bold text-white shadow-[0_4px_12px_rgba(131,85,0,0.24)]"
          >
            前往儲值
          </Link>
        </div>
      </div>
    </div>
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
    <div
      onClick={onCancel}
      className="fixed inset-y-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 items-center justify-center bg-[rgba(64,58,50,0.42)] px-7"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-comment-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-surface-base px-[22px] pt-[26px] pb-5 text-center shadow-[0_12px_32px_rgba(64,58,50,0.28)]"
      >
        <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[rgba(196,62,50,0.1)] text-[#C43E32]">
          <AlertTriangleIcon className="h-[26px] w-[26px]" />
        </div>
        <span id="delete-comment-title" className="mb-2 text-[14.5px] font-bold text-text-primary">
          刪除留言？
        </span>
        <span className="mb-5 text-[13px] leading-[1.6] text-text-muted">
          確定要刪除這則留言嗎？此操作無法復原。
        </span>

        <div className="mb-4 h-px w-full bg-[#EFE7CE]" />

        <div className="flex w-full items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg border-[1.5px] border-[#E5DDBF] text-sm font-bold text-text-primary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[46px] flex-1 items-center justify-center rounded-lg bg-[#C43E32] text-sm font-bold text-white"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  );
}
