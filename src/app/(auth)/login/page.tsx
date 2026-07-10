'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { setAuthed } from '../../auth';
import { AlertIcon, GoogleIcon, LockIcon, LogoIcon, MailIcon } from '../icons';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../validation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const emailError = submitted && !EMAIL_REGEX.test(email) ? '請輸入正確的 Email 格式' : null;
  const passwordError =
    submitted && !PASSWORD_REGEX.test(password) ? '密碼只可為英文字母與數字' : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setApiError(null);
    if (!EMAIL_REGEX.test(email) || !PASSWORD_REGEX.test(password)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (!result.success) {
        setApiError(result.message || '登入失敗，請稍後再試');
        return;
      }
      setAuthed(result.data);
      router.push('/');
    } catch {
      setApiError('無法連線到伺服器，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col px-7 pt-16 pb-8">
      {/* Logo / brand */}
      <div className="mb-9 flex flex-col items-center">
        <div className="mb-3.5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-cta-strong">
          <LogoIcon />
        </div>
        <h1 className="text-[22px] font-bold tracking-[0.5px] text-text-primary">StyCue</h1>
        <p className="mt-1 text-meta text-text-muted">歡迎回來，加入穿搭討論</p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mb-5.5 rounded-2xl bg-white px-5 pt-5.5 pb-6 shadow-card"
      >
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-meta font-semibold text-text-primary">
            信箱
          </label>
          <div
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3.25 ${
              emailError
                ? 'border border-destructive bg-destructive-bg'
                : 'border-border-default bg-surface-soft'
            }`}
          >
            <MailIcon className={emailError ? 'text-destructive' : 'text-text-tertiary'} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-placeholder outline-none"
            />
          </div>
          {emailError && (
            <div className="mt-1.75 flex items-center gap-1.25 text-xs font-semibold text-destructive">
              <AlertIcon />
              {emailError}
            </div>
          )}
        </div>

        <div className="mb-2">
          <label
            htmlFor="password"
            className="mb-2 block text-meta font-semibold text-text-primary"
          >
            密碼
          </label>
          <div
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3.25 ${
              passwordError
                ? 'border border-destructive bg-destructive-bg'
                : 'border-border-default bg-surface-soft'
            }`}
          >
            <LockIcon className={passwordError ? 'text-destructive' : 'text-text-tertiary'} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8 字元以上，只包含英文字母與數字"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-placeholder outline-none"
            />
          </div>
          {passwordError && (
            <div className="mt-1.75 flex items-center gap-1.25 text-xs font-semibold text-destructive">
              <AlertIcon />
              {passwordError}
            </div>
          )}
        </div>

        <div className="mb-5 text-right">
          <Link href="/forgot-password" className="text-[12.5px] font-semibold text-accent-amber">
            忘記密碼？
          </Link>
        </div>

        {apiError && (
          <div className="mb-4 flex items-center gap-1.25 rounded-lg bg-destructive-bg px-3.5 py-2.5 text-xs font-semibold text-destructive">
            <AlertIcon />
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-12.5 w-full rounded-lg bg-brand-primary text-name font-bold text-text-primary shadow-cta disabled:opacity-60"
        >
          {loading ? '登入中...' : '登入'}
        </button>
      </form>

      {/* Divider */}
      <div className="mb-5.5 flex items-center gap-3">
        <Separator className="w-auto flex-1" />
        <span className="text-xs text-text-muted">或使用以下方式登入</span>
        <Separator className="w-auto flex-1" />
      </div>

      {/* Google */}
      <button
        type="button"
        className="mb-7 flex h-12.5 w-full items-center justify-center gap-2.5 rounded-lg border border-border-default bg-white text-sm font-semibold text-text-primary shadow-card"
      >
        <GoogleIcon />
        使用 Google 繼續
      </button>

      {/* Sign up */}
      <div className="mt-auto text-center text-[13.5px]">
        <span className="text-text-muted">還沒有帳號？</span>
        <Link href="/register" className="ml-1 font-bold text-accent-amber">
          快速註冊
        </Link>
      </div>
    </div>
  );
}
