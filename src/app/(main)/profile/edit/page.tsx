'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type Gender = 'male' | 'female' | 'unspecified';

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: 'male', label: '男' },
  { key: 'female', label: '女' },
  { key: 'unspecified', label: '不透露' },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(() => {
    try {
      return localStorage.getItem('stycue-profile-nickname') || '';
    } catch {
      return '';
    }
  });
  const [gender, setGender] = useState<Gender>('unspecified');
  const [birthDate, setBirthDate] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const avatarFilled = avatarPreviewUrl !== null;
  const avatarInitial = nickname.trim().charAt(0).toUpperCase() || '?';

  function handleSave() {
    try {
      localStorage.setItem('stycue-profile-nickname', nickname || '');
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }

  function handlePickFromLibrary() {
    fileInputRef.current?.click();
    setAvatarSheetOpen(false);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarPreviewUrl(URL.createObjectURL(file));
    }
    event.target.value = '';
  }

  function handleConfirmDeleteAvatar() {
    setDeleteConfirmOpen(false);
    setAvatarPreviewUrl(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 flex shrink-0 items-center justify-center border-b border-[#f0e4c0] bg-[#fff9e8] px-4.5 pt-4 pb-3.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4.5 flex h-8 w-8 items-center justify-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#403a32"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-[19px] font-bold tracking-[0.5px] text-[#403a32]">編輯個人資料</span>
        <button
          type="button"
          onClick={handleSave}
          className="absolute right-4.5 text-[14.5px] font-bold text-[#835500]"
        >
          儲存
        </button>
      </div>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto bg-[#fdf7e9]">
        {/* Avatar */}
        <div className="flex flex-col items-center px-4.5 pt-7 pb-2">
          <div className="relative h-22 w-22">
            <button
              type="button"
              onClick={() => setAvatarSheetOpen(true)}
              className="relative h-22 w-22 overflow-hidden rounded-full border-[3px] border-[#fffdf7] bg-[#f6d978] shadow-[0_4px_12px_rgba(217,154,61,0.16)]"
            >
              {avatarPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreviewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[32px] font-bold text-[#835500]">
                  {avatarInitial}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setAvatarSheetOpen(true)}
              className="absolute -right-0.5 -bottom-0.5 flex h-7.5 w-7.5 items-center justify-center rounded-full border-[3px] border-[#fdf7e9] bg-[#403a32]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fffdf7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>
          <span className="mt-2.5 text-[13px] text-[#9a9080]">
            {avatarFilled ? '點擊以更換大頭貼' : '點擊以上傳大頭貼'}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Basic info */}
        <div className="px-4.5 pt-5 pb-2">
          <div className="mb-2.5 text-[14px] font-bold text-[#403a32]">基本資料</div>
          <div className="flex flex-col rounded-[14px] bg-[#fffdf7] px-4 py-1">
            <div className="flex items-center justify-between border-b border-[#f0e4c0] py-3.5">
              <span className="w-19 shrink-0 text-[14px] text-[#756c60]">暱稱</span>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="輸入暱稱"
                className="flex-1 border-none bg-transparent text-right text-[14.5px] font-semibold text-[#403a32] outline-none placeholder:font-medium placeholder:text-[#b8af9e]"
              />
            </div>
            <div className="flex items-start justify-between border-b border-[#f0e4c0] py-3.5">
              <span className="w-19 shrink-0 pt-0.5 text-[14px] text-[#756c60]">自我介紹</span>
              <textarea
                rows={2}
                placeholder="介紹一下你的穿搭風格吧"
                className="flex-1 resize-none border-none bg-transparent text-right text-[14.5px] text-[#403a32] outline-none placeholder:font-medium placeholder:text-[#b8af9e]"
              />
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="w-19 shrink-0 text-[14px] text-[#756c60]">性別</span>
              <div className="flex flex-1 justify-end gap-2">
                {GENDER_OPTIONS.map((opt) => {
                  const selected = gender === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setGender(opt.key)}
                      className={`flex items-center justify-center rounded-lg border px-4 py-1.75 ${
                        selected
                          ? 'border-[#403a32] bg-[#403a32] font-semibold text-[#fffdf7]'
                          : 'border-[#e5ddbf] bg-[#fdf7e9] font-medium text-[#756c60]'
                      }`}
                    >
                      <span className="text-[13px]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Body info */}
        <div className="px-4.5 pt-5 pb-2">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[14px] font-bold text-[#403a32]">身材資訊</span>
            <span className="text-[11.5px] text-[#9a9080]">用於他人給你穿搭建議時參考</span>
          </div>
          <div className="flex flex-col rounded-[14px] bg-[#fffdf7] px-4 py-1">
            <div className="flex items-center justify-between border-b border-[#f0e4c0] py-3.5">
              <span className="text-[14px] text-[#756c60]">身高</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value.replace(/^-/, ''))}
                  placeholder="--"
                  className="w-12 border-none bg-transparent text-right text-[14.5px] font-semibold text-[#403a32] outline-none placeholder:text-[#b8af9e]"
                />
                <span className="w-5 text-[13px] text-[#9a9080]">cm</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-[#f0e4c0] py-3.5">
              <span className="text-[14px] text-[#756c60]">體重</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value.replace(/^-/, ''))}
                  placeholder="--"
                  className="w-12 border-none bg-transparent text-right text-[14.5px] font-semibold text-[#403a32] outline-none placeholder:text-[#b8af9e]"
                />
                <span className="w-5 text-[13px] text-[#9a9080]">kg</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[14px] text-[#756c60]">生日</span>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                onClick={(event) => {
                  const target = event.target as HTMLInputElement & { showPicker?: () => void };
                  target.showPicker?.();
                }}
                className="cursor-pointer border-none bg-transparent text-right text-[14.5px] font-semibold text-[#403a32] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="h-3" />
      </div>

      {/* Avatar action sheet */}
      {avatarSheetOpen && (
        <div
          onClick={() => setAvatarSheetOpen(false)}
          className="absolute inset-0 z-30 flex items-end bg-[rgba(64,58,50,0.42)]"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full rounded-t-[20px] bg-[#fffdf7] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+22px)] shadow-[0_-4px_20px_rgba(64,58,50,0.16)]"
          >
            <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-[#e5ddbf]" />

            <button
              type="button"
              onClick={handlePickFromLibrary}
              className="flex w-full items-center gap-3 px-1.5 py-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(217,154,61,0.12)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#835500"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-[#403a32]">從圖庫中選擇</span>
            </button>

            {avatarFilled && (
              <>
                <div className="mx-1.5 my-0.5 h-px bg-[#f0e4c0]" />
                <button
                  type="button"
                  onClick={() => {
                    setAvatarSheetOpen(false);
                    setDeleteConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-3 px-1.5 py-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(186,26,26,0.1)]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ba1a1a"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </div>
                  <span className="text-[15px] font-semibold text-[#ba1a1a]">刪除大頭貼</span>
                </button>
              </>
            )}

            <div className="mx-1.5 my-0.5 h-px bg-[#f0e4c0]" />
            <button
              type="button"
              onClick={() => setAvatarSheetOpen(false)}
              className="flex w-full items-center justify-center px-1.5 py-3.5"
            >
              <span className="text-[15px] font-semibold text-[#756c60]">取消</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(64,58,50,0.42)] px-8">
          <div className="w-full max-w-70 rounded-2xl bg-[#fffdf7] px-5 pt-5.5 pb-4 text-center shadow-[0_8px_28px_rgba(64,58,50,0.22)]">
            <div className="mb-1.5 text-[15.5px] font-bold text-[#403a32]">刪除大頭貼？</div>
            <div className="mb-4.5 text-[13px] leading-[1.5] text-[#756c60]">
              刪除後將無法復原，需要重新上傳照片。
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 rounded-[10px] border-[1.5px] border-[#e5ddbf] py-2.75"
              >
                <span className="text-[14px] font-semibold text-[#403a32]">取消</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAvatar}
                className="flex-1 rounded-[10px] bg-[#ba1a1a] py-2.75"
              >
                <span className="text-[14px] font-semibold text-[#fffdf7]">刪除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
