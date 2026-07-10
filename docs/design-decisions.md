# Design 決策紀錄（ADR）

> **收錄門檻**：只有符合以下至少一項才寫成一筆決策紀錄——
> **不可逆**（動了很難悄悄改回去）／**跨多檔案影響**／**影響團隊協作慣例**／**改變互動或可及性行為**。
> 單純的數值收斂（如 `h-[46px]` → `h-11`）、一次性 padding/圓角調整不進這份文件，靠 commit message 記錄即可。
>
> 每筆決策**寫完不改**，狀態變了就開新一筆並標記 `Superseded by DR-00X`，不要回頭編輯舊紀錄。

---

## DR-001：`ui/*.tsx` 直接編輯成品牌版，不建 `custom/` 邊界層

**狀態**：Accepted（推翻過兩版前置方案，見下）

**背景**：曾規劃兩版「`custom/` 疊層保護 `ui/`」做法（分層概念 / 疊 raw className）。查證 shadcn 官方文件後發現前提不成立：

> "This is not a component library. It is how you build your component library."
> "With shadcn/ui, you simply edit the button code directly."

**決策**：`ui/*.tsx` 以官方 registry 原始碼為起點，variant/尺寸/圓角直接改在檔案本身；頁面一律直接 `import { X } from '@/components/ui/x'`。日後 `npx shadcn add` 更新走 `git diff` 人工比對重套品牌值，這是官方認定的正常流程。

**後果**：不可逆——已刪除 `src/components/custom/` 資料夾與 10 個頁面的相關 import。影響所有後續元件（Card/Input/Dialog/Sheet）採用同一模式。

---

## DR-002：採用 Base UI（`base-vega` style）而非 Radix

**狀態**：Accepted

**背景**：shadcn 2026-07 起預設風格改用 Base UI（Radix 仍支援、非強制遷移）。

**決策**：全部元件走 `@base-ui/react` 子路徑 import（單一整合套件），不用 `radix-ui`。

**後果**：跨所有 `ui/*.tsx` 檔案；日後若要換回 Radix 需重新逐一改寫 primitive 引用。

---

## DR-003：Avatar 尺寸依語意分四階，非數值就近

**狀態**：Accepted

**決策**：`xl`(38px) 主要作者列／`lg`(36px) 列表項目身分／`md`(34px) 緊湊列操作／`sm`(30px) 次要巢狀情境。trending 小卡原 28px 判定為「全站最緊湊層級」併入 `sm`，不是數值最接近就套用。

**後果**：影響 8+ 處頭像呼叫點的 size prop 選擇準則，之後新增頭像需依「畫面情境」而非像素距離判斷該用哪一階。

---

## DR-004：Card 不採用官方複合子元件，自建最小 cva 版本

**狀態**：Accepted

**背景**：官方 Card 附帶 `CardHeader/CardTitle/CardDescription/CardAction/CardFooter`，本專案四處用法都是單一表面＋依情境變色，沒有一處需要那組子結構。

**決策**：`ui/card.tsx` 不採用官方原始碼，改用 `variant`（`post`/`trending`/`info`/`outline`）的 cva 最小版本。

**後果**：跟其他元件（Button/Badge/Avatar/Dialog）「以官方原始碼為起點」的模式不同，是唯一例外；日後若真的需要 Header/Footer 子結構，需要重新評估要不要改採官方版。

---

## DR-005：Input/Textarea 範圍限縮到裸框欄位

**狀態**：Accepted

**背景**：A6 把「裸框欄位」「圖示前綴欄位（登入/註冊）」「pill 包裹欄位（留言 composer）」歸在同一張表，但三者結構不同——官方 Input 假設自己就是那個有邊框的元素，圖示前綴/pill 欄位的邊框其實畫在外層容器上。

**決策**：本輪只採用官方 Input/Textarea 於真正的裸框欄位；圖示前綴、pill 欄位維持現狀，留待有專門的「複合欄位」規格時再處理。

**後果**：`login`/`register`/composer 目前**不會**因為「有了 Input 元件」而自動套用，需要另立規格才能收斂（見 `design-remaining-debt.md`）。

---

## DR-006：TopBar `center=false` 例外規則

**狀態**：Accepted

**背景**：5 處原始 header 中有 4 處標題絕對置中，只有 `posts/[id]/page.tsx` 是標題緊接返回鍵右側（非置中）。

**決策**：TopBar 預設 `center=true`（絕對置中），該頁單獨傳 `center={false}` 保留原本非置中版面，不強制全站統一成置中。

**後果**：跨檔案影響——之後任何新頁面要決定 TopBar 標題置中與否，需要意識到這個 prop 分支存在，不是元件自動決定的。

---

## DR-007：Dialog/Sheet 遮罩範圍改回「只暗手機直欄」

**狀態**：Accepted（曾一度改成官方預設全視窗遮罩，後推翻）

**決策**：`DialogOverlay`/`SheetOverlay` 用 `fixed inset-y-0 left-1/2 w-full max-w-md -translate-x-1/2` 取代官方的 `fixed inset-0`。這組 class 會自我夾限：窄螢幕（實際手機）自動等於 `left:0`，寬螢幕（桌機預覽）自動置中成 448px 欄，桌機灰底不會被暗掉。

**連動修正**：`Sheet` 側板的官方 `data-[side=left]:left-0` 是相對「視窗」左緣，遮罩改窄後若面板仍貼視窗左緣會跟遮罩脫節。呼叫端加 `data-[side=left]:left-[max(0px,calc(50%-14rem))]`（`max()` 避免窄螢幕算出負值把面板裁到畫面外）。

**後果**：跨 Dialog/Sheet 兩個元件、影響所有現有及未來 modal/drawer 的遮罩行為；`max(0px, calc(...))` 的定位公式如果之後要支援 `side="right"` 也需要對應改寫。

---

## DR-008：Dialog 寬度統一 300px、Sheet 側邊選單保留 260px

**狀態**：Accepted

**決策**：`DialogContent` 固定 `max-w-75`(300px)，取代官方 `sm:max-w-md`；側邊選單 Sheet 用 `data-[side=left]:w-65`(260px) override 官方的 `w-3/4`，不採用官方預設寬度。

**後果**：所有 Dialog 呼叫點統一視覺寬度；Sheet 若之後新增其他側板用途（非側邊選單），需要決定是否沿用 260px 或另訂。

---

## DR-009：DialogFooter 改寫成等寬雙鈕橫排，不建 `ModalCancelButton`/`ModalActionButton`

**狀態**：Accepted（推翻規劃初期的暫定命名）

**背景**：官方 `DialogFooter` 是「手機 `flex-col-reverse`／桌機 `sm:justify-end`」排版，跟本專案等寬雙鈕橫排的既有慣例不同。

**決策**：直接改寫 `DialogFooter` 的 class 定義成 `flex w-full items-center gap-2.5`；按鈕本身因 variant/文案各異，維持呼叫端 raw `<Button>`，不另建具名 wrapper 元件（原規劃預期會有 4+ 處重複而想建 `ModalCancelButton`/`ModalActionButton`，實際只是「排版列」重複，按鈕本身不算重複）。

**後果**：影響 3 個 Dialog 呼叫點的排版慣例；判斷「要不要建 wrapper 元件」的準則（排版重複 ≠ 元件重複）可套用到未來類似情境。

---

## DR-010：標籤選擇器底部 sheet 不導入 Base UI Sheet

**狀態**：Accepted

**背景**：`posts/new/@modal/(.)tags` 是 intercepting route，用 `router.back()` 驅動開關（開關即路由導航）。

**決策**：本輪完全不碰，維持手寫 `fixed inset-0` + `router.back()` 現狀，不改成 Base UI Sheet。

**後果**：這是目前唯一「看起來像 modal 但故意不套元件」的例外，因為改動會牽涉互動流程/路由架構（超出本次規劃的「不改互動流程」邊界），不是遺漏。

---

## DR-011：B2 自創值處置原則——優先收斂、內容資料與第三方品牌色列永久白名單

**狀態**：Accepted

**決策**：非元件層的自創顏色/陰影值，預設**收斂到最近既有 token**；只有以下情況才保留一次性值不收斂：(a) 代表 mock「內容資料」而非介面色（如 feed 卡片假照片色塊/漸層）、(b) 第三方官方品牌識別色（如 GoogleIcon 四色，禁止 tokenize）、(c) 方向/用途獨特且只出現一次（如側邊選單的水平投影陰影）。

**後果**：跨所有頁面的顏色稽核（Phase 3D 及未來新增頁面）都套用同一判斷準則，避免每次重新爭論「這個值該不該收斂」。

---

## DR-012：文件拆分成 migration-plan / decisions / remaining-debt 三份

**狀態**：Accepted（原規劃 4 份，經審查意見修正為 3 份）

**背景**：`design-token-apply-log.md` 混雜規劃/決策/執行/驗證/待辦太多性質，讀者難以快速回答「現在採用了什麼、還剩什麼風險、哪些決策不可逆」。

**決策**：拆成 `design-migration-plan.md`（現況，改了就覆寫）、`design-decisions.md`（本文件，僅收錄過門檻的決策，寫完不改）、`design-remaining-debt.md`（待辦，解決後移到 Resolved 區塊而非刪除）。**不獨立維護 execution log**——「做了什麼、何時」直接查 `git log`；純數值收斂不寫文件。舊 `design-token-apply-log.md` 加棄用 banner、改名為 `.deprecated.md` 保留，不搬進 `archive/`（避免讀者以為那是另一份現行文件）。

**後果**：影響之後所有文件寫作習慣——每次要新增內容前，先判斷屬於「現況／決策／待辦」哪一種性質，而不是全部塞進同一個檔案；決策是否要開新 ADR，先檢查是否過收錄門檻。
