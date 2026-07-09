'use client';

import { useRouter } from 'next/navigation';
import { clearAuthed } from '../../auth';

export default function ProfilePage() {
  const router = useRouter();

  function handleLogout() {
    clearAuthed();
    router.push('/login');
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">/profile</h1>
      <button
        type="button"
        onClick={handleLogout}
        className="w-fit rounded-lg border border-border-default px-4 py-2 text-sm font-semibold text-text-primary"
      >
        登出
      </button>
    </div>
  );
}
