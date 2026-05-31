// 預選標的：ETF + 個股各 5 檔
export const SECURITIES = {
  // ETF
  '0050':  { name: '元大台灣50',        basePrice: 185.5,  vol: 0.18, type: 'etf'   },
  '0056':  { name: '元大高股息',        basePrice:  35.2,  vol: 0.15, type: 'etf'   },
  '00878': { name: '國泰永續高股息',    basePrice:  21.8,  vol: 0.16, type: 'etf'   },
  'SPY':   { name: 'SPDR S&P500 ETF',  basePrice: 528.0,  vol: 0.15, type: 'etf'   },
  'QQQ':   { name: 'Invesco QQQ ETF',  basePrice: 448.5,  vol: 0.20, type: 'etf'   },
  // 個股
  '2330':  { name: '台積電',            basePrice: 1020.0, vol: 0.25, type: 'stock' },
  'AAPL':  { name: 'Apple Inc.',        basePrice:  213.0, vol: 0.22, type: 'stock' },
  'NVDA':  { name: 'NVIDIA Corp.',      basePrice: 1208.0, vol: 0.40, type: 'stock' },
  'GOOGL': { name: 'Alphabet Inc.',     basePrice:  178.5, vol: 0.22, type: 'stock' },
  'TSLA':  { name: 'Tesla Inc.',        basePrice:  175.0, vol: 0.45, type: 'stock' },
};

export const DEFAULT_CAPITAL = 1_000_000;  // 預設 100 萬
export const TAX_RATE = { etf: 0.001, stock: 0.003 }; // 賣出稅率

// 圖表時間範圍對應天數
export const TF_DAYS = {
  '1W': 7, '1M': 30, '3M': 90,
  '6M': 180, '1Y': 365, '3Y': 1095,
};
