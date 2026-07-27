'use client';

import { Calendar, Camera, ChevronLeft, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { TopBar } from '@/components/ui/top-bar';
import { deleteImage, uploadAvatar } from '@/lib/image-api';
import { getMyProfile, updateMyProfile } from '@/lib/user-api';
import { getAuthedUser, setAuthed } from '../../../auth';

// Wire format not yet confirmed against a live response (see MyUserProfileResponse's
// gender caveat) — validated against this key list before being trusted.
type Gender = 'woman' | 'man' | 'nonBinary' | 'preferNotToSay';

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: 'woman', label: '女' },
  { key: 'man', label: '男' },
  { key: 'nonBinary', label: '非二元' },
  { key: 'preferNotToSay', label: '不透露' },
];

const GENDER_KEYS: readonly string[] = GENDER_OPTIONS.map((option) => option.key);

function isGender(value: string | null): value is Gender {
  return value !== null && GENDER_KEYS.includes(value);
}

function formatBirthDate(value: string): string {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${year}/${month}/${day}` : '年/月/日';
}

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarImageId, setAvatarImageId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getMyProfile();
      if (cancelled) return;
      if (result.success && result.data) {
        const {
          user,
          avatarImageId: loadedAvatarImageId,
          bio: loadedBio,
          gender: loadedGender,
          height,
          weight,
          birthDate: loadedBirthDate,
        } = result.data;
        setNickname(user.displayName ?? '');
        setBio(loadedBio ?? '');
        setGender(isGender(loadedGender) ? loadedGender : null);
        setHeightCm(height !== null ? String(height) : '');
        setWeightKg(weight !== null ? String(weight) : '');
        setBirthDate(loadedBirthDate ? loadedBirthDate.slice(0, 10) : '');
        setAvatarPreviewUrl(user.avatarUrl);
        setAvatarImageId(loadedAvatarImageId);
      } else {
        toast.error(result.message || '無法載入個人資料');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const avatarFilled = avatarPreviewUrl !== null;
  const avatarInitial = nickname.trim().charAt(0).toUpperCase() || '?';

  async function handleSave() {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      toast.error('請輸入暱稱');
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateMyProfile({
        nickName: trimmedNickname,
        bio,
        gender,
        height: heightCm.trim(),
        weight: weightKg.trim(),
        birthDate,
      });

      if (!result.success || !result.data) {
        toast.error(result.message || '儲存失敗，請稍後再試');
        return;
      }

      const currentUser = getAuthedUser();
      if (currentUser && currentUser.nickName !== trimmedNickname) {
        setAuthed({ ...currentUser, nickName: trimmedNickname });
      }

      toast.success('個人資料已更新');
    } catch {
      toast.error('無法連線到伺服器，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  }

  function handlePickFromLibrary() {
    fileInputRef.current?.click();
    setAvatarSheetOpen(false);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setAvatarUploading(true);
    try {
      const result = await uploadAvatar(file);
      if (!result.success || !result.data) {
        toast.error(result.message || '大頭貼上傳失敗，請稍後再試');
        return;
      }
      setAvatarPreviewUrl(result.data.url);
      setAvatarImageId(result.data.imageId);
    } catch {
      toast.error('無法連線到伺服器，請稍後再試');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleConfirmDeleteAvatar() {
    setDeleteConfirmOpen(false);
    if (avatarImageId === null) return;

    const result = await deleteImage(avatarImageId);
    if (!result.success) {
      toast.error(result.message || '刪除大頭貼失敗，請稍後再試');
      return;
    }
    setAvatarPreviewUrl(null);
    setAvatarImageId(null);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <TopBar
        left={
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="返回"
            className="flex h-8 w-8 cursor-pointer items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5 text-text-primary" strokeWidth={2} />
          </button>
        }
        title="編輯個人資料"
        right={
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="cursor-pointer text-label-md font-bold text-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            儲存
          </button>
        }
        className="py-4"
      />

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto bg-muted">
        {/* Avatar */}
        <div className="flex flex-col items-center px-4.5 pt-7 pb-2">
          <div className="relative h-22 w-22">
            <button
              type="button"
              onClick={() => setAvatarSheetOpen(true)}
              disabled={avatarUploading}
              className="relative h-22 w-22 cursor-pointer overflow-hidden rounded-full border-[3px] border-background bg-primary shadow-[0_4px_12px_rgba(217,154,61,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {avatarPreviewUrl ? (
                <Image src={avatarPreviewUrl} alt="" fill sizes="88px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-display-lg font-bold text-gold-dark">
                  {avatarInitial}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setAvatarSheetOpen(true)}
              disabled={avatarUploading}
              className="absolute -right-0.5 -bottom-0.5 flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full border-[3px] border-muted bg-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5 text-background" strokeWidth={2} />
            </button>
          </div>
          <span className="mt-2.5 text-label-md text-text-tertiary">
            {avatarUploading ? '上傳中…' : avatarFilled ? '點擊以更換大頭貼' : '點擊以上傳大頭貼'}
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
          <div className="mb-2.5 text-body-md font-bold text-text-primary">基本資料</div>
          <div className="flex flex-col rounded-panel bg-popover px-4 py-1">
            <div className="flex items-center justify-between border-b border-border-subtle py-3.5">
              <span className="w-19 shrink-0 text-body-md text-text-muted">暱稱</span>
              <Input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="輸入暱稱"
                className="h-auto flex-1 border-none bg-transparent p-0 text-right text-body-md font-semibold text-text-primary shadow-none"
              />
            </div>
            <div className="flex items-start justify-between border-b border-border-subtle py-3.5">
              <span className="w-19 shrink-0 pt-0.5 text-body-md text-text-muted">自我介紹</span>
              <textarea
                rows={2}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="介紹一下你的穿搭風格吧"
                className="flex-1 resize-none border-none bg-transparent text-right text-body-md text-text-primary outline-none placeholder:font-medium placeholder:text-text-placeholder"
              />
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="w-19 shrink-0 text-body-md text-text-muted">性別</span>
              <div className="flex flex-1 justify-end gap-2">
                {GENDER_OPTIONS.map((opt) => {
                  const selected = gender === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setGender(opt.key)}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-1.75 ${
                        selected
                          ? 'border-foreground bg-foreground font-semibold text-background'
                          : 'border-border bg-muted font-medium text-text-muted'
                      }`}
                    >
                      <span className="text-label-md">{opt.label}</span>
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
            <span className="text-body-md font-bold text-text-primary">身材資訊</span>
            <span className="text-label-md text-text-tertiary">用於他人給你穿搭建議時參考</span>
          </div>
          <div className="flex flex-col rounded-panel bg-popover px-4 py-1">
            <div className="flex items-center justify-between border-b border-border-subtle py-3.5">
              <span className="text-body-md text-text-muted">身高</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={heightCm}
                  onChange={(event) => setHeightCm(event.target.value.replace(/^-/, ''))}
                  placeholder="--"
                  className="h-auto w-16 border-none bg-transparent p-0 text-right text-body-md font-semibold text-text-primary shadow-none"
                />
                <span className="w-5 text-label-md text-text-tertiary">cm</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-border-subtle py-3.5">
              <span className="text-body-md text-text-muted">體重</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value.replace(/^-/, ''))}
                  placeholder="--"
                  className="h-auto w-16 border-none bg-transparent p-0 text-right text-body-md font-semibold text-text-primary shadow-none"
                />
                <span className="w-5 text-label-md text-text-tertiary">kg</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <span className="text-body-md text-text-muted">生日</span>
              <div className="relative flex items-center gap-1.5">
                <Calendar
                  className="pointer-events-none h-4 w-4 shrink-0 text-text-tertiary"
                  strokeWidth={1.8}
                />
                <span className="pointer-events-none min-w-22 text-right text-body-md font-semibold text-text-primary">
                  {formatBirthDate(birthDate)}
                </span>
                <input
                  type="date"
                  aria-label="生日"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  onClick={(event) => {
                    const target = event.target as HTMLInputElement & {
                      showPicker?: () => void;
                    };
                    target.showPicker?.();
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer border-none bg-transparent text-right text-body-md font-semibold text-transparent opacity-0 outline-none [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-3" />
      </div>

      {/* Avatar action sheet */}
      <Sheet open={avatarSheetOpen} onOpenChange={setAvatarSheetOpen}>
        <SheetContent
          side="bottom"
          className="gap-0 rounded-t-sheet bg-popover px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+22px)] shadow-[0_-4px_20px_rgba(64,58,50,0.16)]"
        >
          <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-border" />

          <button
            type="button"
            onClick={handlePickFromLibrary}
            className="flex w-full cursor-pointer items-center gap-3 px-1.5 py-3.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/12">
              <ImageIcon width="18" height="18" className="text-gold-dark" strokeWidth={1.8} />
            </div>
            <span className="text-body-md font-semibold text-text-primary">從圖庫中選擇</span>
          </button>

          {avatarFilled && (
            <>
              <div className="mx-1.5 my-0.5 h-px bg-border-subtle" />
              <button
                type="button"
                onClick={() => {
                  setAvatarSheetOpen(false);
                  setDeleteConfirmOpen(true);
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-1.5 py-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 width="18" height="18" className="text-destructive" strokeWidth={1.8} />
                </div>
                <span className="text-body-md font-semibold text-destructive">刪除大頭貼</span>
              </button>
            </>
          )}

          <div className="mx-1.5 my-0.5 h-px bg-border-subtle" />
          <button
            type="button"
            onClick={() => setAvatarSheetOpen(false)}
            className="flex w-full cursor-pointer items-center justify-center px-1.5 py-3.5"
          >
            <span className="text-body-md font-semibold text-text-muted">取消</span>
          </button>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="flex flex-col items-center px-5.5 pt-6.5 pb-5 text-center">
          <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-full bg-destructive-bg text-destructive">
            <Trash2 className="h-6 w-6" />
          </div>
          <DialogTitle className="mb-2">刪除大頭貼？</DialogTitle>
          <DialogDescription className="mb-5.5">
            刪除後將無法復原，需要重新上傳照片。
          </DialogDescription>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setDeleteConfirmOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={handleConfirmDeleteAvatar}
              className="flex-1"
            >
              刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
