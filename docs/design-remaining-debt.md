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

### `posts/share/new` 切換到「委託」類型後，`posts/commissions/new` 不保證顯示「委託」

**現況**：`posts/share/new` 的類型下拉選單新增了「委託」選項（連到 `posts/commissions/new` 的 `<Link>`），但 `posts/commissions/new` 的 `postType` 顯示值是由 `emptyDraft.postType`(`postTypes[0]`="委託") 與瀏覽器 `localStorage`（`stycue:commission-post-draft`）裡的舊草稿合併決定的——若使用者瀏覽器裡還留著 `postType` 不是「委託」的舊草稿，跳轉過去後下拉選單不會顯示「委託」。
**阻塞原因**：要保證顯示，需要在連結加上 query param（如 `?type=委託`）並修改 `posts/commissions/new/page.tsx` 讀取後覆蓋還原後的 `postType`——這會動到 `posts/commissions/new` 這個檔案，牽涉另一個既有頁面的邏輯，目前尚未實作，待確認是否要做。
**附帶的既有資料結構限制**（非本次連結新增，原本就存在）：`postType` 與標題/內文/身高/體重/預算等欄位同屬一個 `Draft` 物件，不是各類型分開存放。若使用者已填寫委託專屬欄位（身高/體重/預算）後才把下拉選單切成其他類型，且之後觸發 `saveDraft()`（點「取消」或「送出」），存進 `localStorage` 的會是同一份草稿、`postType` 已變更，但先前填寫的委託專屬欄位內容仍在其中，形成欄位語意與類型不一致的殘留資料。單純點擊下拉選單切換類型本身**不會**立即寫入 `localStorage`（`onClick` 只呼叫 `setForm`，未呼叫 `saveDraft`），只有在後續明確觸發存草稿的動作時才會連帶寫入。
**下一步**：確認是否要加 query param 讓「委託」入口保證顯示正確類型；若要處理欄位殘留問題，需要先決定草稿資料結構是否要依 `postType` 分開存放，或送出前針對非對應類型的欄位做清除。

---

### `/payment-result` 查詢訂單狀態的 API 是否要求登入態尚未確認

**現況**：`GET /api/points/purchases/{orderId}`（`ai-preview/Points.md` 規劃、尚未上線）預計是 `/payment-result` 頁面用來查詢訂單成功/失敗狀態的 API。積分實際入帳的時機點是 `POST /api/payments/ecpay/return`（ECPay 伺服器對伺服器呼叫，訂單建立時就已綁定 `userId`，不依賴瀏覽器登入狀態）——所以「加分」本身不受影響。但如果 `GET /api/points/purchases/{orderId}` 沿用現有 BFF 慣例要求 JWT（見 `src/app/api/points/me/route.ts` 等既有路由的 `getAuthHeader()` 模式），使用者從 ECPay 導回時若 session 剛好失效（例如跨站導轉遺失 cookie），結果頁會查不到訂單狀態、顯示不出來——即使積分已經確實入帳。
**阻塞原因**：這支 API 後端尚未上線，`/payment-result` 目前（`feat/points-recharge-page` 分支）只做純轉換、還沒真的接上這支查詢，無法實際驗證後端的認證設計。
**下一步**：後端 API 真的要接上時，需要跟後端確認 `GET /api/points/purchases/{orderId}` 是否可以只憑 `orderId` 本身查詢（不強制要求登入），或是否有其他機制（如簽章過的一次性 token）讓結果頁在未登入/session 過期時仍能顯示正確結果。

---

### `comment-modals.tsx` 的「餘額不足」入口未帶 `source`/`returnTo` 導回留言串

**現況**：`/payment-result` 頁已經做好讀取 `source`/`returnTo` query param 的邏輯（`source==='comment'` 時主按鈕文字改成「返回留言，選擇最佳留言」、連結導向 `returnTo`），但目前全站唯一會導向 `/profile/points/buy` 的「餘額不足」入口——`posts/commissions/[id]/comments/comment-modals.tsx` 的 `InsufficientPointsModal`——連結時沒有帶上這兩個 query param，所以這段邏輯目前無法被觸發。
**阻塞原因**：不是這個分支新增的連結（`InsufficientPointsModal` 本來就存在），而且就算現在補上 query param，整條鏈路目前仍是斷的——儲值頁的 `confirmPurchase` 是 no-op（無法真的送出付款、離開該頁），也沒有真的 ECPay 導轉與 `GET /api/points/purchases/{orderId}` 查詢——使用者實際上走不到會用上這兩個 query param 的那一步。屬於「兩端都要等後端 API 上線、真的把 ECPay 全鏈路接上時才有意義一起處理」的項目，跟前一筆（結果頁查詢 API 認證方式）是同一條鏈路的兩截缺口。
**下一步**：等 `POST /api/points/purchases`、ECPay 導轉、`GET /api/points/purchases/{orderId}` 都接上真的之後，同一個 commit/分支裡把 `comment-modals.tsx` 的連結補上 `?source=comment&returnTo=...`（`returnTo` 指回該筆委託的留言頁），並實測整條「餘額不足→儲值→付款完成→導回留言選最佳留言」的路徑。

---

## Resolved

### `text-[11px]` 等自創字級小數值未決定去留（Resolved 2026-07-11，commit 待補）

**原現況**：Phase 3D 執行時發現 `text-[11px]`(15)、`text-[12.5px]`(5)、`text-[14.5px]`(3) 等一批自創小數字級，沒有精確對應現有 token，刻意保留未動。
**怎麼解的**：使用者決定改採官方設計提案的六階 typography 規格（`label-md`12/`body-md`14/`body-lg`16/`headline-sm`20/`headline-md`24/`display-lg`28），全站重新盤點約 150+ 處字級呼叫點（含這批小數值與既有 7 階舊 token），依實際語意角色（標籤/次要說明/主要內容/標題）對應到新量表，而非機械式就近取值。舊 7 階量表已從 `globals.css` 移除。詳見 `docs/design-tokens.md` §3、`docs/design-decisions.md` 新增的 ADR。
