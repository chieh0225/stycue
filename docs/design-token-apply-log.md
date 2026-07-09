# 設計 Token / 元件套用紀錄（apply log）

> 分支：`refactor/apply-design-tokens`
> 規格來源：[`docs/design-component-inventory.md`](./design-component-inventory.md)、[`docs/design-tokens.md`](./design-tokens.md)。
>
> **用途**：Step 3 每採用一個元件/一頁，就在此追加前→後對照，集中留痕。
> **原則**：以 shadcn 元件（`src/components/ui/*`）取代 inline 寫法，variant 用現有 token；偏移值收斂到最近標準級距；不改互動流程/資訊架構/layout。

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
**Commit（建議）**：`feat(ui): adopt Avatar and Divider primitives`
