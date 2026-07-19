'use client';

import { useRouter } from 'next/navigation';
import type { TagPickerInitialData } from '@/lib/tag-server';
import TagPickerContent from '../../tag-picker-content';

export default function TagPickerModalClient({
  initialData,
}: {
  initialData: TagPickerInitialData;
}) {
  const router = useRouter();
  const close = () => router.back();

  return (
    <div className="fixed inset-0 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-end justify-center">
      <button
        type="button"
        aria-label="關閉"
        onClick={close}
        className="absolute inset-0 cursor-pointer bg-black/25"
      />
      <div className="relative z-10 h-[88%] w-full max-w-md overflow-hidden rounded-t-2xl shadow-2xl">
        <TagPickerContent onClose={close} initialData={initialData} />
      </div>
    </div>
  );
}
