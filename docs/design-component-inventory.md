# 設計元件盤點與非元件 class 稽核（Component Inventory + Class Audit）

> 分支：`refactor/apply-design-tokens`
> 依據 token 來源：[`src/app/globals.css`](../src/app/globals.css)；對照文件：[`docs/design-tokens.md`](./design-tokens.md)（§4 legacy alias、§5 寫死值→token、§6 元件範式、§7 收斂決策、§8 不 tokenize）。
>
> **用途**：這份盤點是後續「shadcn 元件採用/客製」與「非元件 class 收斂」的規格來源。
> **本階段只盤點、不改任何頁面程式碼。**
>
> 為什麼分兩軌：元件化只能解決「元件形狀」的重複（button/card/dialog/chip…）；**剩下不會被元件化的頁面/版面層級 class 仍大量存在**，且含兩位前端各自寫出的兩種問題——(a) `design-tokens.md` 沒定義的自創值、(b) 魔法數字。兩者處置方式不同，故分開盤。

---

# Track A — 元件盤點（→ shadcn 採用/客製規格）

每個元件記錄：**出現位置 → 現有 variant 漂移 → 收斂後標準 token 規格（§6）→ 對應 shadcn primitive + 客製 variant**。

## A1. TopBar / 頂部 sticky header　⚠️高漂移

同一種返回列在 5 個檔案複製，六個維度各自漂移：

| 檔案                                  | sticky / z    | 對齊                   | border                  | padding              |
| ------------------------------------- | ------------- | ---------------------- | ----------------------- | -------------------- |
| `posts/[id]/page.tsx:108`             | `sticky z-10` | `items-center gap-3.5` | `border-border-default` | `px-4.5 pt-5 pb-3.5` |
| `posts/[id]/comments/page.tsx:112`    | `sticky z-10` | `items-center gap-3.5` | `border-border-default` | `px-4.5 pt-5 pb-3.5` |
| `posts/[id]/comments/new/page.tsx:40` | `sticky z-10` | `justify-between`      | `border-border-default` | `px-4.5 pt-5 pb-3.5` |
| `posts/new/preview/page.tsx:127`      | **無 sticky** | `justify-between`      | `border-border-default` | `px-4.5 py-4`        |
| `notifications/page.tsx:12`           | `sticky z-20` | `justify-center`       | **`border-[#F0E4C0]`**  | `px-4.5 pt-4 pb-3.5` |

- 共同底：`border-b bg-surface-soft shadow-[0_4px_12px_rgba(217,154,61,0.08)]`。
- **標準規格**：`sticky top-0 z-10 flex items-center border-b border-border-subtle bg-secondary px-4.5 pt-5 pb-3.5 shadow-card`；靠 slot（left/center/right）處理 back / title / actions 三種對齊。（`notifications` 的 `border-[#F0E4C0]` 收斂為 `border-border-subtle`，z 收斂 z-10。）
- **shadcn**：無對應標配 → **自建 `TopBar`**（`components/ui/top-bar`），props：`left`/`title`/`right`。

## A2. Card

| variant                | 位置                       | 現況                                                           | 收斂                                             |
| ---------------------- | -------------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| feed post card         | `page.tsx:373`             | `rounded-[18px] border-border-default bg-white shadow-[…0.08]` | `rounded-card bg-card border-border shadow-card` |
| trending card          | `page.tsx:246`             | `rounded-[16px] bg-white shadow-[…0.08]`                       | `rounded-card bg-card shadow-card`               |
| info panel（委託條件） | `posts/[id]/page.tsx:182`  | `rounded-[14px] border-border-default bg-[#FDF7E9]`            | `rounded-panel border-border bg-muted`           |
| image card（附加圖片） | `add-comment-form.tsx:308` | `rounded-xl border-[1.5px] border-border-default`              | Card + `border` 寬度收斂                         |

- **卡片圓角三種（16/18/14）→ 收斂 `rounded-card`(12) / `rounded-panel`(14)**；`bg-white`→`bg-card`。
- **shadcn `Card`**，variant：`post` / `trending` / `info`。

## A3. Chip / Tag / Badge　⚠️高漂移

| 用途                        | 位置                                     | 現況                                                          | 收斂（§6）                                 |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| gold 分類 chip              | `posts/[id]/page.tsx:120`、`preview:143` | `rounded-md bg-[#FCEFDA] px-[9px] py-[3px] text-accent-amber` | `bg-gold-soft text-gold-deep`（§6 金標籤） |
| gold chip（feed tag/badge） | `page.tsx:391,398`                       | `rounded-full bg-surface-soft text-accent-amber`              | 併入 gold badge variant                    |
| 最佳留言 badge              | `comment-board.tsx:618`                  | `rounded-full bg-[#FCEFDA] text-accent-amber`                 | gold badge variant                         |
| blue「委託人」              | `comment-board.tsx:383`                  | `bg-[#E7EDFA] text-[#5B7FBE]`                                 | `bg-tag-blue-bg text-tag-blue`             |
| green 樓層                  | `comment-board.tsx:624`                  | `bg-[rgba(169,184,142,0.15)] text-[#4E6B45]`                  | `bg-tag-green-bg text-tag-green`           |
| 穿搭標籤 pill               | `posts/[id]/page.tsx:173`                | `rounded-full border-border-default bg-[#FDF7E9]`             | neutral chip variant                       |
| filter chip                 | `page.tsx:296`                           | `rounded-full border-border-default bg-white shadow-[…]`      | outline chip variant                       |

- **shadcn `Badge`**，variant：`gold` / `blue` / `green` / `neutral` / `outline`；padding 統一（見 Track B 的 `px-[9px]`/`px-[7px]` 收斂）。

## A4. Button / CTA

| variant             | 位置                                                                                     | 現況                                                                                        | 收斂（§6）                                                 |
| ------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 主 CTA              | `comment-composer.tsx:113`、`add-comment-form.tsx:415`、`page.tsx:533`、`posts/[id]:139` | `bg-brand-primary text-text-primary shadow-[…0.14/0.18]`，高度 `h-9`/`h-13`/`h-[46px]` 混用 | `bg-primary text-primary-foreground shadow-cta`；size 收斂 |
| 次要 outline        | `add-comment-form.tsx:407,448`                                                           | `border-[1.5px] border-border-default`                                                      | `border border-border`                                     |
| gold-dark 強調      | `comment-board.tsx:571`、`empty-notifications.tsx:50`                                    | `bg-[#835500] text-white shadow-[…131,85,0,…]`                                              | `bg-gold-dark shadow-gold-dark`                            |
| destructive（刪除） | `add-comment-form.tsx:455`                                                               | `bg-[#C0564B] shadow-[…192,86,75,0.28] hover:bg-[#AB4B41]`                                  | `bg-destructive text-white`（§7-1 收斂）                   |
| FAB（發表）         | `bottom-nav.tsx:126`                                                                     | `bg-brand-primary shadow-[…0.18]`                                                           | primary + size                                             |

- **CTA 高度三種（h-9/h-13/h-[46px]）→ 收斂**（見 Track B B3）。
- **shadcn `Button`**，variant：`primary` / `secondary` / `gold-dark` / `destructive`；size：`sm`/`md`/`lg`。

## A5. Dialog（置中 modal）／Sheet／Drawer　⚠️高漂移

| 位置                          | 寬              | 圓角             | 遮罩                       | 陰影                                      |
| ----------------------------- | --------------- | ---------------- | -------------------------- | ----------------------------------------- |
| `comment-board.tsx:449,537`   | `max-w-[300px]` | `rounded-2xl`    | `bg-[rgba(64,58,50,0.42)]` | `shadow-[…0.28]`                          |
| `add-comment-form.tsx:429`    | `max-w-[300px]` | `rounded-2xl`    | `bg-[rgba(64,58,50,0.42)]` | `shadow-[…0.28]`                          |
| `page.tsx:513`（簽到）        | `w-[280px]`     | `rounded-[20px]` | `bg-[rgba(64,58,50,0.45)]` | `shadow-[…0.28]`                          |
| `page.tsx:469`（側欄 drawer） | `w-[260px]`     | —                | `bg-[rgba(64,58,50,0.42)]` | `shadow-[4px_0_20px_rgba(64,58,50,0.18)]` |

- **標準規格**：面板 `bg-popover shadow-modal`；置中 modal `rounded-2xl`，寬度收斂單一值（多數 300）；遮罩 `bg-scrim-modal`（`0.45`→§7-5 收斂 `0.42`）。
- **shadcn `Dialog`**（置中）+ **`Sheet`**（側欄 drawer / 底部 sheet）。drawer 陰影 `rgba(64,58,50,0.18)` 見 Track B B2。

## A6. Form field

| 元件                 | 位置                                                          | 現況                                                                                              | 收斂（§6）                                                 |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| pill 輸入列          | `comment-composer.tsx:83`、`comment-board.tsx`(ReplyComposer) | `rounded-full border-border-default bg-[#FDF7E9]`；高度 `h-10`/`h-9`                              | `bg-muted border-input`，高度收斂                          |
| textarea             | `add-comment-form.tsx:267`                                    | `border-[1.5px] border-border-default bg-white`                                                   | `Textarea` + `border` 收斂                                 |
| text input（品牌）   | `add-comment-form.tsx:387`                                    | `border-[1.5px] border-border-default`                                                            | `Input`                                                    |
| 分類下拉             | `add-comment-form.tsx:334`                                    | `border-[1.5px] border-border-default bg-[#FDF7E9]`                                               | `Select`（或自訂）                                         |
| 分段選擇器（給積分） | `comment-board.tsx:480`                                       | 未選 `border-[1.5px] border-[#E5DDBF] bg-[#FDF7E9]`／選中 `border-brand-primary bg-brand-primary` | §6 分段範式（`border-input`／`border-primary bg-primary`） |
| error state          | `login`/`register`                                            | `border-[1.5px] border-[#D64545] bg-[#FDF0EE]`                                                    | `border-destructive bg-destructive-bg text-destructive`    |

- **border 寬度 `border-[1.5px]` vs `border` 漂移 → 統一**（見 Track B B3）。
- **shadcn `Input` / `Textarea` / `Select`**（+ error variant）。

## A7. BottomNav / 各頁固定底欄

- 共用 `bottom-nav.tsx`（已算乾淨，唯 `shadow-[0_-4px_12px_rgba(217,154,61,0.08)]`→`shadow-nav-top`）。
- 但 post detail / comments / comments-new / preview 各自另做**固定底欄**（`CommentLauncher`、`CommentComposer`、`add-comment-form` 底部 action bar、preview 底欄）——`bottom-nav.tsx:103 hidesBottomNav()` 列出這些路由。
- **決策**：底欄樣式（`border-t bg-surface-base px-4.5 py-*`）可抽為 `BottomBar` 容器，內容各頁自填。

## A8. 其他小元件

- **Avatar**：`bg-text-primary text-surface-base rounded-full` 圓形頭像，尺寸多種（h-9 / h-[38px] / h-[34px] / h-[30px]）。→ `Avatar`（size prop）。
- **Rank badge**（人氣排名）：`page.tsx:251` `bg-text-primary`/`bg-support-sage` + `rounded-md`。
- **Divider**：`h-px bg-border-default`（多處）、`bg-[#E0D4AA]`（comment-board）、`bg-[#EFE7CE]`（modal）→ 全部 `bg-border`。
- **Empty / Skeleton**：`empty-notifications.tsx` 全寫死（skeleton bar `bg-[#E5DDBF]`、backdrop `bg-[#F3E8C8]`、badge `bg-[#835500]`）→ 見 Track B。

---

# Track B — 非元件 class 稽核（→ 對不到 token 的值的處置）

掃描指令：

```powershell
rg "#[0-9A-Fa-f]{6}|rgba?\(|bg-\[|text-\[|border-\[|rounded-\[|shadow-\[|-\[[0-9]" src/app
```

## B1. 對得到既有 token（標準替換，依 §4/§5）——多數落這類

寫死 hex / rgba 幾乎都已在 `design-tokens.md` §5 有對照，套用時直接換即可。高頻代表：

| 現值（出現次數）                                                                                                   | → utility                                                                      |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `#9A9080` (25)                                                                                                     | `text-text-tertiary`                                                           |
| `#D64545` (22)                                                                                                     | `text-destructive` / `border-destructive`                                      |
| `#B8AF9E` (17)                                                                                                     | `text-text-placeholder`                                                        |
| `#FDF7E9` (11)                                                                                                     | `bg-muted`                                                                     |
| `#E5DDBF` (11)                                                                                                     | `border-border`                                                                |
| `#FDF0EE` (9)                                                                                                      | `bg-destructive-bg`                                                            |
| `#FCEFDA`/`#FCEFCB` (7)                                                                                            | `bg-gold-soft` / `bg-accent`                                                   |
| `#403A32` (5)                                                                                                      | `text-foreground`                                                              |
| `#EFE7CE`/`#E0D4AA`/`#D9CDB8`                                                                                      | `border-border`（§7-3）                                                        |
| `#C0564B`/`#C43E32`/`#AB4B41`                                                                                      | `text-destructive`（§7-1 收斂）                                                |
| `#5B7FBE`/`#E7EDFA`、`#4E6B45`/`#5C6E45`/`#EAF0E1`                                                                 | tag-blue / tag-green                                                           |
| legacy alias（`surface-soft`/`surface-base`/`brand-primary`/`accent-amber`/`text-text-*`/`border-border-default`） | §4 shadcn 名                                                                   |
| 陰影 `rgba(217,154,61,0.08/0.14/0.18)`、`rgba(64,58,50,0.28/0.16)`、`rgba(131,85,0,0.24)`、`rgba(113,92,1,0.14)`   | `shadow-card`/`-cta`/`-cta-strong`/`-modal`/`-dropdown`/`-gold-dark`/`-device` |

> 附註：陰影 rgba 有「含空格 vs 不含空格」兩種寫法（如 `rgba(217, 154, 61, 0.08)`）——同值不同拼法，一律換成 token 即消除。

## B2. `design-tokens.md` 沒定義的自創值（需決策）　★重點

這些是兩位前端各自發明、對不到任何 token 的值：

| 現值                                            | 位置                                                                  | 研判                                                                      | 建議處置                                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `#5A5248`                                       | `add-comment-form.tsx:288`（新增圖片按鈕文字）                        | 介於 `foreground #403a32` 與 `muted-fg #756c60` 的自創深灰                | **收斂 `text-foreground`**（或 `text-muted-foreground`）                                      |
| `#F5EEDA` ×2                                    | `add-comment-form.tsx:326,448`（ghost/outline 按鈕 `hover:`）         | 自創 hover 米黃底                                                         | **收斂 `hover:bg-accent`**（gold-tint 懸停，§2 accent 用途）                                  |
| `#F3E8C8` ×1                                    | `empty-notifications.tsx:31`（插圖 backdrop 圓）                      | 插圖底色                                                                  | **當區域值保留**（§8 插圖）或 `bg-secondary`                                                  |
| `shadow rgba(217,154,61,0.12)` ×5               | `page.tsx:313`（filter 下拉）、`posts/new:131,356`、`preview:160,373` | 金調陰影，落在 `shadow-card(.08)` 與 `shadow-cta(.14)` 之間，無對應 token | **決策**：收斂 `shadow-card`（建議，下拉/面板用）；若堅持保留此階 → 提案新增 `--shadow-panel` |
| `shadow rgba(64,58,50,0.18)`（`4px_0_20px`） ×1 | `page.tsx:473`（側欄 drawer）                                         | 水平投影 drawer 陰影，無對應 token                                        | **決策**：改用 `Sheet` 後由元件統一；或提案 `--shadow-drawer`                                 |
| `shadow rgba(192,86,75,0.28)` ×1                | `add-comment-form.tsx:455`（刪除 CTA）                                | destructive 色投影，無對應 token                                          | 隨 §7-1 收斂 destructive 後 → **改用 `shadow-cta` 或去除**（destructive 不另立陰影）          |
| `shadow rgba(131,85,0,0.3)` ×1                  | `empty-notifications.tsx:50`（搜尋徽章）                              | gold-dark 陰影變體（token 為 `.24`）                                      | **收斂 `shadow-gold-dark`**                                                                   |

**建議新增 token 清單（本輪只提案，不改 `globals.css`）**：

- （可選）`--shadow-panel: 0 4px 12px rgba(217,154,61,0.12)` — 若下拉/面板要與 card 陰影區隔（出現 5 次，是唯一有規模的 gap）。**預設建議：不新增，收斂到 `shadow-card`。**
- 其餘自創值皆可收斂到既有 token，**不需新增**。

## B3. 魔法數字（間距 / 尺寸）

**關鍵前提**：本專案是 **Tailwind v4**，spacing scale 由 `--spacing` 動態衍生，`px-4.5`（=18px）、`h-13`（=52px）**原生就有效，不需 `[...]` 括號**。所以問題主要是「同一個值兩種拼法」：

| 問題                                   | 例                                                                                                                                                        | 處置                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 括號拼法 vs 原生 fraction（同值）      | `mb-[18px]`↔`mb-4.5`、`px-[9px]`↔`px-2.25`、`py-[3px]`↔`py-0.75`、`mt-[3px]`↔`mt-0.75`、`ml-[46px]`↔`ml-11.5`、`pt-[26px]`↔`pt-6.5`、`px-[22px]`↔`px-5.5` | **一律改原生 fraction 形**（零視覺變化，消除雙拼法） |
| 括號尺寸 → 原生 fraction（同值）       | `h-[38px]`→`h-9.5`、`h-[34px]`→`h-8.5`、`h-[46px]`→`h-11.5`、`h-[30px]`→`h-7.5`、`h-[52px]`→`h-13`、`w-[300px]`→`w-75`、`h-[18px]`→`h-4.5`                | **改原生 fraction 形**（零視覺變化）                 |
| 反覆出現、語意相同但值不一（CTA 高度） | `h-9`(36)／`h-13`(52)／`h-[46px]`(46)                                                                                                                     | **收斂單一值**，記入 A4 Button size                  |
| 反覆出現（border 寬度）                | `border-[1.5px]` vs `border`(1px)                                                                                                                         | **收斂單一寬度**，記入 A6 Form field                 |
| 合理 one-off（保留）                   | image cell `h-[114px]`/`h-[96px]`、trending 卡 `w-[172px]`、modal `w-[300px]/[280px]/[260px]`、icon 尺寸                                                  | 保留（元件內部尺寸；modal 寬併入 A5 收斂）           |

> 結論：Track B 的間距/尺寸**幾乎零視覺風險**——多數只是把 `-[Npx]` 改成 Tailwind v4 原生 fraction，順手統一雙拼法；真正要「收斂到單值」的只有 CTA 高度與 border 寬度兩項，且已歸入 Track A 元件規格。

---

# 執行建議（供下一步規劃）

1. **先驗證 shadcn**（Step 2）：本專案為改版 Next 16 + Tailwind v4 CSS-first（無 `tailwind.config`/`components.json`），需實測 `shadcn init` 能否接上現有 `@theme inline` token；先讀 `node_modules/next/dist/docs/`。
2. **元件採用順序**（Step 3）：低風險葉節點先行 → `Badge`(A3) → `Button`(A4) → `Avatar`/`Divider`(A8) → `Card`(A2) → `Input`/`Textarea`(A6) → `Dialog`/`Sheet`(A5) → 自建 `TopBar`(A1)、`BottomBar`(A7)。
3. **Track B 併行清理**：B1 隨元件採用一起換；B2 依上表決策（預設全收斂、不新增 token）；B3 做一次性 `-[Npx]`→原生 fraction 正規化。
4. 若採納任何「建議新增 token」→ 先改 `globals.css` + `design-tokens.md`，再套頁面。
5. 每採用一個元件/一頁，於 `docs/design-token-apply-log.md` 追加對照（該檔待 Step 3 重建）。
