# SimTrade — 個人模擬交易平台

一個以 React + Supabase 建構的個人模擬投資沙盒，功能包含：
- 📊 10 檔預選標的（5 ETF + 5 個股）即時模擬報價
- 📈 K 線圖（LightweightCharts）
- 💰 可自訂初始資金
- 📋 完整交易紀錄與績效指標（NAV、夏普值、最大回撤）
- 📄 CSV 匯出

---

## 快速開始（本地開發）

```bash
npm install
cp .env.example .env.local   # 填入 Supabase 憑證
npm run dev
```

---

## 一步一步部署教學

### Step 1：建立 Supabase 資料庫

1. 前往 https://supabase.com 並登入（免費）
2. 點 **New project**，填寫名稱和密碼，選擇離你最近的 Region
3. 等候 ~2 分鐘建立完成
4. 進入 Dashboard → **SQL Editor**
5. 貼上 `supabase_setup.sql` 全部內容，點 **Run** 執行

取得 API 金鑰：
- Dashboard → **Settings → API**
- 複製 `Project URL` 和 `anon public` key

---

### Step 2：在本地設定環境變數

```bash
cp .env.example .env.local
```

編輯 `.env.local`：
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

測試本地執行：
```bash
npm run dev
```
瀏覽器開啟 http://localhost:5173 確認可正常運作。

---

### Step 3：上傳到 GitHub

1. 建立 GitHub 帳號（如未有）：https://github.com

2. 建立新 Repository：
   - GitHub 右上角 **+** → **New repository**
   - 名稱：`simtrade`
   - 選 **Public**（期末展示用）
   - **不要**勾選 "Initialize with README"（我們自己有）
   - 點 **Create repository**

3. 在專案資料夾執行：
```bash
git init
git add .
git commit -m "feat: initial SimTrade React app"
git branch -M main
git remote add origin https://github.com/你的帳號/simtrade.git
git push -u origin main
```

4. 確認 GitHub 上可看到所有檔案 ✓

---

### Step 4：部署到 Vercel

1. 前往 https://vercel.com → **Log in with GitHub**

2. 點 **Add New... → Project**

3. 選擇剛才建立的 `simtrade` repository → **Import**

4. 設定環境變數（重要！）：
   - 點 **Environment Variables**
   - 新增 `VITE_SUPABASE_URL`（值：你的 Supabase URL）
   - 新增 `VITE_SUPABASE_ANON_KEY`（值：你的 anon key）

5. Framework Preset 選 **Vite**（Vercel 會自動偵測）

6. 點 **Deploy** → 等待 ~1 分鐘

7. 部署完成後，Vercel 給你一個網址，例如：
   `https://simtrade-xxxx.vercel.app`

---

### Step 5：之後更新程式

每次修改後只需：
```bash
git add .
git commit -m "fix: 描述你的更改"
git push
```
Vercel 會自動重新部署 🚀

---

## 技術架構

| 技術 | 用途 |
|------|------|
| React 18 | UI 框架 |
| Vite 5 | 打包工具 |
| Supabase | 資料庫（交易紀錄 + 設定） |
| LightweightCharts | K 線圖表 |
| Chart.js | NAV 走勢圖 |

## 專案結構

```
src/
  App.jsx                    # 根元件
  context/PortfolioContext.jsx  # 全域狀態（useReducer + Supabase）
  hooks/
    usePrices.js             # 模擬報價 hook
    useToast.js              # 通知 hook
  components/
    layout/Header.jsx        # 頂部導覽
    layout/TabBar.jsx        # 底部 Tab
    trade/TradePanel.jsx     # 交易主頁
    trade/TickerList.jsx     # 報價列表
    trade/TickerRow.jsx      # 單一報價行（含閃爍動畫）
    trade/OrderForm.jsx      # 下單表單
    trade/PositionItem.jsx   # 持倉項目
    trade/PositionList.jsx   # 持倉列表
    trade/ChartModal.jsx     # K 線圖 Modal
    trade/CapitalModal.jsx   # 設定資金 Modal
    history/HistoryPanel.jsx # 績效頁
    history/StatsCards.jsx   # 績效指標卡片
    history/OrderHistoryList.jsx  # 交易記錄列表
    shared/Toast.jsx         # 通知元件
    shared/MetricCard.jsx    # 指標卡片
```
