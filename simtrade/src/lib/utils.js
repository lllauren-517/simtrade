// ── 格式化 ──
export const fmtNum  = n => n?.toLocaleString('zh-TW', { maximumFractionDigits: 0 }) ?? '—';
export const fmtMoney = n => n == null ? '—' : '$' + fmtNum(Math.round(n));
export const fmtPct  = (n, decimals = 2) =>
  n == null ? '—' : (n >= 0 ? '+' : '') + n.toFixed(decimals) + '%';
export const fmtPrice = p => p == null ? '—' : p.toFixed(p < 100 ? 2 : 0);
export const uid     = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
export const nowTime = () => new Date().toTimeString().slice(0, 8);
export const todayISO = () => new Date().toISOString().slice(0, 10);

// ── 投資組合計算 ──
export function calcNAV(cash, positions, prices) {
  const mv = positions.reduce((sum, p) => {
    const price = prices[p.symbol]?.price ?? p.avgPrice;
    return sum + price * p.qty;
  }, 0);
  return cash + mv;
}

export function calcMaxDrawdown(navHistory) {
  let peak = 0, maxDD = 0;
  for (const nav of navHistory) {
    if (nav > peak) peak = nav;
    const dd = peak > 0 ? (peak - nav) / peak * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export function calcSharpe(returns) {
  if (returns.length < 2) return null;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((s, r) => s + (r - avg) ** 2, 0) / returns.length);
  return std > 0 ? +(avg / std * Math.sqrt(252)).toFixed(2) : null;
}

export function calcPnLColor(n) {
  if (n > 0) return 'var(--green)';
  if (n < 0) return 'var(--red)';
  return 'var(--text)';
}

// ── 模擬 K 線 ──
function seededRand(seed) {
  let s = seed;
  return () => { s = Math.imul(48271, s) | 0; return (s & 0x7fffffff) / 0x7fffffff; };
}
function strToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h) || 1;
}

export function generateCandles(symbol, currentPrice, vol, tfDays) {
  const rand = seededRand(strToSeed(symbol + tfDays));
  const dailyVol = vol / Math.sqrt(252);
  let price = currentPrice;
  // 往回推算起始價
  for (let i = 0; i < tfDays; i++) price /= (1 + (rand() - 0.5) * dailyVol * 2);

  const rand2 = seededRand(strToSeed(symbol + tfDays));
  const candles = [];
  for (let i = tfDays; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const move = (rand2() - 0.48) * dailyVol * 2;
    const open = price, close = price * (1 + move);
    const high = Math.max(open, close) * (1 + rand2() * dailyVol * 0.5);
    const low  = Math.min(open, close) * (1 - rand2() * dailyVol * 0.5);
    candles.push({ time: d.toISOString().slice(0, 10), open, high, low, close });
    price = close;
  }
  // 最後一根收盤 = 當前價
  if (candles.length) {
    const last = candles.at(-1);
    last.close = currentPrice;
    last.high  = Math.max(last.high, currentPrice);
    last.low   = Math.min(last.low,  currentPrice);
  }
  return candles;
}
