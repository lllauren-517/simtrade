// ── Format helpers ────────────────────────────────
export const money = n =>
  n == null ? '—' : '$' + Math.round(n).toLocaleString('zh-TW')

export const pct = (n, digits = 2) =>
  n == null ? '—' : (n >= 0 ? '+' : '') + Number(n).toFixed(digits) + '%'

export const fmt = n => {
  if (n == null || Number.isNaN(+n)) return '—'
  const v = +n
  return v >= 100
    ? v.toFixed(2)
    : v >= 10
    ? v.toFixed(3)
    : v.toFixed(4)
}

export const nowTime = () =>
  new Date().toTimeString().slice(0, 8)

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

export const todayStr = () =>
  new Date().toISOString().slice(0, 10)

// ── Symbol helpers ────────────────────────────────
export const cleanSym = sym =>
  String(sym || '').replace('.TW', '').replace('.TWO', '')

export const normalizeSym = raw => {
  const v = String(raw || '').trim().toUpperCase()
  if (!v) return ''
  if (v.endsWith('.TW') || v.endsWith('.TWO')) return v
  if (/^\d{4,6}[A-Z]?$/.test(v)) return v + '.TW'
  return v
}

// ── Trading calendar ──────────────────────────────
export const getTWN = () => {
  const now = new Date()
  return new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000)
}

export const isAfterClose = () => {
  const t = getTWN()
  return t.getHours() > 13 || (t.getHours() === 13 && t.getMinutes() >= 30)
}

export const isWeekend = () => {
  const d = getTWN().getDay()
  return d === 0 || d === 6
}

export const nextTradingDay = baseDate => {
  const d = new Date(baseDate)
  d.setDate(d.getDate() + 1)
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export const settlementDate = () => {
  const twn = getTWN()
  if (isAfterClose()) return nextTradingDay(twn)
  if (isWeekend()) return nextTradingDay(twn)
  return twn.toISOString().slice(0, 10)
}

// ── Tax / fee ─────────────────────────────────────
export const FEE_RATE = 0.001425 * 0.28   // 折扣後手續費
export const TAX_RATE_ETF = 0.001
export const TAX_RATE_STOCK = 0.003

export const sellTaxRate = (sym, grp) => {
  if (grp === 'stock') return TAX_RATE_STOCK
  const clean = cleanSym(sym).toUpperCase()
  return clean.endsWith('B') ? 0 : TAX_RATE_ETF
}

export const calcCosts = (amount, side, sym, grp) => {
  const fee = Math.max(Math.round(amount * FEE_RATE), 20)
  const tax = side === 'sell' ? Math.round(amount * sellTaxRate(sym, grp)) : 0
  return { fee, tax, net: side === 'buy' ? amount + fee + tax : amount - fee - tax }
}

// ── Candle generation (fallback) ──────────────────
function seededRand(seed) {
  let s = seed
  return () => {
    s = Math.imul(48271, s) | 0
    return (s & 0x7fffffff) / 0x7fffffff
  }
}
function strSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0
  return Math.abs(h) || 1
}

export const generateCandles = (sym, price, tf = '1M') => {
  const days = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '3Y': 1095 }[tf] || 30
  const rand = seededRand(strSeed(sym + tf))
  const vol = 0.015
  let p = price
  for (let i = 0; i < days; i++) p /= (1 + (rand() - 0.5) * vol * 2)
  const data = []
  const rand2 = seededRand(strSeed(sym + tf))
  for (let i = days; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const move = (rand2() - 0.48) * vol * 2
    const o = p, c = p * (1 + move)
    const h = Math.max(o, c) * (1 + rand2() * vol * 0.4)
    const l = Math.min(o, c) * (1 - rand2() * vol * 0.4)
    data.push({ time: d.toISOString().slice(0, 10), open: +o.toFixed(2), high: +h.toFixed(2), low: +l.toFixed(2), close: +c.toFixed(2) })
    p = c
  }
  if (data.length) {
    const last = data[data.length - 1]
    last.close = +price.toFixed(2)
    last.high = +(Math.max(last.high, price)).toFixed(2)
    last.low = +(Math.min(last.low, price)).toFixed(2)
  }
  return data
}
