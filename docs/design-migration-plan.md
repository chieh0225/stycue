# Design Token / shadcn 元件遷移 — 現況

> 只反映「當下事實」，狀態改變就直接覆寫本文件，不保留歷史版本。
> 想看某個決策為什麼這樣選 → [`design-decisions.md`](./design-decisions.md)。
> 想看還剩什麼沒做、有什麼風險 → [`design-remaining-debt.md`](./design-remaining-debt.md)。
> 想看某次改動實際做了什麼、何時 commit → `git log`（commit message 已含 Phase 標記，如 `feat(ui): adopt Button primitive at rectangular CTAs`）。
> Track A（元件盤點規格）/ Track B（非元件 class 稽核規則）的完整分類方法 → [`design-component-inventory.md`](./design-component-inventory.md)。

主線分支 `refactor/apply-design-tokens`（Phase 3A–3D）已透過 PR #20 合併進 `main`。後續若有新功能分支帶入尚未 token 化的頁面，會在獨立分支處理，記錄於下方「主線合併後的延伸分支」區塊，不使用主線 Phase 序號。

## Phase 狀態

| Phase          | 範圍                                                          | 狀態    | Commit                        |
| -------------- | ------------------------------------------------------------- | ------- | ----------------------------- |
| Step 1         | Track A/B 兩軌盤點                                            | ✅ 完成 | —                             |
| Step 2         | shadcn 可行性驗證                                             | ✅ 完成 | —                             |
| 3A             | Button / Badge / Avatar / Divider                             | ✅ 完成 | `bae17e9` `4704280` `a07da3a` |
| 3A.5（修正版） | `ui/*.tsx` 改用官方 Base UI 原始碼直接編輯，移除 `custom/` 層 | ✅ 完成 | `33ade1d` `3ad2222` `82ce7ac` |
| 3B             | Card / Input·Textarea / TopBar / BottomBar                    | ✅ 完成 | `546bd19`                     |
| 3C             | Dialog / Sheet + `tw-animate-css`                             | ✅ 完成 | `b9e8205`                     |
| 3D             | Track B 殘留收斂（B1/B2/B3）                                  | ✅ 完成 | `cc27a06`                     |

Phase 3A–3D 整批已隨 PR #20（`refactor/apply-design-tokens` → `main`）合併，`f3d146b` 為該分支合併前的最後一個 commit。

## 主線合併後的延伸分支

> 主線（Phase 3A–3D）已透過 PR #20 合併進 main。以下分支處理的頁面在主線規劃/執行當下尚未存在
> （由其他功能分支之後才帶入），不屬於原始 Track A/B 盤點範圍，故不套用 3A–3D 的 Phase 序號，
> 各自獨立追蹤。

| 分支                                         | 範圍                                                                                                | 狀態                | Commit                        |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------- |
| `refactor/apply-design-tokens-picture-pages` | `feat/picture-api` 新增頁面（`posts/new/photo`、`posts/new/preview`、`posts/new`）套用 design token | ✅ 完成，分支未合併 | `11ae367` `70be41f` `c80eda2` |

## 元件清單（`src/components/ui/`）

`button.tsx` `badge.tsx` `avatar.tsx`（含 `PlaceholderAvatar`）`separator.tsx` `card.tsx` `input.tsx` `textarea.tsx` `top-bar.tsx` `bottom-bar.tsx` `dialog.tsx` `sheet.tsx`。全部以官方 base-vega registry 原始碼為起點、直接編輯成品牌版；`top-bar.tsx`/`bottom-bar.tsx` 是自建（shadcn 無對應標配）。

## 依賴

`@base-ui/react`、`shadcn`（devDependency，僅供 `shadcn/tailwind.css` 的 custom variant）、`tw-animate-css`。

## 明確不做

- 不做純 token blanket sweep（元件層是白工，見 Context）。
- 不改互動流程、資訊架構、頁面 layout 結構。
- 不改品牌色、不新增 `globals.css` 沒有的 token、不導入 MUI/Material Web、不改 M3 role 命名。
- 不重構 `globals.css` 的 token 間接層（維持單層，`--primary` 等標準名稱直接持有品牌 hex）。
- 不建 `src/components/custom/` 資料夾、不要求「頁面零直接 import `ui/`」。
- 不為使用次數 1-2 處的組合建立具名 wrapper 元件。
- `next/font` 字體載入、hex→oklch 仍各自獨立分支（`design-tokens.md` §9）。
