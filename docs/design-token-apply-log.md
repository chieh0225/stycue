# 設計 Token / 元件套用紀錄（apply log）

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
