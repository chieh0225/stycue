# ⚠️ 本文件已棄用（Deprecated）

**內容已拆分至以下 3 份文件，請改看那邊：**

- 現在採用了什麼、各 Phase 狀態 → [`design-migration-plan.md`](./design-migration-plan.md)
- 決策理由、哪些不可逆 → [`design-decisions.md`](./design-decisions.md)
- 還剩什麼待辦、什麼風險 → [`design-remaining-debt.md`](./design-remaining-debt.md)
- 某次改動實際做了什麼、何時 → `git log`（commit message 已含 Phase 標記）

本文件保留僅供歷史 before/after 對照表查閱（該類執行細節不搬遷），**不再更新**。

---

# 設計 Token / 元件套用紀錄（apply log，已棄用）

> 分支：`refactor/apply-design-tokens`
> 規格來源：[`docs/design-component-inventory.md`](./design-component-inventory.md)、[`docs/design-tokens.md`](./design-tokens.md)。
>
> **用途**：Step 3 每採用一個元件/一頁，就在此追加前→後對照，集中留痕。
> **原則**：以 shadcn 元件（`src/components/ui/*`）取代 inline 寫法，variant 用現有 token；偏移值收斂到最近標準級距；不改互動流程/資訊架構/layout。
> **Phase 3A.5（修正版）起追加原則**：`ui/*.tsx` 以 shadcn 官方 registry 原始碼為起點、直接編輯成品牌版，頁面直接 `import { X } from '@/components/ui/x'`，不設 `custom/` 邊界層（見下方 Phase 3A.5 條目的範式修正說明）。

---

## Phase 3A — 葉節點 primitive

### #1 Button（`src/components/ui/button.tsx`）

**元件定案**：cva Button，variant `primary`/`secondary`/`goldDark`/`destructive`/`ghost`；size `sm`(h-9)/`md`(h-11)/`lg`(h-13)/`icon`。base 含 `rounded-lg font-bold transition-colors focus-visible:ring-2 ring-ring disabled:opacity-50`。`<Link>` CTA 用 `cn(buttonVariants({...}))`（不引入 Radix Slot，保持 dep-free）。

**採用點（矩形文字 CTA）**：

| 檔案:行                                  | 前                                                                                                  | 後                                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `add-comment-form.tsx:407`（取消 Link）  | `flex h-13 … rounded-lg border-[1.5px] border-border-default text-base font-bold text-text-primary` | `<Link className={cn(buttonVariants({ variant:'secondary', size:'lg' }), 'flex-1')}>`              |
| `add-comment-form.tsx:415`（發佈）       | `flex h-13 … bg-brand-primary … shadow-[…0.14] disabled:opacity-50`                                 | `<Button variant="primary" size="lg" className="flex-1">`                                          |
| `add-comment-form.tsx:448`（modal 取消） | `h-[46px] … border-[1.5px] border-border-default … hover:bg-[#F5EEDA]`                              | `<Button variant="secondary" size="md">`（自訂 hover `#F5EEDA`→variant 的 `hover:bg-accent`，§B2） |
| `add-comment-form.tsx:455`（modal 刪除） | `h-[46px] … bg-[#C0564B] … shadow-[…192,86,75,0.28] hover:bg-[#AB4B41]`                             | `<Button variant="destructive" size="md">`（§7-1 收斂，去自訂陰影/hover）                          |
| `page.tsx:533`（簽到 知道了）            | `w-full rounded-[10px] bg-brand-primary px-4 py-3 text-[15px]`                                      | `<Button variant="primary" size="lg" className="w-full">`                                          |
| `posts/[id]/page.tsx:139`（追蹤）        | `rounded-lg bg-brand-primary px-4.5 py-2 text-[13px] … shadow-[…0.18]`                              | `<Button size="sm">`                                                                               |

**收斂帶來的極輕微視覺位移**（已接受）：modal 按鈕 `h-[46px]`→`h-11`(44)；追蹤 `shadow-cta-strong`→`shadow-cta`；簽到 `rounded-[10px]`→`rounded-lg`(8)、`text-[15px]`→`text-title`(16)。

**尚未採用（留待後續）**：

- 圓形 icon 按鈕（`comment-composer.tsx:113` send、`bottom-nav.tsx:126` FAB、`ReplyComposer` send）——屬 `IconButton`（`rounded-full`），與矩形 Button 不同型，待另立 `IconButton` primitive。
- `comment-board.tsx` 的 give-points modal 按鈕（該檔目前為原始 hardcoded，待 Dialog 階段一起處理）。
- `login`/`register` 的送出 CTA（待表單元件階段）。

**驗證**：`tsc` 0 errors、`eslint` 0 errors（唯一 warning `prefer-destructuring` 為既有、與本次無關）、`npm run build` ✓ Compiled successfully。
**Commit（建議）**：`feat(ui): adopt Button primitive at rectangular CTAs`

### #2 Badge（`src/components/ui/badge.tsx`）

**元件定案**：cva Badge，variant `gold`/`blue`/`green`/`neutral`；base `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold`（`neutral` 額外 `border border-border bg-muted font-normal`）。純靜態標籤，非互動——長得像 chip 的下拉觸發器（見下方「未採用」）仍留在 `<button>`，等 Select primitive 再處理。

**採用點（9 處靜態標籤）**：

| 檔案:行                                          | 前                                                                                             | 後                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `posts/[id]/page.tsx:121`（委託類型）            | `rounded-md bg-[#FCEFDA] px-[9px] py-[3px] text-[13px] text-accent-amber`                      | `<Badge variant="gold">`                         |
| `posts/[id]/page.tsx:171`（穿搭標籤 tags.map）   | `rounded-full border-border-default bg-[#FDF7E9] px-3.5 py-1.75 text-[13px] text-text-primary` | `<Badge variant="neutral">`                      |
| `page.tsx:392`（feed post.badge）                | `rounded-full bg-surface-soft px-2.5 py-1 text-[11px] text-accent-amber`                       | `<Badge variant="gold">`                         |
| `page.tsx:399`（feed post.tag）                  | 同上                                                                                           | `<Badge variant="gold">`                         |
| `page.tsx:428`（feed post.chips）                | `rounded-full bg-surface-soft px-2.5 py-1 text-[11px] text-text-primary`                       | `<Badge variant="neutral">`                      |
| `comment-board.tsx:383`（委託人）                | `rounded-full bg-[#E7EDFA] px-[9px] py-0.5 text-[11px] text-[#5B7FBE]`                         | `<Badge variant="blue">`                         |
| `comment-board.tsx:618`（最佳留言，含 StarIcon） | `rounded-full bg-[#FCEFDA] px-[9px] py-0.5 text-[11px] text-accent-amber`                      | `<Badge variant="gold">`（icon 子節點照舊）      |
| `comment-board.tsx:624`（樓層）                  | `rounded-md bg-[rgba(169,184,142,0.15)] px-[7px] py-0.5 text-[11px] text-[#4E6B45]`            | `<Badge variant="green" className="rounded-lg">` |

**收斂帶來的極輕微視覺位移**（已接受，跨 9 處統一單一 padding/字級）：`px-[9px]/[7px] py-[3px]/[0.5]` → `px-2.5 py-1`；`text-[13px]/[11px]` → `text-caption`(12px)；`bg-surface-soft`(feed badge/tag/chips) → `bg-gold-soft`/`bg-muted`；委託類型（gold）`rounded-md` → Badge 預設 `rounded-full`。

**修正**：樓層原本收斂成跟其他 badge 一樣的 `rounded-full`，但樓層在畫面上應與「追蹤」按鈕（方角）視覺呼應，而非跟其他 pill 標籤同款。改為 `<Badge variant="green" className="rounded-lg">`（`cn`/`twMerge` 依 class 順序保留最後宣告的 `rounded-lg`，蓋掉 Badge 預設的 `rounded-full`）——**只有樓層這一處**改方角，其餘 8 處維持 `rounded-full`；Badge 元件本身不加 shape prop（案例太少，用 className override 即可）。

**尚未採用（留待後續）**：

- `preview/page.tsx:250`（可移除標籤 pill，含內嵌 ✕ remove 按鈕）——padding 較大是為了 ✕ 的觸控範圍，套用 Badge 預設 padding 會縮小可點擊區，屬功能性風險而非純樣式收斂，本次不動。
- `preview/page.tsx:143`、`page.tsx:296`（分類/篩選下拉觸發器）——外觀像 chip 但是互動 `<button>`（開合選單），非靜態 Badge，待 `Select`/`Dropdown` primitive 一起處理。
- `page.tsx:251`（trending 排名徽章）、`empty-notifications.tsx` skeleton——屬 A8 其他小元件，非本輪範圍。

**驗證**：`tsc` 0 errors、`eslint` 0 errors、`npm run build` ✓ Compiled successfully。
**Commit（建議）**：`feat(ui): adopt Badge primitive at static tag/label sites`

### #3 Avatar + Divider（`src/components/ui/avatar.tsx`、`divider.tsx`）

**元件定案**：

- **Avatar**：cva，base `inline-flex shrink-0 items-center justify-center rounded-full bg-foreground text-sm text-background`；size `sm`(30px)/`md`(34px)/`lg`(36px)/`xl`(38px，預設)。內容（icon 或姓名縮寫文字）由呼叫端傳入 children，元件不內建圖示邏輯。
- **Divider**：無 variant，`h-px w-full bg-border`，margin/寬度用 `className` override。

**尺寸層級決策（依畫面情境分四階，非數值就近湊）**：

- `xl`(38px)：主要作者列——單頁最主要的身分標示（post detail／preview／發表委託頁／comment 表單的作者列）。
- `lg`(36px)：留言列表項目身分（comment-board 留言項目），與 xl 分開避免同畫面主從混淆。
- `md`(34px)：緊湊列/操作列（composer 底部輸入列、feed 卡片作者色塊）。
- `sm`(30px)：次要/巢狀情境（留言巢狀回覆、trending 小卡作者色塊——原 28px，因與回覆頭像同屬「全站最緊湊」層級收斂進來）。

**採用點（8 處固定色頭像 + 2 處動態色頭像）**：

| 檔案:行                                                             | 前                                                                             | 後                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `posts/[id]/page.tsx:130`（作者列）                                 | `h-[38px] w-[38px] … bg-text-primary text-surface-base`                        | `<Avatar size="xl"><UserIcon /></Avatar>`                                      |
| `posts/new/preview/page.tsx:200`（作者列，文字 M）                  | `h-[38px] w-[38px] … bg-text-primary text-sm text-surface-base`                | `<Avatar size="xl">M</Avatar>`                                                 |
| `posts/new/page.tsx:106`（作者列，文字 M）                          | 原 `h-9 w-9`（36px）→ 修正對齊其他作者列                                       | `<Avatar size="xl">M</Avatar>`                                                 |
| `add-comment-form.tsx:257`（作者列）                                | `h-[38px] w-[38px] …`                                                          | `<Avatar size="xl"><UserIcon /></Avatar>`                                      |
| `comment-board.tsx:610`（留言項目）                                 | `h-9 w-9 …`（維持 36px，不併入 xl）                                            | `<Avatar size="lg"><UserIcon /></Avatar>`                                      |
| `comment-composer.tsx:78`、`comment-launcher.tsx:49`（composer 列） | `h-[34px] w-[34px] …`                                                          | `<Avatar size="md"><UserIcon className="h-4 w-4" /></Avatar>`                  |
| `comment-board.tsx:379`（巢狀回覆）                                 | `h-[30px] w-[30px] …`                                                          | `<Avatar size="sm"><UserIcon className="h-3.5 w-3.5" /></Avatar>`              |
| `page.tsx:271`（trending 小卡，動態色）                             | `h-7 w-7 rounded-full ${item.accent}`                                          | `<Avatar size="sm" className={item.accent} />`（twMerge 覆蓋 `bg-foreground`） |
| `page.tsx:383`（feed 貼文作者，動態色+邊框）                        | `h-[34px] w-[34px] rounded-full border-2 border-border-default ${post.accent}` | `<Avatar size="md" className={cn('border-2 border-border', post.accent)} />`   |

**Divider 採用點（11 處）**：`posts/[id]/page.tsx`×3、`preview/page.tsx`×3、`add-comment-form.tsx`×1、`comment-board.tsx`×3（`bg-[#EFE7CE]`/`bg-[#E0D4AA]` 依 §7-3 收斂 `bg-border`）、`login`/`register` 各 2（`h-px flex-1`→`<Divider className="w-auto flex-1" />`，避免 `w-full` 與 `flex-1` 在 flex row 內的寬度語意衝突，雖然 flex-basis:0 已足夠正確，仍保留 `w-auto` 讓行為與原始一致）。margin 全採 Track B B3 建議的原生 fraction（`mb-[18px]`→`mb-4.5`）。

**收斂帶來的極輕微視覺位移**（已接受）：`posts/new/page.tsx` 作者列 36px→38px（對齊其他頁作者列）；trending 小卡 28px→30px（併入最緊湊層級）。

**尚未採用（留待後續）**：

- `preview/page.tsx:143`（分類下拉觸發器內的頭像佔位，若有）、`page.tsx:251`（trending 排名徽章）、`empty-notifications.tsx` skeleton 圓形——非本輪範圍。
- `comment-board.tsx:360`（回覆串左側縱向分隔線 `border-l-2 border-[#EFE7CE]`）——非水平 Divider 用途（縱向 thread 線），色值收斂留給 Track B/Phase 3D 一併處理。

**驗證**：`tsc` 0 errors、`eslint` 0 errors（同一既有 warning）、`npm run build` ✓ Compiled successfully；額外確認 Tailwind v4 原生 fraction（`h-7.5`/`h-8.5`/`h-9.5`）與 `border-2`/`bg-foreground`/`text-background` 皆正確生成於編譯後 CSS。

---

## Phase 3A.5 — `custom/` 疊層（已放棄，範式修正見下）

**此版已整段作廢，不 commit**：曾建立 5 個 `src/components/custom/*` re-export/wrapper 檔案，要求頁面一律從 `custom/` 引入、不直接 import `ui/`。查證 shadcn 官方文件後發現這個前提站不住腳（官方明講「直接編輯 `ui/`，不要包 wrapper」），且使用者提供的實際團隊範例也是直接編輯 `ui/`、無 `custom/` 資料夾。已在 Phase 3A.5（修正版）整段重做，`custom/` 資料夾已刪除。

## Phase 3A.5（修正版）— `ui/` 直接改成品牌版，`custom/` 資料夾移除

**查證 shadcn 官方文件**：

> "This is not a component library. It is how you build your component library."
> "With shadcn/ui, you simply edit the button code directly."

官方立場：`ui/` 就是專案自己的程式碼，直接編輯，不要包 wrapper。查證官方 `ui/dialog.tsx` 後確認：官方也會有「複合子元件」（`DialogHeader`/`DialogFooter`），但做法是**共存同一檔案**，不是另開資料夾。

**環境變化**：shadcn 2026-07 起預設改用 **Base UI**（Radix 仍支援、非強制遷移）。已用 registry API（`https://ui.shadcn.com/r/styles/base-vega/{button,badge,avatar,separator}.json`）取得逐字官方原始碼，依賴改為單一整合套件 `@base-ui/react`（`npm install @base-ui/react`，已確認是現行正式套件名稱，非舊名 `@base-ui-components/react`）。

**`ui/*.tsx` 全部以官方原始碼為起點、直接編輯成品牌版**：

| 檔案                                  | 官方原樣                                                                                                                                                                                              | 改動                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `button.tsx`                          | variant `default/outline/secondary/ghost/destructive/link`；size 固定 px（`h-9`預設等）                                                                                                               | variant 改名為 `primary/secondary/goldDark/destructive/ghost`（品牌色，`destructive` 官方是淡色描邊 `bg-destructive/10`，改回實心白字）；size 改為 `sm/md/lg/icon`＝`h-9/h-11/h-13/size-9`；base 圓角 `rounded-md`→`rounded-lg`；保留官方的 `data-slot`、`focus-visible` ring、`active` 按壓效果、`aria-invalid` 狀態                     |
| `badge.tsx`                           | variant `default/secondary/destructive/outline/ghost/link`；`h-5 rounded-4xl px-2 py-0.5 text-xs`                                                                                                     | variant 改為 `gold/blue/green/neutral`；拿掉 `h-5` 高度限制、`rounded-4xl`→`rounded-full`、`px-2 py-0.5`→`px-2.5 py-1`、`text-xs`→`text-caption`；保留官方的 `useRender`/`mergeProps` 多型渲染機制                                                                                                                                        |
| `avatar.tsx`                          | `Avatar`+`AvatarImage`+`AvatarFallback`+`AvatarBadge`+`AvatarGroup`+`AvatarGroupCount`；size `default/sm/lg`(32/24/40px)；`after:` 框線偽元素；`AvatarFallback` 預設 `bg-muted text-muted-foreground` | 只保留 `Avatar`+`AvatarFallback`（無真實照片載入需求，`AvatarImage`/`AvatarBadge`/`AvatarGroup` 未使用不留）；size 改 `sm/md/lg/xl`＝30/34/36/38px；刪除 `after:` 框線偽元素；`AvatarFallback` 改 `bg-foreground text-background`；新增 `PlaceholderAvatar`（`accent`必填動態色＋`bordered?`，同檔案內共存，比照官方 `AvatarBadge` 模式） |
| `separator.tsx`（取代 `divider.tsx`） | `bg-border`，`data-horizontal:h-px data-horizontal:w-full`                                                                                                                                            | 幾乎原樣採用，無品牌改動；`ui/divider.tsx` 刪除                                                                                                                                                                                                                                                                                           |

**`src/components/custom/` 資料夾整個移除**。原規劃的具名組合逐一重新評估：

- `PrimaryCta`/`SecondaryCta`/`FloorBadge`——使用次數僅 1-2 處，不構成「重複」，**全部拆掉、call site 改回 raw props** 直接呼叫 `Button`/`Badge`。
- `ModalCancelButton`/`ModalActionButton`——目前 2 處（`add-comment-form.tsx` 刪除圖片 modal），**Phase 3C 做 Dialog 時再視情況搬進 `ui/dialog.tsx`** 當額外具名 export；現在同樣先拆掉、call site 改回 raw props（Phase 3C 尚未開始，`ui/dialog.tsx` 還不存在，不提前建）。

**遷移範圍（10 個頁面，import 改回 `@/components/ui/*`）**：`page.tsx`、`posts/[id]/page.tsx`、`posts/new/page.tsx`、`posts/new/preview/page.tsx`、`comment-composer.tsx`、`comment-launcher.tsx`、`comment-board.tsx`、`add-comment-form.tsx`、`login/page.tsx`、`register/page.tsx`。額外必要改動：**Avatar 的 icon/縮寫文字內容一律包一層 `<AvatarFallback>`**（官方 Base UI 結構要求，`Avatar.Root` 本身不顯示內容，`Fallback` 才是「無真實照片時顯示什麼」的插槽）；`PlaceholderAvatar`（無 icon/文字的純色圓）維持自我封閉、不經過 `AvatarFallback`，與原本行為一致。`Divider` 呼叫點全部改名 `Separator`。

**驗證**：`git diff --stat src/app/globals.css` 0 diff；`tsc --noEmit` 0 errors；`eslint src/app src/components` 0 errors（同一既有 warning）；`npm run build` ✓ 全站 35 條路由正常產出；編譯後 CSS 確認 `bg-gold-soft`/`shadow-cta`/`bg-destructive`/Avatar 四個尺寸的 fraction 皆正確生成；`npm run dev` 起服務對首頁／貼文詳情／登入頁各打一次確認 200、無執行期錯誤（確認 Base UI Avatar/Badge 元件能在 Server Component 頁面正確掛載）。
**Commit（建議）**：`refactor(ui): rebuild ui/{button,badge,avatar,separator} on official Base UI source, keep brand variants` + `refactor(ui): remove custom/ layer, call ui/ components directly`（可分開或合併，視偏好）。

---

## Phase 3A.5 修正版驗收後的追加修正 — `shadcn/tailwind.css`

驗收時發現兩個問題，追查後只有一個跟本次重寫有關：

**1. 登入失敗「無法連線到伺服器」——與本次重寫無關**。追查 `src/app/api/auth/login/route.ts`（本次完全沒改動的檔案）：它轉發到外部真實後端 `https://stycue.rocket-coding.com/api/Auth/login`，直接測試該後端對此請求回傳 **HTTP 500 + 空 body**；`route.ts` 對空 body 呼叫 `.json()` 拋例外（無 try/catch），Next.js 因此回 HTML 錯誤頁，前端 `res.json()` 解析 HTML 失敗，落入 catch 顯示該訊息。與 Button/Badge/Avatar/Separator 的改動無關，是既有後端/環境問題，本輪不處理。

**2. `Separator` 在登入頁顏色/樣式跑掉——根因已找到並修正**。shadcn 官方 `ui/separator.tsx` 用 `data-horizontal:`/`data-vertical:` 這組 **Tailwind 客製 variant**，語法上仰賴一個對應的 `@custom-variant` 宣告；這組宣告原本是 `shadcn init`/`add` 自動寫進 `globals.css` 的，但我們刻意跳過官方 CLI（Step 2 的決定），只複製了元件檔案本身，沒有這組宣告——導致 `data-horizontal:h-px`/`data-horizontal:w-full` 從未真正生效（SSR 檢查發現實際渲染出的屬性是 `data-orientation="horizontal"`，不是裸屬性 `data-horizontal`），`Separator` 因此沒有高度、只剩 `bg-border` 畫不出正常的一條線。

**修正**：查證後確認 shadcn 官方把這組客製 variant（`data-open`/`data-closed`/`data-horizontal`/`data-vertical` 等）與 `no-scrollbar`/`scroll-fade`/`shimmer` 幾個 utility 一起打包成一個獨立小套件 `shadcn`（npm，`shadcn/tailwind.css` 是它的 subpath export，運作方式類似 `tw-animate-css`：純樣式/variant 依賴，**不含任何顏色/主題 token**）。已安裝並套用：

- `npm install -D shadcn`（devDependency，建置期工具）。
- `globals.css` 新增 `@import 'shadcn/tailwind.css';`（緊接在 `@import 'tailwindcss';` 之後）。
- 移除 `globals.css` 內手寫的 `.no-scrollbar` 區塊——套件提供的版本更完整（多了 `-ms-overflow-style: none`），避免重複定義；`html.hide-native-scrollbar`（`<HideScrollbar>` 專用的另一機制）不受影響、維持原樣。
- `ui/separator.tsx` 改回官方原樣的 `data-horizontal:`/`data-vertical:` 寫法（先前為了繞過缺失的 variant，暫時改寫成 `data-[orientation=horizontal]:` 這種可攜寫法；現在 variant 已註冊，改回官方寫法，之後 `npx shadcn add separator` 的 diff 也會更乾淨）。

**驗證**：`npm view shadcn exports` 確認套件真的有 `./tailwind.css` subpath；`cat node_modules/shadcn/dist/tailwind.css` 逐行確認內容只有 variant/utility、無顏色 token；`tsc`/`eslint` 0 errors；`npm run build` ✓；編譯後 CSS 確認 `[data-orientation=` 選擇器正確生成、`no-scrollbar` 存在、**`--primary:#f6d978` 等品牌色完全未被覆蓋**（`git diff` 也確認 `:root`/`@theme inline` 區塊零異動，只多了一行 import）；SSR 直接檢查登入頁 `Separator` 渲染出的 class 與屬性，確認 `data-horizontal:h-px`/`data-horizontal:w-full` 現在能正確匹配 `data-orientation="horizontal"`。

---

## Phase 3B — Card / Input·Textarea / TopBar / BottomBar

延續 Phase 3A.5（修正版）的做法：新元件先取官方 registry 原始碼為起點（Card/Input/Textarea 有官方版本），或在無官方對應時自建（TopBar/BottomBar，`docs/design-component-inventory.md` A1/A7 本來就標注「shadcn 無對應標配」），直接編輯成品牌版，頁面直接 import，不設 `custom/` 邊界層。

### #4 Card（`src/components/ui/card.tsx`，自建，非官方 registry）

官方 Card 附帶 `CardHeader/CardTitle/CardDescription/CardAction/CardFooter` 這組複合子元件，但本專案四處用法（A2）都是單一表面＋依情境變色，沒有一處需要那組子結構，因此**不採用官方 Card 原始碼**，改用最小 cva 版本：`variant` = `post`(`rounded-card border border-border bg-card shadow-card`) / `trending`(同圓角陰影，無邊框) / `info`(`rounded-panel border border-border bg-muted`) / `outline`(`rounded-xl border border-border`，用於附加圖片卡片這類邊框收斂場景)。

**採用點**：

| 檔案:行                                                            | 前                                                                             | 後                                                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `page.tsx`（人氣穿搭 trending 卡）                                 | `<article className="w-[172px] … rounded-[16px] bg-white shadow-[…0.08]">`     | `<Card variant="trending" className="w-43 flex-none">`（外層 `<article>` 語意併入 Card 的 `<div>`，比照官方 Card 本身也是 `<div>` 的慣例） |
| `page.tsx`（全部文章 feed 卡）                                     | `<article className="mb-4 … rounded-[18px] border … bg-white shadow-[…0.08]">` | `<Card variant="post" className="mb-4">`                                                                                                   |
| `posts/[id]/page.tsx`（委託條件面板）                              | `<div className="… rounded-[14px] border … bg-[#FDF7E9] px-1 py-3.5">`         | `<Card variant="info" className="mb-5.5 px-1 py-3.5">`                                                                                     |
| `posts/new/preview/page.tsx`（同一面板，原本是複製貼上的重複結構） | 同上                                                                           | 同上（順手消掉這處重複）                                                                                                                   |
| `add-comment-form.tsx`（附加圖片卡片）                             | `<div className="… rounded-xl border-[1.5px] border-border-default p-3.5">`    | `<Card variant="outline" className="mb-3.5 flex gap-3 p-3.5">`（border 寬度 1.5px→1px，§Track B B3 收斂）                                  |

### #5 Input / Textarea（`src/components/ui/input.tsx`、`textarea.tsx`，官方 Base UI 原始碼為起點）

**範圍決策（重要）**：A6 把「裸框欄位」與「圖示前綴欄位（登入/註冊）」「pill 包裹欄位（留言 composer）」歸在同一張表，但三者結構不同——官方 `Input`/`Textarea` 假設自己就是那個有邊框的元素；圖示前綴欄位的邊框其實畫在外層 `<div>` 上（`<input>` 本身無邊框無底色）；pill 欄位同理，邊框/底色/圓角都在外層 pill 容器。硬套官方 Input 會需要拆掉外層邊框、把 `<input>` 撐滿容器再重新套一層樣式，等於重寫這兩種 composite，風險/工作量都不對稱。**本輪只採用官方 Input/Textarea 於真正的裸框欄位**（`add-comment-form.tsx` 的品牌名稱輸入框、留言內容 textarea）；登入/註冊的圖示前綴欄位、留言 composer 的 pill 欄位維持現狀，留待有專門的「複合欄位」規格時再處理。

官方原始碼改動：border 寬度 `border-[1.5px]`→`border`（§Track B B3 收斂）；圓角 `rounded-md`→`rounded-lg`；`bg-transparent`→`bg-card`（原站點用 `bg-white`）；`placeholder:text-muted-foreground`→`placeholder:text-text-placeholder`；拿掉 `dark:bg-input/30`（品牌色直接寫死，不看 mode）；Textarea `min-h-16`(64px)→`min-h-30`(120px)、`px-2.5 py-2`→`p-3.5`、加 `leading-[1.7]`（一次性行高值，§Track B 合理 one-off）。

**採用點**：

| 檔案:行                            | 前                                                                                                  | 後                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `add-comment-form.tsx`（留言內容） | `<textarea className="… min-h-[120px] … border-[1.5px] border-border-default bg-white …">`          | `<Textarea className="mb-6.5" />`                                                                                               |
| `add-comment-form.tsx`（品牌名稱） | `<input className="h-[38px] … border-[1.5px] border-border-default … text-[13px] font-semibold …">` | `<Input className="bg-transparent text-meta font-semibold placeholder:font-normal" />`（原本無底色，`bg-transparent` 保留這點） |

### #6 TopBar（`src/components/ui/top-bar.tsx`，自建）

A1 標準規格：`sticky top-0 z-10 border-b border-border-subtle bg-secondary px-4.5 pt-5 pb-3.5 shadow-card`，slot 為 `left`/`title`/`right`。額外做的設計決策：

- **`center`（預設 `true`）**：5 處原始 header 中有 4 處把標題絕對置中（`absolute left-1/2 -translate-x-1/2`），只有 `posts/[id]/page.tsx` 是標題緊接在返回鍵右側（`items-center gap-3.5`，非置中）。為了不改變這一頁的既有視覺，**該頁改用 `center={false}`**，其餘 4 頁維持置中（多數行為，也更一致）。
- **z-index／sticky／padding 全部收斂**：`notifications/page.tsx` 原本 `z-20`+`pt-4`（其餘四處 `z-10`+`pt-5`）、`preview/page.tsx` 原本無 `sticky`——全部收斂成 A1 標準值（z-10、sticky、`pt-5 pb-3.5`），符合盤點時就記錄的既定決策。
- **`comments/new/page.tsx` 原本用一個 `<span className="w-5" />` 佔位元素把標題視覺置中**（因為它的 `<h1>` 沒有用 absolute 置中技巧）——TopBar 統一用 absolute 置中後，這個佔位 span 不再需要，直接拿掉。
- **標題文字樣式收斂**：原本 5 處字級不一（`text-lg`／`text-base`／`text-[19px] tracking-[0.5px]`），TopBar 統一用 `text-lg font-bold text-foreground`，`notifications/page.tsx` 的品牌字距因此拿掉（19px→18px、去 letter-spacing，視覺差異極小）。

**採用點**：`posts/[id]/page.tsx`（`center={false}`）、`posts/[id]/comments/page.tsx`、`posts/[id]/comments/new/page.tsx`（拿掉手動置中 spacer）、`posts/new/preview/page.tsx`（原本無 sticky，收斂為 sticky）、`notifications/page.tsx`（z-20→z-10、拿掉自訂字距）。

### #7 BottomBar（`src/components/ui/bottom-bar.tsx`，自建）

只固定結構（`border-t border-border bg-background px-4.5` + `sticky bottom-0` 或 `fixed`），版面（`items-center`/`gap`/`py`）留給呼叫端用 `className` 覆蓋，因為各處版面差異大（icon+pill 一列 vs. 兩顆等寬按鈕）。`fixed` prop 給 `preview/page.tsx` 用（它的內容是自身 scroll container、底欄要固定在 viewport，其餘頁面都是 `sticky` 跟文件捲動）。

**bg 收斂**：`preview/page.tsx` 原本底欄用 `bg-surface-soft`，其餘三處（composer/launcher/add-comment-form）都是 `bg-surface-base`——收斂到多數的 `bg-background`（即 `bg-surface-base`）。

**採用點**：

| 檔案                   | 前                                                                                                  | 後                                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `comment-composer.tsx` | `<footer className="sticky bottom-0 … border-t border-border-default bg-surface-base px-4.5 py-3">` | `<BottomBar className="items-center gap-2.5 py-3">`                                                                                              |
| `comment-launcher.tsx` | `<Link className="sticky bottom-0 … border-t … px-4.5 py-3.5">`（整個可點列本身就是底欄）           | `<BottomBar className="p-0"><Link className="flex flex-1 items-center gap-2.5 px-4.5 py-3.5">`（`footer` landmark 外層 + `Link` 內層，視覺不變） |
| `add-comment-form.tsx` | `<div className="flex … border-t border-border-default bg-surface-base px-4.5 py-4">`               | `<BottomBar className="py-4">`                                                                                                                   |
| `preview/page.tsx`     | `<footer className="fixed bottom-0 … bg-surface-soft px-4.5 py-3.5">`                               | `<BottomBar fixed className="py-3.5">`（`bg-surface-soft`→`bg-background`，見上）；內部兩顆按鈕暫維持 raw class（未套 `Button`，非本輪範圍）     |
| `bottom-nav.tsx`       | `shadow-[0_-4px_12px_rgba(217,154,61,0.08)]`                                                        | `shadow-nav-top`（只換陰影 token，`<nav>` 本身不套 BottomBar，語意不同，維持獨立元件）                                                           |

**驗證**：`tsc --noEmit` 0 errors；`eslint src/app src/components` 0 errors（同一既有 warning，另修掉 2 個新檔案的 import 順序 warning）；`npm run build` ✓ 全站 35 條路由正常產出；`npm run dev` 對 5 個改動頁面（`/`、`/posts/[id]`、`/posts/[id]/comments`、`/posts/[id]/comments/new`、`/notifications`）直接檢查伺服器渲染 HTML，確認 `data-slot="top-bar"/"card"/"bottom-bar"` 與其 className 符合預期（首頁是純 client component，dev server 只回傳 client reference 供瀏覽器端渲染，curl 驗不到 SSR 內容——這是該頁本來的架構特性，非本次改動造成，改以 `tsc`/`build` 的型別檢查作為替代保證）。

### #7.1 TopBar padding 收斂為單一值（驗收後追加）

原本 `top-bar.tsx` 是 `pt-5 pb-3.5`（20px/14px，上下不對稱，收斂自 5 處原始 header 更分歧的 padding），進一步收斂成 `py-5`（上下都 20px）。因為 padding 定義集中在元件本身，5 個呼叫點（`posts/[id]/page.tsx`、`comments/page.tsx`、`comments/new/page.tsx`、`posts/new/preview/page.tsx`、`notifications/page.tsx`）不用逐一改，一行 class 修改即全站生效。視覺影響：header 整體變高約 6px（底部 padding 14→20），已知且可接受。

**驗證**：`tsc --noEmit` 0 errors；`eslint` 0 errors；`npm run build` ✓。

### #7.2 首頁、發表委託表單納入 TopBar；padding 再收斂為 `py-5 px-4`

原本 A1 盤點只列了「返回鍵/關閉鍵 + 標題」這 5 個結構相同的複製 header，首頁（漢堡選單 + 置中 Logo）、`posts/new/page.tsx`（`取消` 文字連結 + 表單標題，且原本是 `<div>` 不是 `<header>`）結構不同，當時判斷不算同一種重複而跳過。這次要求一併納入：

- **`top-bar.tsx` 水平 padding `px-4.5`→`px-4`**：首頁、`posts/new` 原本都是 `px-4`，改動後 7 處全部共用 `py-5 px-4`。
- **首頁**：`<button>` 選單觸發器改由 TopBar 的 `left` slot 承接，拿掉原本 `absolute left-4`（TopBar 有 left/right 內容時標題本來就用絕對置中，不需要 icon 自己 absolute 定位）；標題文字 `text-[19px] tracking-[0.5px]`→統一的 `text-lg font-bold`（同 Phase 3B 已接受的字級收斂）；`z-20`→`z-10`、`border-border-default`→`border-border-subtle`（收斂至 A1 標準）。
- **`posts/new/page.tsx`**：`<div>`→`<header>`（TopBar 本身用 `<header>`），因此**新增了原本沒有的 `sticky`/`border-b`/`shadow-card`**——這是本次唯一結構性視覺變化（原本是純色靜態列，現在會固定在頂端且有陰影）；標題 `text-base font-semibold`→`text-lg font-bold`；右側原本用來平衡「取消」寬度的 `<div className="w-8" />` 空白 spacer 拿掉（TopBar 絕對置中不需要）。

**驗證**：`tsc --noEmit` 0 errors；`eslint` 0 errors；`npm run build` ✓ 全站路由正常產出。

### #7.3 TopBar padding 固定 `py-3`、字體統一 24px

- `top-bar.tsx`：`py-5`→`py-3`（header 變矮）；標題 `text-lg`(18px)→`text-2xl`(24px)。
- 一併統一先前記錄的「TopBar 內僅有的另一種字級」（#7 節提到的 `text-sm` 左側文字連結）：`preview/page.tsx` 的「返回編輯」、`posts/new/page.tsx` 的「取消」都改為 `text-2xl`，讓 TopBar 內文字（icon 除外）全部統一 24px。因為 7 處 header 全部共用同一份 `top-bar.tsx`，只需改元件本身＋這兩個左側連結即可全站生效。

**驗證**：`tsc --noEmit` 0 errors；`eslint` 0 errors；`npm run build` ✓。

### #7.4 TopBar 文字改用 token、行高定為字級的 1.5 倍

- 標題從 stock `text-2xl`(24px) 改用專案 token `text-title`(16px)，跟左側連結「返回編輯」/「取消」統一為 16px。
- 專案的 `text-*` token（`design-tokens.md` 排版章節）只定義 font-size，沒有配對 line-height，預設吃瀏覽器/字型行高（約 1.15–1.2 倍），非刻意值。這次明確要求 1.5 倍，三處文字（`h1` 標題、兩個左側連結）都加上 `leading-6`（16px × 1.5 = 24px）。

**驗證**：`tsc --noEmit` 0 errors；`eslint` 0 errors；`npm run build` ✓。

### #7.5 首頁（含漢堡選單）維持 `py-3`，其餘 6 處改 `py-4`

`top-bar.tsx` 元件本身的 padding 保持 `py-3`（首頁沿用，不特別覆寫），其餘 6 個呼叫點（`posts/[id]/page.tsx`、`posts/[id]/comments/page.tsx`、`posts/[id]/comments/new/page.tsx`、`posts/new/page.tsx`、`posts/new/preview/page.tsx`、`notifications/page.tsx`）逐一加上 `className="py-4"`，靠 `cn`/`twMerge` 覆寫元件預設值——這是 TopBar 系列調整中第一次出現「首頁跟其他頁不同」的分裂，之後若還有頁面差異化需求，同樣走 `className` 覆寫而非改元件預設。

**驗證**：`tsc --noEmit` 0 errors；`eslint` 0 errors；`npm run build` ✓ 全站路由正常產出。

---

## Phase 3C — Dialog / Sheet（`src/components/ui/dialog.tsx`、`sheet.tsx`）

延續 3A.5（修正版）做法：以官方 base-vega registry 原始碼為起點（`https://ui.shadcn.com/r/styles/base-vega/{dialog,sheet}.json`，皆用 `@base-ui/react/dialog` 子路徑，依賴已裝），直接編輯成品牌版；頁面直接 import，不設 `custom/` 邊界。Base UI Dialog/Sheet 免費提供 focus trap／ESC 關閉／scroll-lock／點擊遮罩關閉／`aria-*` 自動綁定，取代原本手寫 `{open ? <div role="dialog" aria-modal onClick=backdrop>...</div> : null}`。

### 使用者決策（4 項，逐項詢問後定案）

1. **遮罩範圍 → 統一只暗手機直欄**。`DialogOverlay`/`SheetOverlay` 的 `fixed inset-0` 改成 `fixed inset-y-0 left-1/2 w-full max-w-md -translate-x-1/2`——這組 class 會自我夾限：`fixed` 元素的 `w-full` 以視窗寬度為基準、`max-w-md` 封頂 28rem，`-translate-x-1/2` 位移量吃的是元素自身寬度，所以窄螢幕（實際手機，多數 <448px）自動等於 `left:0`、寬螢幕（桌機預覽）自動置中成 448px 欄，跟 `RootLayout`（`src/app/layout.tsx`）本身 `w-full max-w-md` 置中欄的算法完全一致，桌機灰底維持不變暗。
   **副作用需額外修正**：側邊選單 `SheetContent` 的官方 `data-[side=left]:left-0` 是相對「視窗」左緣，不是「欄」左緣——遮罩改成只暗欄內後，若面板仍貼視窗左緣，桌機上會跟遮罩脫節（面板在暗區外）。呼叫端（`page.tsx`）加上 `data-[side=left]:left-[max(0px,calc(50%-14rem))]` override：`calc(50%-14rem)` 是欄左緣的位置（50% 視窗寬減半個 28rem 欄寬），但這個算式在窄螢幕會算出負值（面板被裁到螢幕外），所以外面再包一層 `max(0px, …)` 夾住下限，兩種螢幕寬度都能正確貼齊欄的左緣。
2. **Dialog 寬度 → 統一 300px**（`max-w-75` 寫進 `DialogContent` base）。簽到 modal 由 280→300 略變寬。
3. **側邊選單 → 用 Sheet 重寫、保留 260px**（`data-[side=left]:w-65` override 官方的 `w-3/4`）。
4. **標籤選擇器底部 sheet（`@modal/(.)tags`，intercepting route）→ 先不改**。它由 `router.back()` 驅動開關（開關即路由），改成 Base UI Sheet 會動到互動流程/路由架構，本輪完全不碰。

### 官方原始碼 → 品牌版的改動（`dialog.tsx`）

- **移除 `IconPlaceholder` import**（官方 close 按鈕用的 lucide/tabler/… 抽象層，本專案無此路徑且違反「不導入 lucide、保留 inline SVG」）→ 改成檔內 inline `<XIcon>`（`M18 6L6 18M6 6l12 12`）。
- **`DialogOverlay`**：`bg-black/10` → `bg-scrim-modal`（品牌 scrim token，rgba(64,58,50,0.42)，§7-5 收斂，原簽到 0.45 一併收斂）。保留官方 `supports-backdrop-filter:backdrop-blur-xs`（新增輕微背景模糊，原手寫版無）。
- **`DialogContent`**：`ring-1 ring-foreground/10` → `shadow-modal`；寬度固定 `max-w-75`(300px)、拿掉官方 `sm:max-w-md`；圓角 `rounded-xl` → `rounded-2xl`（多數既有 modal 值，簽到原 `rounded-[20px]`→2xl 一併收斂）；拿掉官方 `grid gap-6 p-6` 內距（各 modal 有自己的置中排版，改由呼叫端 className 帶）。`showCloseButton` 預設改為 `false`（多數 modal 無角落 X）。
- **`DialogTitle`**：拿掉官方 `cn-font-heading`（base-vega 專屬字型 class，本專案無）與 base 字級；base 只留 `font-bold text-foreground`，字級由各 modal 自帶（16/14.5/20px 不一，且 `twMerge` 無法對本專案自訂 `text-*` token 去重，base 不可寫死字級）。
- **`DialogFooter`**：官方是「手機 `flex-col-reverse`／桌機 `sm:justify-end`」；改寫成本專案的等寬雙鈕橫排 `flex w-full items-center gap-2.5`（鈕各自帶 `flex-1`）。這是唯一真正重複（3 個 modal）的複合子結構才抽成元件；按鈕本身因 variant/文案各異，維持呼叫端 raw `<Button>`，不另包 `ModalCancelButton`/`ModalActionButton`（推翻規劃檔當初的暫定命名，理由：那些按鈕不是「同一顆重複」，只有「排版列」重複）。
- **`data-open:animate-in`/`zoom-in-95` 等動畫 class 照官方保留但目前失效**（未裝 `tw-animate-css`）：modal 直接出現/消失、無進退場動畫——與被取代的手寫版行為一致，零回歸。若日後要動畫再裝該套件即可生效。

### `sheet.tsx`（側欄 drawer，官方 Sheet = 同一 Dialog primitive 的側板變體）

- 同樣移除 `IconPlaceholder` → inline `<XIcon>`；`SheetOverlay` `bg-black/10` → `bg-scrim-modal`。
- `SheetContent` 官方側板 class（含 `data-[side=*]` 四方向變體）大致原樣保留；側邊選單呼叫端用 `data-[side=left]:w-65`(260px) override 官方 `w-3/4`、`bg-secondary` override `bg-popover`、`gap-0` override `gap-4`、自訂右向陰影 `shadow-[4px_0_20px_rgba(64,58,50,0.18)]` override `shadow-lg`（此為 §B2 標記的 drawer 專屬水平陰影，無對應 token 且方向獨特，維持為 §8 一次性值）。官方 `data-[side=left]:border-r` 的 1px 右緣 hairline 予以保留（原版無，差異極微）。

### 採用點

| 檔案:位置                                | 前                                                 | 後                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add-comment-form.tsx`（刪除圖片 modal） | 手寫 `fixed inset-0` 遮罩 + `role=dialog` 面板     | `<Dialog open={deleteTarget!==null} onOpenChange>` + `<DialogContent>`；icon 圈 `bg-[#FBE8E4] text-[#C0564B]`→`bg-destructive-bg text-destructive`；標題/描述改 `DialogTitle`/`DialogDescription`；footer 改 `DialogFooter`（鈕本來就已是 `<Button>`）                                                                                    |
| `page.tsx`（簽到 modal）                 | 手寫遮罩 + 面板，角落 ✕（`ml-auto` 佔一列）        | `<Dialog open={checkinOpen} onOpenChange>` + `<DialogContent showCloseButton>`（✕ 改為官方 `absolute top-4 right-4` 浮動角落鈕，內容因此略上移）；`bg-brand-primary`→`bg-primary`、`border-accent-amber`→`border-gold`、`text-accent-amber`→`text-gold`、寬 280→300                                                                       |
| `page.tsx`（側邊選單 drawer）            | 手寫 `left-1/2 max-w-md` 遮罩 + 左側 260px 抽屜    | `<Sheet open={menuOpen} onOpenChange>` + `<SheetContent side="left">`；標題改 `SheetTitle`、關閉鈕改 `SheetClose`、群組分隔線 `border-t` div → `<Separator>`；保留 260px/`bg-secondary`/右向陰影（見上）                                                                                                                                  |
| `comment-board.tsx`（給積分 modal）      | 手寫遮罩 + 面板，footer 取消/確認為 raw `<button>` | `<Dialog open onOpenChange>` + `<DialogContent>`；取消/確認改 `<Button variant="secondary"/"primary" size="md">`（Phase 3A 曾標「留待 Dialog 階段」的按鈕，此處補上）；icon 圈 `bg-[#FCEFDA] text-accent-amber`→`bg-gold-soft text-gold`；**給積分金額的分段選擇器（3 顆）維持 raw 不動**（屬 A6 分段控制，非 Dialog footer，非本輪範圍） |
| `comment-board.tsx`（積分不足 modal）    | 手寫遮罩 + 面板                                    | `<Dialog open onOpenChange>` + `<DialogContent>`；icon 圈 `bg-[rgba(196,62,50,0.1)] text-[#C43E32]`→`bg-destructive/10 text-destructive`；取消改 `<Button variant="secondary">`、前往儲值（Link）改 `cn(buttonVariants({ variant:'goldDark', size:'md' }))`                                                                               |

給積分/積分不足兩個 modal 維持「父層條件掛載 + `<Dialog open>` 恆真、關閉時由 `onOpenChange(false)` 呼叫既有 `onClose` 讓父層卸載」的最小改動寫法（不動父層的 `pointsTarget`/`insufficient` 狀態機）。

### 明確未納入（維持現狀）

- **標籤選擇器底部 sheet**（`@modal/(.)tags`，intercepting route）：使用者決定不改。
- **各頁 dropdown 的 `fixed inset-0` 點擊外關閉層**（篩選/類型/積分下拉）：非 modal，屬未來 `Select`/`Popover` primitive。
- **給積分金額分段選擇器**：屬 A6 分段控制，另行處理。

### 驗證

- `tsc --noEmit` 0 errors；`eslint src/app src/components` 0 errors（僅一個既有 `prefer-destructuring` warning，與本次無關；新檔 import 順序 warning 已 `--fix`）；`npm run build` ✓ 全站 35 條路由正常產出。
- `npm run dev` 對首頁／貼文詳情／全部留言／新增留言各頁 curl 檢查伺服器渲染，皆 200、無 unhandled/hydration 錯誤標記；Base UI Dialog `Root` 在關閉狀態不渲染 DOM 元素，初始 SSR 不含 popup、無例外。
- **未實測項（環境限制，據實記錄）**：focus trap／ESC 關閉／scroll-lock／點擊遮罩關閉／進場焦點移轉這些互動行為由 Base UI 提供，需真實瀏覽器點開 modal 才能驗證；本環境無法驅動瀏覽器，尚未逐項手動確認。建議 review 時於瀏覽器實際開關這 5 個 modal/drawer 各一次覆核。

### Phase 3C 驗收後追加 — 安裝 `tw-animate-css`

`ui/dialog.tsx`/`sheet.tsx` 保留的官方 `data-open:animate-in`/`zoom-in-95`/`data-closed:fade-out-0` 等 class 原本因未裝這個套件而失效（modal/drawer 直接出現/消失）。安裝並在 `globals.css` 補一行 `@import 'tw-animate-css';`（緊接在 `shadcn/tailwind.css` 之後）後，這些 class 開始生效——modal/drawer 現在有淡入+縮放（Dialog）/滑入（Sheet）的進退場動畫。

純 CSS keyframes/utility 套件，不含元件邏輯，不影響 Base UI 的 focus trap/ESC/scroll-lock，不含任何顏色/主題 token（跟 `shadcn/tailwind.css` 同一類依賴）。

**驗證**：`tsc`/`eslint` 0 errors（`globals.css` 非 eslint 掃描範圍，屬正常）；`npm run build` ✓；編譯後 CSS 確認 `@keyframes enter`/`exit`、`fade-in-0`/`zoom-in-95` utility 皆正確產出，`--primary:#f6d978` 等品牌色未被覆蓋。

### Phase 3C 驗收後追加 — Sheet 右邊界顏色修正

側邊選單抽屜（`Sheet`）的右邊界看起來偏黑：`ui/sheet.tsx` 的 `data-[side=left]:border-r` 是官方原始碼原樣保留的一行，**沒指定顏色**，Tailwind v4 邊框預設吃 `currentColor`，而 `SheetContent` 文字色是 `text-popover-foreground`(`#403a32`，深棕近黑)，邊框因此跟著繼承成近黑色。加上 `data-[side=left]:border-border`（品牌邊框 token，`#e5ddbf`）明確指定顏色，改成跟其他元件一致的淺色邊框。

**驗證**：`tsc`/`eslint` 0 errors；`npm run build` ✓。

---

## Phase 3D — Track B 處置對照表（重新掃描，取代規劃檔內的舊清單）

切回 `refactor/apply-design-tokens` 後重跑全域掃描（`src/app` + `src/components`），非元件層殘留共 202 行、176 個 magic-number（`-[Npx]`）token。**本節只列處置決策，尚未執行取代**——這是 Phase 3D 開工前的規格，等使用者確認範圍再動手。

### B1 — 對得到既有 token，直接替換（依出現次數排序）

| 現值                    | 次數 | → utility                                         |
| ----------------------- | ---- | ------------------------------------------------- |
| `#9A9080`               | 24   | `text-text-tertiary`                              |
| `#D64545`               | 20   | `text-destructive`/`border-destructive`           |
| `#B8AF9E`               | 14   | `text-text-placeholder`                           |
| `#FDF0EE`               | 8    | `bg-destructive-bg`                               |
| `#FDF7E9`               | 7    | `bg-muted`                                        |
| `#E5DDBF`               | 6    | `border-border`                                   |
| `rgba(217,154,61,0.08)` | 5    | `shadow-card`                                     |
| `rgba(217,154,61,0.14)` | 4    | `shadow-cta`                                      |
| `rgba(217,154,61,0.18)` | 3    | `shadow-cta-strong`                               |
| `rgba(64,58,50,0.16)`   | 1    | `shadow-dropdown`                                 |
| `rgba(64,58,50,0.14)`   | 1    | `shadow-float`                                    |
| `#FCEFDA`               | 1    | `bg-gold-soft`                                    |
| `#D9CFA9`               | 1    | `border-border-dashed`                            |
| `#835500`               | 1    | `bg-gold-dark`                                    |
| `#EFE7CE`               | 1    | `border-border-subtle`（跟 `#F0E4C0` 極近，收斂） |

### B2 — 自創值，需決策（沿用既定原則：優先收斂到最近 token，理由不足才保留一次性）

| 現值                                                                                      | 位置                                                     | 決策                                                                                     |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `rgba(217,154,61,0.12)` ×5                                                                | 下拉/篩選面板陰影                                        | 收斂 `shadow-card`（沿用先前決策，不新增 `--shadow-panel`）                              |
| `rgba(131,85,0,0.3)` ×1                                                                   | `empty-notifications.tsx` 搜尋徽章                       | 收斂 `shadow-gold-dark`(`.24`)                                                           |
| `#FCEFCB` ×1                                                                              | 分類下拉選中態                                           | 收斂 `bg-gold-soft`（跟 `#FCEFDA` 幾乎同色，判定為手誤）                                 |
| `#F5EEDA` ×1                                                                              | `add-comment-form.tsx` ghost 按鈕 hover                  | 收斂 `hover:bg-accent`（沿用先前決策）                                                   |
| `#5A5248` ×1                                                                              | `add-comment-form.tsx` 新增圖片按鈕文字                  | 收斂 `text-foreground`（沿用先前決策）                                                   |
| `rgba(64,58,50,0.18)` ×1                                                                  | `page.tsx` 側邊選單陰影                                  | **保留一次性**——方向獨特（水平投影），已是 `Sheet` 呼叫端的 className override，非重複值 |
| `#EAE2CB` ×1                                                                              | `comment-board.tsx` 圖片佔位底色                         | **保留一次性**——圖片佔位色塊，非 UI chrome                                               |
| `rgba(64,58,50,0.55)` ×1                                                                  | `comment-board.tsx` 圖片標籤浮層底                       | **保留一次性**——圖片浮層，同上理由                                                       |
| `#D9D2C0` ×1                                                                              | `posts/[id]/page.tsx` 身形照片佔位                       | **保留一次性**——同上理由                                                                 |
| `#F3E8C8` ×1                                                                              | `empty-notifications.tsx` 插圖底                         | **保留一次性**（§8 插圖白名單，沿用先前決策）                                            |
| `#e9c89a`/`#deb985`/`#d9cdb8`/`#cbbe9f`/`#d7a55f`/`#7e8a5f`/`#4a5a6b`/`#3f3b37`/`#8a7f6e` | `page.tsx` trending/feed 卡片 mock 照片漸層與色塊        | **保留一次性**——這些代表「假照片」內容資料，不是介面色，§8 白名單                        |
| `#FBBC05`/`#EA4335`/`#4285F4`/`#34A853`                                                   | `auth/icons.tsx` GoogleIcon                              | **保留，永久白名單**——Google 官方品牌識別色，禁止 tokenize                               |
| `#FFFDF7` ×2                                                                              | 待查（疑似圖示 fill，需個別確認是否等於 `--background`） | 逐一核對後決定                                                                           |

### B3 — 魔法數字（176 個 `-[Npx]` 形式，Tailwind v4 原生 fraction 一律零視覺置換）

| 形式                                   | 次數 |
| -------------------------------------- | ---- |
| `text-[Npx]`                           | 87   |
| `h-[Npx]`                              | 22   |
| `w-[Npx]`                              | 19   |
| `mb-[Npx]`                             | 13   |
| `border-[Npx]`                         | 11   |
| `gap-[Npx]`                            | 10   |
| `rounded-[Npx]`                        | 7    |
| 其餘（`tracking`/`py`/`px`/`mt`/`ml`） | 7    |

`text-[Npx]` 佔比最高（87／176），多數是先前規劃裡就記錄過的字級 token（`text-caption/meta/body/name/title/heading/display`）尚未套用到的頁面層級文字，換算規則已在 `design-tokens.md` §5 定義，屬機械式取代。`border-[Npx]` 11 處主要是 Phase 3B 已收斂過 `ui/` 元件內部的殘留，页面層級仍有 `border-[1.5px]` 等待收斂成單一 `border`。

### Phase 3D 執行結果

用 `perl -pi -e` 對 `src/app` 做批次字面取代（每條規則對應處置表的一行，非 regex 猜測，全部是精確比對）：

- **B1（15 種值，~92 處）**：全部替換為對應 token（`text-text-tertiary`/`text-destructive`/`text-text-placeholder`/`bg-destructive-bg`/`bg-muted`/`bg-border`/`border-border`/`border-destructive`/`bg-gold-dark`/`bg-gold-soft`/`border-border-dashed`/`border-border-subtle`/`shadow-card`/`shadow-cta`/`shadow-cta-strong`/`shadow-dropdown`/`shadow-float`）。
- **B2 收斂項**：`rgba(217,154,61,0.12)`×5→`shadow-card`、`rgba(131,85,0,0.3)`→`shadow-gold-dark`、`#FCEFCB`→`bg-gold-soft`、`#F5EEDA`→`hover:bg-accent`、`#5A5248`→`text-foreground`；另外 `comment-board.tsx` 的 `fill="#FFFDF7"`(×2，SVG 屬性非 class) 順手改成 `fill="var(--background)"`，跟 `--background` token 掛勾。
- **B2 保留項**（如處置表所列）：一律未動，跟表格一致——mock 照片色/漸層、GoogleIcon 品牌色、圖片佔位色（`#EAE2CB`/`#D9D2C0`/`rgba(64,58,50,0.55)`）、插圖底（`#F3E8C8`）、側邊選單 drawer 陰影（`rgba(64,58,50,0.18)`）。
- **B3（176 個 `-[Npx]`）**：`h`/`w`/`mb`/`gap`/`py`/`px`/`mt`/`ml` 共 34 種精確值換算成 Tailwind v4 原生 fraction（如 `h-[38px]`→`h-9.5`、`w-[114px]`→`w-28.5`）；`text-[13/12/14/15/20px]` 這 5 種**剛好等於**現有字級 token 的值換成 token 名稱；`border-[1.5px]`（10 處）收斂成 `border`；`rounded-[12px]`（2 處）換成 `rounded-card`（跟 `--radius-card` 精確相等）。**沒有精確對應的值一律保留原樣不猜**（`text-[11/12.5/13.5/14.5/15.5/19/22/9/10/10.5px]`、`rounded-[3px]`/`[10px]`、`border-[3px]`、`tracking-[0.5px]`、`leading-[…]`），因為這些是自創小數值，收斂目標不明確，貿然歸類到最近 token 風險比保留高。

**驗證**：`tsc --noEmit` 0 errors；`eslint src/app` 0 errors（同一既有 `prefer-destructuring` warning）；`npm run build` ✓ 全站路由正常產出。全域殘留計數從 202 降到 61，剩下的 61 筆逐一核對，全部落在處置表標記「保留」的項目，沒有漏網的可收斂值。

**尚未處理（刻意，非本輪範圍）**：15 處 `text-[11px]` 等自創字級小數值——數量夠多（尤其 `text-[11px]` 15 處）值得評估是否該提案新增 token，但這是「要不要擴充 design token 規模」的決策，不屬於「收斂到既有值」的機械執行，留給使用者決定是否要開一輪新 token 提案。
