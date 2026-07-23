# StyCue

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

StyCue 是一款專為穿搭決策設計的社群協作平台。
我們希望透過分享與積分委託機制，解決穿搭決策耗時、缺乏具體建議的問題，讓每次穿搭都能得到社群支援。

> 👉 **[體驗 StyCue](https://stycue.vercel.app/)** — 建議使用行動裝置模式或手機瀏覽器開啟 Demo 網址

---

## ✨ 核心功能 | Features

| 功能               | 說明                                                               |
| ------------------ | ------------------------------------------------------------------ |
| **貼文分享**       | 分享穿搭，可附上圖片、標籤與穿搭資訊                               |
| **穿搭委託**       | 附上條件、預算與懸賞積分，讓社群給出更精準的搭配建議               |
| **留言與最佳留言** | 留言互動，委託者可指定最佳留言並發放積分獎勵                       |
| **按讚與收藏**     | 可對貼文與委託按讚、收藏                                           |
| **社群追蹤**       | 追蹤感興趣的使用者                                                 |
| **積分系統**       | 註冊贈送、每日登入、儲值取得積分，可用於發布委託或給予最佳留言獎勵 |
| **站內搜尋**       | 全站搜尋貼文與委託，並保留搜尋歷史                                 |

---

## 🛠 使用技術 | Technical Stack

### 前端 Frontend — 部署於 Vercel

| 類別       | 技術                             |
| ---------- | -------------------------------- |
| 核心框架   | Next.js（App Router）、React     |
| 開發語言   | TypeScript                       |
| UI / 樣式  | Tailwind CSS、Base UI、shadcn/ui |
| 圖示       | lucide-react                     |
| 全域通知   | sonner                           |
| 身份驗證   | httpOnly Cookie                  |
| 程式碼規範 | ESLint、Prettier                 |
| 提交規範   | Husky、lint-staged、Commitlint   |
| CI/CD      | GitHub Actions、Vercel           |

---

## 🚀 快速開始 | Quick Start

### 環境需求

- Node.js 20+
- npm

### 安裝與啟動

```bash
# 複製專案
git clone https://github.com/chieh0225/stycue.git
cd stycue

# 安裝套件
npm install
```

```bash
# 啟動開發伺服器
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 即可看到結果。

### 其他指令

```bash
npm run build         # 建置正式版本
npm run start         # 啟動已建置的正式版本
npm run lint          # ESLint 檢查
npm run lint:fix      # ESLint 自動修正
npm run format        # Prettier 格式化
npm run format:check  # Prettier 檢查（不寫入）
```

---

## 📂 專案架構 | Project Architecture

```
stycue/
├─ .github/workflows/     # GitHub Actions 部署設定
├─ .husky/                # Git commit hook
├─ docs/                  # 設計系統與溝通文件
├─ src/
│  ├─ app/
│  │  ├─ (auth)/          # 未登入頁面
│  │  ├─ (main)/          # 登入後主要頁面
│  │  ├─ api/             # Route Handlers，轉發請求到後端 API
│  │  ├─ disclaimer/      # 免責聲明頁
│  │  ├─ payment-result/  # 金流付款結果頁
│  │  ├─ users/           # 使用者主頁
│  │  ├─ auth.ts          # 登入狀態管理
│  │  └─ layout.tsx       # 全域 Layout
│  ├─ components/
│  │  ├─ ui/              # 基礎 UI 元件（shadcn）
│  │  └─ skeletons/       # 骨架屏元件
│  ├─ lib/                # API 封裝與共用工具函式
│  ├─ types/              # 全域型別定義
│  └─ proxy.ts            # Middleware，攔截未上線路由
├─ .env.local             # 環境變數
└─ package.json           # 專案依賴與腳本
```

---

## 🔀 開發協作流程 | Git Workflow

#### 分支說明

- **main** - 正式釋出分支（Protected）
- **preparing** - 預覽驗證分支，push 後自動部署 Vercel Preview

#### 開發流程

- **feature/\* / fix/\* / chore/\* / refactor/\*** - 由 main 開出功能分支進行開發
- **merge → preparing** - 開發完成後合併進 preparing，透過 Vercel Preview 驗證功能
- **PR → main** - 驗證無誤後發 PR 合併回 main 作為正式版本

#### 分支保護規則

- **Branch Protection** - main 禁止直接 merge / push
- **Pull Request Required** - 所有變更必須透過 PR
- **Code Review** - 至少 1 人審核通過方可合併

---

## 👥 團隊成員 | Team

| 成員                                   | 角色     | 負責範疇                                                                                                                                    |
| -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [Chieh](https://github.com/chieh0225)  | 前端開發 | 介面設計（繪製線稿圖並完成精稿）、專案環境建置、UI 切版與 API 串接、Skeleton 畫面與圖片淡入效果、QA 與 Bug 修復、前端開發進度追蹤、簡報製作 |
| [Xiang](https://github.com/sunset3777) | 前端開發 | 介面線稿圖繪製、前後端工作項目對接、團隊溝通與進度同步、建立完整路由骨架、串接 API 與引入套件、Bug 修復與除錯、Demo 流程設計                |
| [Joanne](https://github.com/jlsjoanne) | 後端開發 | Controller-based API 與 RESTful API 設計、資料庫與搜尋機制設計、雲端儲存與部署維運、帳號安全與金流整合、API 文件與錯誤處理                  |
