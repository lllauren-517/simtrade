import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://murynwlbdgxkimfgunfx.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__l1D3S4Rzwp3go_Gf_R24g_d_UjaFmG'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── 預設標的 ──────────────────────────────────────
export const DEFAULT_SECURITIES = [
  { symbol: '0050.TW', name: '元大台灣50',        grp: 'etf',   type: 'ETF' },
  { symbol: '0056.TW', name: '元大高股息',         grp: 'etf',   type: 'ETF' },
  { symbol: '006208.TW', name: '富邦台50',        grp: 'etf',   type: 'ETF' },
  { symbol: '00878.TW', name: '國泰永續高股息',    grp: 'etf',   type: 'ETF' },
  { symbol: '00919.TW', name: '群益台灣精選高息',  grp: 'etf',   type: 'ETF' },
  { symbol: '2330.TW',  name: '台積電',           grp: 'stock', type: 'EQUITY' },
  { symbol: '2317.TW',  name: '鴻海',             grp: 'stock', type: 'EQUITY' },
  { symbol: '2454.TW',  name: '聯發科',           grp: 'stock', type: 'EQUITY' },
  { symbol: '2881.TW',  name: '富邦金',           grp: 'stock', type: 'EQUITY' },
  { symbol: '1101.TW',  name: '台泥',             grp: 'stock', type: 'EQUITY' },
]

// ── 模擬基礎報價（沒抓到即用此值）────────────────
export const FALLBACK_PRICES = {
  '0050.TW':   { price: 182.5,  base: 181.0 },
  '0056.TW':   { price: 33.2,   base: 33.0  },
  '006208.TW': { price: 95.1,   base: 94.5  },
  '00878.TW':  { price: 20.8,   base: 20.7  },
  '00919.TW':  { price: 22.4,   base: 22.3  },
  '2330.TW':   { price: 978.0,  base: 970.0 },
  '2317.TW':   { price: 183.0,  base: 180.0 },
  '2454.TW':   { price: 1255.0, base: 1240.0},
  '2881.TW':   { price: 88.5,   base: 87.0  },
  '1101.TW':   { price: 39.2,   base: 38.8  },
}
