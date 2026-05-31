import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { money, pct, fmt, cleanSym } from '../lib/utils'
import { usePortfolioContext } from '../context/PortfolioContext'

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: '#161c27', borderRadius: 10, padding: '14px 12px', minWidth: 0 }}>
      <div style={{ fontSize: 12, color: '#3e4d62', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 20, fontWeight: 600, color: color || '#e1e8f4', letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#3e4d62', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161c27', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
      <div style={{ color: '#7f8ea4', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontFamily: 'IBM Plex Mono' }}>
          {p.name}: {(+p.value >= 0 ? '+' : '')}{(+p.value).toFixed(2)}%
        </div>
      ))}
    </div>
  )
}

export default function RecordsPage() {
  const { portfolio, securities, calcNav, calcUnrealized, calcRealized } = usePortfolioContext()

  const nav = calcNav()
  const unrealized = calcUnrealized()
  const realized = calcRealized()
  const initialCash = portfolio.initialCash
  const totalPnl = unrealized + realized
  const retPct = initialCash > 0 ? (totalPnl / initialCash) * 100 : 0
  const winOrders = portfolio.orders.filter(o => o.side === 'sell')
  const winRate = winOrders.length > 0
    ? winOrders.filter(o => {
        const buyOrders = portfolio.orders.filter(b => b.symbol === o.symbol && b.side === 'buy')
        if (!buyOrders.length) return false
        const avgBuy = buyOrders.reduce((s, b) => s + b.price * b.qty, 0) / buyOrders.reduce((s, b) => s + b.qty, 0)
        return o.price > avgBuy
      }).length / winOrders.length * 100
    : null

  const maxDD = useMemo(() => {
    if (!portfolio.orders.length) return 0
    let peak = initialCash, maxDd = 0
    let cash = initialCash, positions = []
    const sorted = [...portfolio.orders].sort((a, b) => (a.settlement_date + a.time).localeCompare(b.settlement_date + b.time))
    sorted.forEach(o => {
      if (o.side === 'buy') {
        cash -= o.netAmount
        const ex = positions.find(p => p.symbol === o.symbol)
        if (ex) { ex.avgPrice = (ex.avgPrice * ex.qty + (o.amount + o.fee)) / (ex.qty + o.qty); ex.qty += o.qty }
        else positions.push({ symbol: o.symbol, qty: o.qty, avgPrice: (o.amount + o.fee) / o.qty })
      } else {
        cash += o.netAmount
        const pos = positions.find(p => p.symbol === o.symbol)
        if (pos) { pos.qty -= o.qty; if (pos.qty <= 0) positions = positions.filter(p => p.symbol !== o.symbol) }
      }
      const mv = positions.reduce((s, p) => {
        const sec = securities[p.symbol]
        return s + (sec ? sec.price : p.avgPrice) * p.qty
      }, 0)
      const curNav = cash + mv
      if (curNav > peak) peak = curNav
      const dd = peak > 0 ? (peak - curNav) / peak * 100 : 0
      if (dd > maxDd) maxDd = dd
    })
    return maxDd
  }, [portfolio.orders, securities, initialCash])

  const navChartData = useMemo(() => {
    const points = [{ date: '起始', ret: 0 }]
    let cash = initialCash, positions = []
    const sorted = [...portfolio.orders].sort((a, b) => (a.settlement_date + a.time).localeCompare(b.settlement_date + b.time))
    sorted.forEach((o, i) => {
      if (o.side === 'buy') {
        cash -= o.netAmount
        const ex = positions.find(p => p.symbol === o.symbol)
        if (ex) { ex.avgPrice = (ex.avgPrice * ex.qty + (o.amount + o.fee)) / (ex.qty + o.qty); ex.qty += o.qty }
        else positions.push({ symbol: o.symbol, qty: o.qty, avgPrice: (o.amount + o.fee) / o.qty })
      } else {
        cash += o.netAmount
        const pos = positions.find(p => p.symbol === o.symbol)
        if (pos) { pos.qty -= o.qty; if (pos.qty <= 0) positions = positions.filter(p => p.symbol !== o.symbol) }
      }
      const mv = positions.reduce((s, p) => {
        const sec = securities[p.symbol]
        return s + (sec ? sec.price : p.avgPrice) * p.qty
      }, 0)
      const curNav = cash + mv
      const ret = initialCash > 0 ? (curNav - initialCash) / initialCash * 100 : 0
      points.push({
        date: `#${i + 1} ${cleanSym(o.symbol)}`,
        ret: +ret.toFixed(2),
      })
    })
    return points
  }, [portfolio.orders, securities, initialCash])

  const Card = ({ title, children, style }) => (
    <div style={{
      background: '#0f1219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12,
      overflow: 'hidden', marginBottom: 12, ...style,
    }}>
      {title && (
        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase' }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  )

  return (
    <div style={{ padding: '12px 12px 32px', maxWidth: 1000, margin: '0 auto' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
        <StatCard label="累計總損益" value={money(totalPnl)} color={totalPnl >= 0 ? '#4ade80' : '#f87171'} sub={pct(retPct)} />
        <StatCard label="最大回撤" value={maxDD.toFixed(2) + '%'} color={maxDD > 10 ? '#f87171' : maxDD > 5 ? '#fbbf24' : '#4ade80'} />
        <StatCard label="已實現損益" value={money(realized)} color={realized >= 0 ? '#4ade80' : '#f87171'} />
        <StatCard label="未實現損益" value={money(unrealized)} color={unrealized >= 0 ? '#4ade80' : '#f87171'} />
        <StatCard label="總交易次數" value={`${portfolio.orders.length} 筆`} />
        {winRate != null && <StatCard label="勝率（賣出）" value={winRate.toFixed(1) + '%'} color={winRate >= 50 ? '#4ade80' : '#f87171'} />}
      </div>

      {navChartData.length > 1 && (
        <Card title="資產報酬走勢">
          <div style={{ padding: '12px 0 8px', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={navChartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#3e4d62', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#3e4d62', fontSize: 11, fontFamily: 'IBM Plex Mono' }} tickLine={false} axisLine={false} tickFormatter={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Line type="monotone" dataKey="ret" name="報酬率" stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#60a5fa' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card title={`交易紀錄 (${portfolio.orders.length} 筆)`}>
        {!portfolio.orders.length ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#3e4d62', fontSize: 14 }}>尚無交易紀錄</div>
        ) : (
          [...portfolio.orders].reverse().map(o => {
            const isBuy = o.side === 'buy'
            return (
              <div key={o.id} style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 15, fontWeight: 600 }}>{cleanSym(o.symbol)}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontFamily: 'IBM Plex Mono',
                        background: isBuy ? 'rgba(74,222,128,.12)' : 'rgba(248,113,113,.12)',
                        color: isBuy ? '#4ade80' : '#f87171',
                        border: `1px solid ${isBuy ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)'}`,
                      }}>{isBuy ? '買入' : '賣出'}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 7px', borderRadius: 5, fontWeight: 700, fontFamily: 'IBM Plex Mono',
                        background: o.grp === 'etf' ? 'rgba(45,212,191,.1)' : 'rgba(251,191,36,.1)',
                        color: o.grp === 'etf' ? '#2dd4bf' : '#fbbf24',
                        border: `1px solid ${o.grp === 'etf' ? 'rgba(45,212,191,.25)' : 'rgba(251,191,36,.25)'}`,
                      }}>{o.grp === 'etf' ? 'ETF' : '個股'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#7f8ea4' }}>
                      {o.settlement_date} {o.time} · {o.qty.toLocaleString()} 股 · 成交價 {fmt(o.price)}
                    </div>
                    <div style={{ fontSize: 12, color: '#3e4d62', marginTop: 2 }}>
                      手續費 {money(o.fee)} · 交易稅 {money(o.tax)}
                      {o.comment ? ` · ${o.comment}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, fontFamily: 'IBM Plex Mono', fontSize: 15, fontWeight: 600 }}>
                    {money(o.amount)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}