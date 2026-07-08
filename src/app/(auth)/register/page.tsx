'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { setAuthed } from '../../auth';
import { AlertIcon, GoogleIcon, LockIcon, LogoIcon, MailIcon, PersonIcon } from '../icons';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../validation';

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const nicknameError = submitted && !nickname.trim() ? '請輸入暱稱' : null;
  const emailError = submitted && !EMAIL_REGEX.test(email) ? '請輸入正確的 Email 格式' : null;
  const passwordError =
    submitted && !PASSWORD_REGEX.test(password) ? '密碼只可為英文字母與數字' : null;
  const confirmPasswordError =
    submitted && confirmPassword !== password ? '兩次密碼輸入不一致' : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setApiError(null);
    if (
      !nickname.trim() ||
      !EMAIL_REGEX.test(email) ||
      !PASSWORD_REGEX.test(password) ||
      confirmPassword !== password
    ) {
      return;
    }

    setLoading(true);
    try {
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nickName: nickname,
          password,
          passwordCheck: confirmPassword,
        }),
      });
      const registerResult = await registerRes.json();
      if (!registerResult.success) {
        setApiError(registerResult.message || '註冊失敗，請稍後再試');
        return;
      }

      // Register doesn't return an access token, so log in right after to
      // actually establish a session with the same credentials.
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginResult = await loginRes.json();
      if (!loginResult.success) {
        setApiError('註冊成功，但自動登入失敗，請改用登入頁面登入');
        return;
      }

      setAuthed(loginResult.data);
      router.push('/');
    } catch {
      setApiError('無法連線到伺服器，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col px-7 pt-14 pb-8">
      {/* Logo / brand */}
      <div className="mb-5.5 flex flex-col items-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.18)]">
          <LogoIcon className="h-6.25 w-6.25" />
        </div>
        <h1 className="text-xl font-bold tracking-[0.5px] text-text-primary">StyCue</h1>
        <p className="mt-1 text-[13px] text-text-muted">建立帳號，開始分享你的穿搭</p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mb-5 rounded-2xl bg-white px-5 pt-5 pb-5.5 shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
      >
        <div className="mb-3.5">
          <label
            htmlFor="nickname"
            className="mb-2 block text-[13px] font-semibold text-text-primary"
          >
            暱稱
          </label>
          <div
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3.25 ${
              nicknameError
                ? 'border-[1.5px] border-[#D64545] bg-[#FDF0EE]'
                : 'border-border-default bg-surface-soft'
            }`}
          >
            <PersonIcon className={nicknameError ? 'text-[#D64545]' : 'text-[#9A9080]'} />
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="你想被叫什麼？"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-[#B8AF9E] outline-none"
            />
          </div>
          {nicknameError && (
            <div className="mt-1.75 flex items-center gap-1.25 text-xs font-semibold text-[#D64545]">
              <AlertIcon />
              {nicknameError}
            </div>
          )}
        </div>

        <div className="mb-3.5">
          <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-text-primary">
            信箱
          </label>
          <div
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3.25 ${
              emailError
                ? 'border-[1.5px] border-[#D64545] bg-[#FDF0EE]'
                : 'border-border-default bg-surface-soft'
            }`}
          >
            <MailIcon className={emailError ? 'text-[#D64545]' : 'text-[#9A9080]'} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-[#B8AF9E] outline-none"
            />
          </div>
          {emailError && (
            <div className="mt-1.75 flex items-center gap-1.25 text-xs font-semibold text-[#D64545]">
              <AlertIcon />
              {emailError}
            </div>
          )}
        </div>

        <div className="mb-3.5">
          <label
            htmlFor="password"
            className="mb-2 block text-[13px] font-semibold text-text-primary"
          >
            密碼
          </label>
          <div
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3.25 ${
              passwordError
                ? 'border-[1.5px] border-[#D64545] bg-[#FDF0EE]'
                : 'border-border-default bg-surface-soft'
            }`}
          >
            <LockIcon className={passwordError ? 'text-[#D64545]' : 'text-[#9A9080]'} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 8 字元、只能含英文字母與數字"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-[#B8AF9E] outline-none"
            />
          </div>
          {passwordError && (
            <div className="mt-1.75 flex items-center gap-1.25 text-xs font-semibold text-[#D64545]">
              <AlertIcon />
              {passwordError}
            </div>
          )}
        </div>

        <div className="mb-1.5">
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-[13px] font-semibold text-text-primary"
          >
            再次確認密碼
          </label>
          <div
            className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-3.25 ${
              confirmPasswordError
                ? 'border-[1.5px] border-[#D64545] bg-[#FDF0EE]'
                : 'border-border-default bg-surface-soft'
            }`}
          >
            <LockIcon className={confirmPasswordError ? 'text-[#D64545]' : 'text-[#9A9080]'} />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="至少 8 字元、只能含英文字母與數字"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-[#B8AF9E] outline-none"
            />
          </div>
          {confirmPasswordError && (
            <div className="mt-1.75 flex items-center gap-1.25 text-xs font-semibold text-[#D64545]">
              <AlertIcon />
              {confirmPasswordError}
            </div>
          )}
        </div>

        {apiError && (
          <div className="mt-4 flex items-center gap-1.25 rounded-lg bg-[#FDF0EE] px-3.5 py-2.5 text-xs font-semibold text-[#D64545]">
            <AlertIcon />
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4.5 h-12.5 w-full rounded-lg bg-brand-primary text-[15px] font-bold text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.14)] disabled:opacity-60"
        >
          {loading ? '建立中...' : '建立帳號'}
        </button>
      </form>

      {/* Divider */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-default" />
        <span className="text-xs text-text-muted">或使用以下方式註冊</span>
        <div className="h-px flex-1 bg-border-default" />
      </div>

      {/* Google */}
      <button
        type="button"
        className="mb-6 flex h-12.5 w-full items-center justify-center gap-2.5 rounded-lg border border-border-default bg-white text-sm font-semibold text-text-primary shadow-[0_4px_12px_rgba(217,154,61,0.08)]"
      >
        <GoogleIcon />
        使用 Google 繼續
      </button>

      {/* Login link */}
      <div className="mt-auto text-center text-[13.5px]">
        <span className="text-text-muted">已經有帳號了？</span>
        <Link href="/login" className="ml-1 font-bold text-accent-amber">
          登入
        </Link>
      </div>
    </div>
  );
}
