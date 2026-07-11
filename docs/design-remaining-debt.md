# Design 待辦 / 風險清單

> 每項：**項目 → 現況 → 阻塞原因 → 建議下一步**。
> 解決後**移到本文件底部的 Resolved 區塊**（附日期＋commit hash＋怎麼解的），不要直接刪除——保留可追溯性。

## Active

### 圓形 icon 按鈕尚無 `IconButton` primitive

**現況**：`comment-composer.tsx` send、`bottom-nav.tsx` FAB、`ReplyComposer` send 三處維持 raw class。
**阻塞原因**：跟矩形 `Button` 不同型（`rounded-full`），Phase 3A 判定不同 shape 不硬塞同一元件。
**下一步**：等第二個以上真的重複的圓形按鈕情境出現，再另立 `IconButton` primitive。

### 分類/篩選下拉觸發器尚無 `Select`/`Dropdown` primitive

**現況**：`page.tsx`（篩選 chip）、`preview/page.tsx`（分類）、`posts/new/page.tsx`（分類/積分下拉）皆維持 raw `<button>` + 手寫 `fixed inset-0` 點擊外關閉層。
**阻塞原因**：外觀像 chip 但是互動開合選單，非靜態 Badge，需要獨立 primitive。
**下一步**：待有明確的 Select/Dropdown 需求規格再處理，可用 Base UI 的 `@base-ui/react/select` 或 `/menu` 起手。

### 給積分金額分段選擇器

**現況**：`comment-board.tsx` GivePointsModal 內的 3 顆金額按鈕維持 raw class。
**阻塞原因**：屬 A6 分段控制（segmented control），非 Dialog footer 範疇，Phase 3C 明確排除。
**下一步**：跟登入頁的分段選擇器一起評估是否共用一個 segmented primitive。

### `login`/`register` 圖示前綴輸入框未套用 Input 元件

**現況**：兩頁的信箱/密碼/暱稱欄位維持手寫 `<div>` 邊框 + `<input>` 無邊框的組合。
**阻塞原因**：DR-005——官方 Input 假設自己就是有邊框的元素，圖示前綴欄位的邊框畫在外層 div，結構不同。
**下一步**：需要先設計「icon-prefixed field」複合規格（可能是 Input 的一個 slot 變體），才能安全套用，不是簡單抽換。

### 留言 composer pill 欄位未套用 Input 元件

**現況**：`comment-composer.tsx`、`ReplyComposer` 的輸入列維持手寫 pill 容器 + 無邊框 `<input>`。
**阻塞原因**：同上，pill 容器邊框/圓角/底色也不在 `<input>` 本身。
**下一步**：可能跟「icon-prefixed field」用同一組複合欄位規格解決。

### 可移除標籤 pill 未評估能否套用 Badge

**現況**：`preview/page.tsx:250`（含內嵌 ✕ remove 按鈕）維持 raw class。
**阻塞原因**：padding 較大是為了 ✕ 的觸控範圍，套用 Badge 預設 padding 會縮小可點擊區，屬功能性風險。
**下一步**：需要先決定「Badge 帶內嵌互動元素」該用什麼 padding 準則，不能照抄靜態 Badge 的值。

### trending 排名徽章、`empty-notifications.tsx` skeleton 未元件化

**現況**：兩者都還是 hardcoded class（屬 A8「其他小元件」）。
**阻塞原因**：非本輪範圍，出現次數少（各僅 1-2 處）。
**下一步**：等出現第二個重複情境再評估是否值得元件化。

### `comment-board.tsx` 縱向 thread 分隔線色值未收斂

**現況**：`border-l-2 border-[#EFE7CE]`（回覆串左側縱向線）維持自創值。
**阻塞原因**：非水平 `Separator` 用途（縱向 thread 線），Phase 3D 掃描時特意排除。
**下一步**：`#EFE7CE` 跟 `border-border-subtle`(`#F0E4C0`) 很接近，可以直接收斂，只是還沒排進執行批次。

### Track B 的 token mapping／白名單目前不可機器重跑

**現況**：Phase 3D 的 B1 對照表、B2 白名單（mock 內容色/品牌色/一次性值）只存在 `design-decisions.md`(DR-011) 跟 commit history 裡，沒有落成 JSON/TS mapping。
**阻塞原因**：本輪範圍是文件重組，不是新增工具；外部審查指出這是「遷移規則不可重跑」的核心弱點。
**下一步**：之後若要腳本化重跑掃描（例如 CI 檢查有沒有新的 hardcoded 值），需要先把 mapping 表落成可被腳本讀取的資料格式。

### Dialog/Sheet 互動行為未在真實瀏覽器實測

**現況**：focus trap／ESC 關閉／scroll-lock／點擊遮罩關閉／進場焦點移轉，僅驗證過 SSR/`tsc`/`build`，這些屬於瀏覽器執行期行為。
**阻塞原因**：此開發環境無法驅動瀏覽器。
**下一步**：review 時於瀏覽器實際開關 5 個 modal/drawer（刪除圖片、簽到、側邊選單、給積分、積分不足）各一次覆核。

### `tw-animate-css` 目前只用在 Dialog/Sheet

**現況**：已安裝並套用進退場動畫，但其他互動元件（下拉選單、Badge hover 等）尚未評估是否要跟進使用同一套動畫語彙。
**阻塞原因**：非本輪範圍，安裝時只鎖定 Dialog/Sheet 的既有失效 class。
**下一步**：等有其他元件需要動畫時再評估，不用現在補齊。

### 標籤選擇器底部 sheet 未評估 Base UI 化

**現況**：DR-010 決定本輪不改，維持手寫 `router.back()` 驅動。
**阻塞原因**：牽涉互動流程/路由架構，超出「不改互動流程」邊界，非遺漏而是刻意排除。
**下一步**：若之後要重新評估，需要先確認能否在不動路由架構的前提下套用 Base UI Sheet（可能需要額外的 portal container 設計）。

---

## Resolved

### `text-[11px]` 等自創字級小數值未決定去留（Resolved 2026-07-11，commit 待補）

**原現況**：Phase 3D 執行時發現 `text-[11px]`(15)、`text-[12.5px]`(5)、`text-[14.5px]`(3) 等一批自創小數字級，沒有精確對應現有 token，刻意保留未動。
**怎麼解的**：使用者決定改採官方設計提案的六階 typography 規格（`label-md`12/`body-md`14/`body-lg`16/`headline-sm`20/`headline-md`24/`display-lg`28），全站重新盤點約 150+ 處字級呼叫點（含這批小數值與既有 7 階舊 token），依實際語意角色（標籤/次要說明/主要內容/標題）對應到新量表，而非機械式就近取值。舊 7 階量表已從 `globals.css` 移除。詳見 `docs/design-tokens.md` §3、`docs/design-decisions.md` 新增的 ADR。
