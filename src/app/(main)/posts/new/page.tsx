'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DRAFT_STORAGE_KEY = 'stycue:commission-post-draft';
const budgetOptions = ['1000 - 3000', '3000 - 5000', '5000 - 10000', '10000 以上'];
const postTypes = ['委託', '提問', '分享'] as const;
const pointsOptions = ['50', '75', '100'];

type Draft = {
  title: string;
  description: string;
  height: string;
  weight: string;
  age: string;
  selectedBudget: string;
  postType: string;
  points: string;
};

const emptyDraft: Draft = {
  title: '',
  description: '',
  height: '',
  weight: '',
  age: '',
  selectedBudget: budgetOptions[0],
  postType: postTypes[0],
  points: pointsOptions[0],
};

export default function NewPostPage() {
  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [heightFocused, setHeightFocused] = useState(false);
  const [weightFocused, setWeightFocused] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);

  const [form, setForm] = useState<Draft>(emptyDraft);
  const { title, description, height, weight, age, selectedBudget, postType, points } = form;
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  useEffect(() => {
    // Deferred to a microtask so the restore doesn't setState synchronously
    // within the effect body (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      try {
        setForm({ ...emptyDraft, ...(JSON.parse(saved) as Partial<Draft>) });
      } catch {
        // Ignore a corrupted draft rather than blocking the page.
      }
    });
  }, []);

  function saveDraft() {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
  }

  return (
    <div className="flex flex-1 flex-col bg-surface-base">
      {/* Header */}
      <div className="flex items-center justify-between bg-surface-soft px-4 py-4">
        <Link href="/" onClick={saveDraft} className="text-sm text-text-muted">
          取消
        </Link>
        <h1 className="text-base font-semibold text-text-primary">發表委託</h1>
        <div className="w-8" />
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 py-4">
        {/* User row */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-text-primary text-sm text-surface-base">
            M
          </div>
          <span className="text-sm font-medium text-text-primary">Maple</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTypeMenuOpen((open) => !open)}
              aria-expanded={typeMenuOpen}
              className="flex items-center gap-1 rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold text-accent-amber"
            >
              {postType}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`h-2.5 w-2.5 transition-transform ${typeMenuOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {typeMenuOpen ? (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTypeMenuOpen(false)} />
                <div className="absolute top-full left-0 z-40 mt-2 w-24 overflow-hidden rounded-xl border border-border-default bg-white shadow-[0_4px_12px_rgba(217,154,61,0.12)]">
                  {postTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, postType: type }));
                        setTypeMenuOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-xs font-medium ${
                        type === postType
                          ? 'bg-surface-soft text-accent-amber'
                          : 'text-text-primary hover:bg-surface-soft'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={titleFocused ? '' : '標題'}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              className="w-full bg-transparent text-base text-text-primary placeholder-text-muted outline-none"
            />
            <span className="shrink-0 text-xs text-text-muted">40 字</span>
          </div>
        </div>

        {/* Description */}
        <textarea
          rows={3}
          value={description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder={descriptionFocused ? '' : '描述你想要的需求\n( etc. 場景、風格... )'}
          onFocus={() => setDescriptionFocused(true)}
          onBlur={() => setDescriptionFocused(false)}
          className="w-full resize-none bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
        />

        {/* Upload / tags */}
        <div className="flex gap-3">
          <Link
            href="/posts/new/photo"
            className="flex items-center gap-1 rounded-full border border-border-default px-3 py-1.5 text-xs text-text-muted"
          >
            <span aria-hidden>🖼️</span> 上傳圖片
          </Link>
          <Link
            href="/posts/new/tags"
            className="flex items-center gap-1 rounded-full border border-border-default px-3 py-1.5 text-xs text-text-muted"
          >
            <span aria-hidden>🏷️</span> 選擇標籤
          </Link>
        </div>

        <hr className="border-border-default" />

        {/* Body info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">身材資訊</h2>
            <span className="text-xs text-red-500">*必填</span>
          </div>
          <input
            type="number"
            min="1"
            value={height}
            onChange={(event) => setForm((prev) => ({ ...prev, height: event.target.value }))}
            placeholder={heightFocused ? '' : '您的身高 (公分)'}
            onFocus={() => setHeightFocused(true)}
            onBlur={() => setHeightFocused(false)}
            className="w-full rounded-lg border border-border-default bg-transparent px-3 py-2 text-center text-sm text-text-primary placeholder-text-muted outline-none"
          />
          <input
            type="number"
            min="1"
            value={weight}
            onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))}
            placeholder={weightFocused ? '' : '您的體重 (公斤)'}
            onFocus={() => setWeightFocused(true)}
            onBlur={() => setWeightFocused(false)}
            className="w-full rounded-lg border border-border-default bg-transparent px-3 py-2 text-center text-sm text-text-primary placeholder-text-muted outline-none"
          />
          <input
            type="number"
            min="1"
            value={age}
            onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
            placeholder={ageFocused ? '' : '您的年齡'}
            onFocus={() => setAgeFocused(true)}
            onBlur={() => setAgeFocused(false)}
            className="w-full rounded-lg border border-border-default bg-transparent px-3 py-2 text-center text-sm text-text-primary placeholder-text-muted outline-none"
          />
        </div>

        {/* Budget */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">預算範圍</h2>
            <span className="text-xs text-red-500">*必填</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {budgetOptions.map((option) => {
              const selected = option === selectedBudget;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, selectedBudget: option }))}
                  className={
                    selected
                      ? 'rounded-lg border-2 border-brand-primary bg-surface-soft px-3 py-2 text-sm font-medium text-text-primary'
                      : 'rounded-lg border-2 border-border-default px-3 py-2 text-sm text-text-muted'
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Points */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-primary">本次委託發佈積分</h2>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-accent-amber">
              ✦
            </span>
            <select
              value={points}
              onChange={(event) => setForm((prev) => ({ ...prev, points: event.target.value }))}
              className="flex-1 rounded-lg border border-border-default bg-transparent py-2 pr-3.5 pl-3 text-sm text-text-primary outline-none"
            >
              {pointsOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="text-sm text-text-muted">點</span>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-primary">預設委託截止時間為 7 天</h2>
          <div className="flex items-center gap-2 rounded-lg bg-surface-soft px-3 py-2">
            <span aria-hidden>📅</span>
            <span className="text-sm text-text-primary">2026 年 6 月 24 日</span>
          </div>
          <p className="text-xs text-text-muted">送出後自動計算，無法編輯</p>
        </div>

        {/* Info box */}
        <div className="flex flex-col gap-2 rounded-lg bg-surface-soft p-4 text-xs text-text-muted">
          <h3 className="text-sm font-semibold text-text-primary">委託該怎麼寫呢？</h3>
          <p>
            <span aria-hidden>ⓘ</span>{' '}
            委託送出後就不能變更了，請仔細確認內容是否有遺漏，將會根據每次提供的積分扣除 5
            點作為平台手續費。
          </p>
          <p>
            <span aria-hidden>ⓘ</span>{' '}
            收取發文手續費，旨在避免非必要的發布、修改與取消操作，維持平台內容管理秩序。
          </p>
          <p>
            <span aria-hidden>ⓘ</span> 平台內每次委託最長 7
            天，委託者可以在此期限內選擇最佳留言給予積分。
          </p>
        </div>

        {/* Submit */}
        <button className="w-full rounded-lg bg-brand-primary py-3 text-sm font-semibold text-text-primary">
          送出
        </button>
      </div>
    </div>
  );
}
