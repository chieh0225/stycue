# StyCue 設計 Token 對照表

> 單一真相來源：[`src/app/globals.css`](../src/app/globals.css)。
> 本文件說明 token 架構、**寫死值 → token 對照**、元件狀態範本與收斂決策，
> 供各頁套用設計 token 時查閱對應關係。

值取自 Stycue 設計稿（18 個畫面）收斂後的結果。**衝突一律朝設計稿收斂**；
設計稿內部互相衝突處，依「出現最多／最新版」挑一標準（見 §7）。

---

## 1. Token 架構

`globals.css` 依 **shadcn/ui 的 CSS 變數契約**組織，讓日後 `shadcn init` 與加入元件時能自動繼承本主題：

```
:root        原始值（hex，light-only）— shadcn 標準角色 + StyCue 擴充
.dark        空殼（目前僅 color-scheme）；日後由 shadcn 填 dark 值
@theme inline 把 :root 變數映射成 Tailwind utility（bg-*, text-*, border-*, rounded-*, shadow-*, text-<size>）
```

- **色彩格式**：目前用 hex（降轉換風險）；轉 oklch（shadcn 預設）列為後續優化。
- **`--radius: 0.5rem`（8px）** 為基準，shadcn 依此衍生 `rounded-sm/md/lg/xl/2xl`。
- **相容遷移**：新層用 shadcn 名稱；舊有 11 個 token 名保留為 alias（§4），**現階段不改元件**。

---

## 2. shadcn 標準角色 ← StyCue 收斂值

| CSS 變數                                 | 值                    | Tailwind utility                          | 用途                           |
| ---------------------------------------- | --------------------- | ----------------------------------------- | ------------------------------ |
| `--background` / `--foreground`          | `#fffdf7` / `#403a32` | `bg-background` / `text-foreground`       | app 底 / 主文字                |
| `--card` / `--card-foreground`           | `#ffffff` / `#403a32` | `bg-card` / `text-card-foreground`        | feed / 表單白卡                |
| `--popover` / `--popover-foreground`     | `#fffdf7` / `#403a32` | `bg-popover`                              | 下拉、modal 面板               |
| `--primary` / `--primary-foreground`     | `#f6d978` / `#403a32` | `bg-primary` / `text-primary-foreground`  | 主 CTA、FAB、選中 chip         |
| `--secondary` / `--secondary-foreground` | `#fff9e8` / `#403a32` | `bg-secondary`                            | header 底 / 次級面             |
| `--muted` / `--muted-foreground`         | `#fdf7e9` / `#756c60` | `bg-muted` / `text-muted-foreground`      | 輸入填色 / 沉降面 / 次文字     |
| `--accent` / `--accent-foreground`       | `#fcefda` / `#8a5a1e` | `bg-accent` / `text-accent-foreground`    | gold-tint 懸停 / 選中列        |
| `--destructive`                          | `#d64545`             | `text-destructive` / `border-destructive` | 表單錯誤、刪除、必填           |
| `--border`                               | `#e5ddbf`             | `border-border`                           | 預設邊框 / 分隔                |
| `--input`                                | `#e5ddbf`             | `border-input`                            | 輸入框邊                       |
| `--ring`                                 | `#d99a3d`             | `ring-ring`                               | focus 環（搜尋 / 輸入 active） |

> 註：最新 shadcn 已移除 `--destructive-foreground`（destructive 按鈕文字用 `text-white`）。

---

## 3. StyCue 擴充 token（shadcn 契約未涵蓋）

| CSS 變數                         | 值                    | utility                            | 用途                                    |
| -------------------------------- | --------------------- | ---------------------------------- | --------------------------------------- |
| `--gold`                         | `#d99a3d`             | `text-gold` `bg-gold`              | 提問/分享標籤、連結、星、tab 底線       |
| `--gold-soft`                    | `#fcefda`             | `bg-gold-soft`                     | 標籤底、熱門標籤、星圈                  |
| `--gold-deep`                    | `#8a5a1e`             | `text-gold-deep`                   | gold-soft 上的文字                      |
| `--gold-dark`                    | `#835500`             | `bg-gold-dark`                     | 前往儲值 / 通知搜尋徽章（強調次要動作） |
| `--sage`                         | `#a9b88e`             | `bg-sage`                          | 頭像、裝飾星、吉祥物 spark              |
| `--surface-header`               | `#fff9e8`             | `bg-surface-header`                | header bar（＝secondary，語意別名）     |
| `--surface-info`                 | `#f1ebda`             | `bg-surface-info`                  | 說明 / 提示卡                           |
| `--text-tertiary`                | `#9a9080`             | `text-text-tertiary`               | 欄位標籤、輔助說明                      |
| `--text-placeholder`             | `#b8af9e`             | `text-text-placeholder`            | placeholder、時間、空標題               |
| `--destructive-bg`               | `#fdf0ee`             | `bg-destructive-bg`                | 錯誤輸入框填色                          |
| `--tag-green` / `--tag-green-bg` | `#5c6e45` / `#eaf0e1` | `text-tag-green` `bg-tag-green-bg` | 正向 / 分類綠標籤                       |
| `--tag-blue` / `--tag-blue-bg`   | `#5b7fbe` / `#e7edfa` | `text-tag-blue` `bg-tag-blue-bg`   | 「委託人」藍標籤                        |
| `--neutral-ink`                  | `#2b2620`             | `bg-neutral-ink`                   | 排名徽章等 UI 深墨                      |
| `--border-subtle`                | `#f0e4c0`             | `border-border-subtle`             | header / 底部列細線                     |
| `--border-dashed`                | `#d9cfa9`             | `border-border-dashed`             | 虛線上傳 / 新增框                       |
| `--scrim-modal`                  | `rgba(64,58,50,.42)`  | `bg-scrim-modal`                   | modal 遮罩                              |
| `--scrim-sheet`                  | `rgba(29,28,18,.25)`  | `bg-scrim-sheet`                   | 底部 sheet 遮罩                         |

**圓角**：`rounded-card`(12px)、`rounded-panel`(14px)、`rounded-sheet`(20px)、`rounded-device`(36px)；
其餘用 shadcn 衍生 `rounded-sm/md/lg/xl/2xl`（lg = 8px 基準）；`50%`/`999px` 用 `rounded-full`。
**字級**：改採新的六階字級規格（見 DR-013）——
`text-label-md`(12/500)、`text-body-md`(14/400)、`text-body-lg`(16/400)、`text-headline-sm`(20/600)、
`text-headline-md`(24/600)、`text-display-lg`(28/700，取行動裝置尺寸，因為 app shell 固定 `max-w-md`)。
每個 token 都是 size+line-height 成對值；字重不烘進 token，由呼叫端視強調需求另加 `font-medium`/`font-semibold`/`font-bold`。
原本 7 階量表（`text-caption`/`-meta`/`-body`/`-name`/`-title`/`-heading`/`-display`）已淘汰、全站呼叫點已遷移完畢。
**字體**：`font-sans` = `'Plus Jakarta Sans','Noto Sans TC',sans-serif`（已透過 `next/font` 於 `layout.tsx` 自架載入）。
**陰影**：`shadow-card`(.08)、`shadow-cta`(.14)、`shadow-cta-strong`(.18)、`shadow-nav-top`、
`shadow-modal`、`shadow-dropdown`、`shadow-float`、`shadow-gold-dark`、`shadow-device`。

---

## 4. Legacy alias（舊 token → 新角色）

現有 ~319 處 utility 沿用，值已朝設計稿收斂。**遷移目標**＝各頁套用時改用的 shadcn 名。

| 舊 token utility          | 對應                      | 值變化                  | 遷移目標                             |
| ------------------------- | ------------------------- | ----------------------- | ------------------------------------ |
| `bg-surface-base`         | `var(--background)`       | 不變 `#fffdf7`          | `bg-background`                      |
| `bg-surface-soft`         | `var(--secondary)`        | 不變 `#fff9e8`          | `bg-secondary` / `bg-surface-header` |
| `bg-brand-primary`        | `var(--primary)`          | 不變 `#f6d978`          | `bg-primary`                         |
| `text-accent-amber`       | `var(--gold)`             | 不變 `#d99a3d`          | `text-gold`                          |
| `text-support-sage`       | `var(--sage)`             | 不變 `#a9b88e`          | `text-sage`                          |
| `text-text-primary`       | `var(--foreground)`       | 不變 `#403a32`          | `text-foreground`                    |
| `text-text-muted`         | `var(--muted-foreground)` | 不變 `#756c60`          | `text-muted-foreground`              |
| `border-border-default`   | `var(--border)`           | **`#e9ddbf → #e5ddbf`** | `border-border`                      |
| `text-error` 等           | `var(--destructive)`      | **`#ba1a1a → #d64545`** | `text-destructive`                   |
| `bg-error-container`      | `var(--destructive-bg)`   | **`#ffdad6 → #fdf0ee`** | `bg-destructive-bg`                  |
| `text-on-error-container` | `var(--destructive)`      | **`#93000a → #d64545`** | `text-destructive`                   |

---

## 5. 原始寫死值 → token 對照

目前約有 **12 檔、112 處寫死 hex**，主要集中在 `comments/comment-board.tsx`、`register/page.tsx`、
`posts/[id]/page.tsx`、`add-comment-form.tsx`、`preview/page.tsx`、`notifications/page.tsx` 等；
套用時依下表替換。

### 顏色

| 寫死值                                        | → utility                                               |
| --------------------------------------------- | ------------------------------------------------------- |
| `#FFFDF7`                                     | `bg-background`（SVG 內同色留區域值）                   |
| `#FDF7E9`                                     | `bg-muted`（出現最頻繁，優先替換）                      |
| `#FFF9E8`                                     | `bg-secondary` / `bg-surface-header`                    |
| `#FFFFFF`（白卡）                             | `bg-card`                                               |
| `#403A32`                                     | `text-foreground`                                       |
| `#756C60`                                     | `text-muted-foreground`                                 |
| `#9A9080`                                     | `text-text-tertiary`                                    |
| `#B8AF9E`                                     | `text-text-placeholder`                                 |
| `#E5DDBF`                                     | `border-border`                                         |
| `#F0E4C0`                                     | `border-border-subtle`                                  |
| `#E0D4AA` / `#EFE7CE` / `#D9CDB8`             | `border-border`（收斂）                                 |
| `#F6D978`                                     | `bg-primary`                                            |
| `#D99A3D`                                     | `text-gold`                                             |
| `#FCEFDA` / `#FCEFCB`                         | `bg-accent` / `bg-gold-soft`                            |
| `#8A5A1E` / `#B98A45`                         | `text-gold-deep`                                        |
| `#835500`                                     | `bg-gold-dark`                                          |
| `#D64545` / `#C43E32` / `#C0564B` / `#AB4B41` | `text-destructive` / `border-destructive`（收斂，§7-1） |
| `#FDF0EE` / `#FBE8E4`                         | `bg-destructive-bg`                                     |
| `#5C6E45` / `#6B8A5A` / `#4E6B45`             | `text-tag-green`（收斂，§7-2）                          |
| `#EAF0E1` / `rgba(169,184,142,.15)`           | `bg-tag-green-bg`                                       |
| `#5B7FBE` / `#E7EDFA`                         | `text-tag-blue` / `bg-tag-blue-bg`                      |
| `#A9B88E`                                     | `bg-sage` / `text-sage`                                 |
| `#2B2620`                                     | `bg-neutral-ink`（UI）；內容色卡「黑」留區域值          |
| `#D9CFA9` / `#C9BF9F`                         | `border-border-dashed`                                  |
| `rgba(64,58,50,.42/.45)`                      | `bg-scrim-modal`                                        |
| `rgba(29,28,18,.25/.45)`                      | `bg-scrim-sheet`                                        |
| `rgba(64,58,50,.55)`（縮圖字幕帶）            | 區域值（overlay caption）                               |

### 字級 / 圓角 / 陰影

| 寫死值                                             | → utility                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `text-[9px]`～`[13.5px]`（含 `text-xs`/`text-sm`） | `text-label-md`(12) 或 `text-body-md`(14)——依內容是否為主要可讀文字判斷，非機械式就近取值 |
| `text-[14.5px]`～`[15.5px]`（含 `text-base`）      | `text-body-lg`(16)——留言/回覆內文等主要內容一律採用此階，不降級當次要文字                 |
| `text-[17px]`～`[19px]`（含 `text-lg`）            | `text-headline-sm`(20)                                                                    |
| `text-[20px]`～`[22px]`（含 `text-xl`）            | `text-headline-md`(24)                                                                    |
| `rounded-[12px]` / `[14px]` / `[36px]`             | `rounded-card` / `rounded-panel` / `rounded-device`                                       |
| `rounded-[8px]`                                    | `rounded-lg`                                                                              |
| `rounded-[16px]`（modal）/ `[20px]`（sheet）       | `rounded-2xl`(≈14.4，可接受) 或 `rounded-[16px]` / `rounded-sheet`                        |
| `rounded-[6px]` / `[10px]` / `[3px]`               | 就近用衍生階或保留 arbitrary（非核心）                                                    |
| `shadow-[0_4px_12px_rgba(217,154,61,0.08)]`        | `shadow-card`                                                                             |
| `…,0.14]` / `…,0.18]` / `…,0.2]`                   | `shadow-cta` / `shadow-cta-strong`（.2 併入 strong）                                      |
| `shadow-[0_12px_32px_rgba(64,58,50,0.28)]`         | `shadow-modal`                                                                            |
| `shadow-[0_8px_20px_rgba(64,58,50,0.16)]`          | `shadow-dropdown`                                                                         |
| `shadow-[0_4px_24px_rgba(113,92,1,0.14)]`          | `shadow-device`                                                                           |

> 間距不另建自訂比例——設計稿落在 2px 網格（6/8/10/12/14/18/22/26），用 Tailwind 預設比例即可。
> 套用時把 `h-13.5`、`gap-1.25`、`pt-4.5`、`px-4.5` 等臨時任意值正規化到最近的標準級距。

---

## 6. 元件狀態範本（用角色**組合**，不另 mint token）

> shadcn 元件本就以角色組合出各狀態，故此處只給組合範式，未來直接沿用或交由 shadcn 元件處理。

- **輸入框**
  - 預設：`bg-muted border border-input text-foreground placeholder:text-text-placeholder rounded-lg`
  - 聚焦：`focus:ring-2 focus:ring-ring`
  - 錯誤：`border-destructive bg-destructive-bg text-destructive`（helper 文字 `text-destructive`）
  - 停用：`bg-secondary text-text-placeholder`（＝設計稿 `#f0e9d2` 近似，套用時可用 `disabled:` 前綴）
- **可選標籤 chip**：未選 `bg-muted border border-border`；選中 `bg-primary font-semibold`
- **分段選擇器（預算等）**：未選 `border border-border`；選中 `border border-foreground font-semibold`
- **按鈕**：主 `bg-primary text-primary-foreground shadow-cta`；次 `border border-border`；
  強調次要 `bg-gold-dark text-white shadow-gold-dark`；危險 `bg-destructive text-white`
- **卡片 / 面板**：`bg-card border border-border rounded-card shadow-card`；資訊面板 `bg-muted rounded-panel`
- **Modal**：遮罩 `bg-scrim-modal`；面板 `bg-popover rounded-2xl shadow-modal`
- **底部 sheet**：遮罩 `bg-scrim-sheet`；面板 `bg-muted rounded-t-sheet`
- **標籤/徽章**：綠 `text-tag-green bg-tag-green-bg`；藍 `text-tag-blue bg-tag-blue-bg`；
  金 `text-gold-deep bg-gold-soft`

---

## 7. 收斂決策紀錄

1. **危險紅（4 種）→ `#d64545`**（表單驗證紅，UI 用途最多；登入/註冊頁已採用此色）＋ bg `#fdf0ee`。
   `#c43e32`（積分不足三角）、`#c0564b`/`#ab4b41`（刪除鈕）皆收斂到此。
2. **綠標籤（3 種字）→ `#5c6e45` on `#eaf0e1`**；`#6b8a5a`、`#4e6b45` 收斂到此。
3. **邊框米灰（5 階）→ 2 個**：`--border #e5ddbf`、`--border-subtle #f0e4c0`；
   `#e0d4aa`/`#efe7ce`/`#d9cdb8` 收斂到 `--border`。（舊 token `#e9ddbf` 一併改為 `#e5ddbf`。）
4. **device 陰影 → `rgba(113,92,1,.14)`**（17/18 畫面），捨 `rgba(113,97,64,.16)`。
5. **scrim → 2 個**：`--scrim-modal rgba(64,58,50,.42)`、`--scrim-sheet rgba(29,28,18,.25)`（取多數）。
6. **主色 vs 深金**：`--primary #f6d978` 為唯一主 CTA；`#835500` = `--gold-dark`，僅作強調次要動作。
7. **虛線邊框 → `#d9cfa9`**（4 畫面）；`#c9bf9f` 收斂到此。
8. **CTA 陰影 alpha（4 級）→ 2 級**：`shadow-cta .14`、`shadow-cta-strong .18`（.2 併入 strong）。
9. **中性墨 `#2b2620`** 只作 UI（排名徽章）token；內容色卡「黑」維持區域值。

---

## 8. 不 tokenize（維持區域值）

一次性、插圖或品牌鎖定色，**不**進 token；套用時保留原地 inline / arbitrary：

- **吉祥物 Cue**（Disclaimer）：`#f6d978`/`#d99a3d`/`#715c01`/`#403a32`/`#a9b88e` 插圖用色。
- **Google 登入四色**：`#4285F4`/`#34A853`/`#FBBC05`/`#EA4335`（品牌鎖定）。
- **Feed 照片條紋漸層**：`#E9C89A→#DEB985` 等一系列裝飾替身。
- **內容色卡 swatch**（Share Post 黑/深灰/米白）：`#2b2620`/`#6b655a`/`#ede4c8` 屬「內容資料」而非 UI。
- **縮圖字幕帶** `rgba(64,58,50,.55)`、**深墨文字** `#1d1c12`/`#4c4637`（僅 Disclaimer modal）。
- **圖片 placeholder** `#d9d2c0`/`#eae2cb`（過渡素材，之後接真圖）。

---

## 9. 後續工作

- **字體載入**（獨立進行）：`layout.tsx` 用 `next/font` 接 `Plus Jakarta Sans` + `Noto Sans TC`，
  並清掉樣板殘留的 `dark:bg-zinc-950`。影響全站排版，故單獨處理。
- **各頁套用**：依 §5 把寫死值換成 token utility，
  順手把舊 alias（`bg-surface-base` 等）改成 shadcn 名（§4），並正規化臨時間距/圓角。
- **oklch 轉換**（可選）：把 §2/§3 的 hex 轉為 oklch，完全對齊 shadcn 預設。
