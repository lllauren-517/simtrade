# SimTrade — 模擬投資平台

React + Vite + Supabase 期末專題

## 專案功能

- **下單頁面**：10 檔預設標的（5 ETF + 5 個股），即時報價，K 線圖，買賣下單
- **紀錄頁面**：損益走勢圖、累計損益、最大回撤、勝率等指標、交易明細
- **設定頁面**：調整模擬初始資金、重置紀錄

## 技術架構

- React 18 + Vite
- Supabase（PostgreSQL 資料庫 + Realtime + Edge Functions）
- Recharts（折線圖）
- Lightweight Charts（K 線圖）
- Tailwind CSS

---

## 一、本機開發

```bash
# 1. 安裝依賴
npm install

# 2. 複製環境變數
cp .env.example .env

# 3. 填入你的 Supabase 金鑰 (見下方說明)

# 4. 啟動
npm run dev
```

---

## 二、建立 Supabase 資料庫

1. 前往 https://supabase.com 註冊帳號
2. 點「New Project」，輸入名稱與密碼，選擇離你最近的 Region
3. 等待專案建立（約 1 分鐘）
4. 前往 **SQL Editor**（左側選單），貼上 `supabase_schema.sql` 全部內容並執行
5. 前往 **Settings > API**，複製：
   - `Project URL` → 貼到 `.env` 的 `VITE_SUPABASE_URL`
   - `anon public key` → 貼到 `.env` 的 `VITE_SUPABASE_ANON_KEY`

`.env` 範例：
```
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 三、上架到 GitHub

```bash
# 在 GitHub 建立新 repo（空白），然後：

git init
git add .
git commit -m "feat: initial commit - SimTrade 模擬交易平台"
git branch -M main
git remote add origin https://github.com/你的帳號/simtrade.git
git push -u origin main
```

之後每次修改：
```bash
git add .
git commit -m "feat: 說明你改了什麼"
git push
```

---

## 四、部署到 Vercel

1. 前往 https://vercel.com 用 GitHub 帳號登入
2. 點「New Project」→ 選你的 `simtrade` repo
3. Framework Preset 選 **Vite**
4. 展開「Environment Variables」，新增兩個變數：
   - `VITE_SUPABASE_URL` = 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 Supabase anon key
5. 點「Deploy」

部署完成後 Vercel 會給你一個網址，例如 `https://simtrade-xxx.vercel.app`

之後 push 到 GitHub 就會自動重新部署 ✨

---

## 專案結構

```
src/
├── components/
│   ├── Header.jsx        # 頂部導航，顯示 NAV 與市場狀態
│   ├── TabBar.jsx        # 底部分頁列
│   ├── Toast.jsx         # 通知提示系統
│   ├── QuoteList.jsx     # 商品報價列表
│   ├── OrderForm.jsx     # 下單表單
│   ├── Holdings.jsx      # 持股明細
│   └── ChartModal.jsx    # K 線圖 Modal
├── hooks/
│   └── usePortfolio.js   # 核心狀態管理 Hook
├── lib/
│   ├── supabase.js       # Supabase client + 預設商品
│   └── utils.js          # 工具函數（格式化、計算）
├── pages/
│   ├── TradePage.jsx     # 下單頁面
│   ├── RecordsPage.jsx   # 紀錄頁面
│   └── SettingsPage.jsx  # 設定頁面
├── App.jsx               # 根組件
├── main.jsx              # 入口點
└── index.css             # 全域樣式
```
