import { useMemo } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtMoney, fmtPct, calcMaxDrawdown, calcSharpe } from '../../lib/utils'
import MetricCard from '../shared/MetricCard'

export default function StatsCards({ prices }) {
  const { state } = usePortfolio()
  const { cash, positions, capital, navHistory, returns, orders } = state

  const nav = useMemo(() => (
    positions.reduce((s, p) => s + (prices[p.symbol]?.price ?? p.avgPrice) * p.qty, cash)
  ), [positions, cash, prices])

  const totalRet  = capital > 0 ? (nav - capital) / capital * 100 : 0
  const maxDD     = calcMaxDrawdown(navHistory)
  const sharpe    = calcSharpe(returns)
  const execCount = orders.filter(o => o.status === 'executed').length

  const winOrders = orders.filter(o => {
    if (o.status !== 'executed' || o.side !== 'sell') return false
    const pos = state.positions.find(p => p.symbol === o.symbol)
    return (o.price - (pos?.avgPrice ?? o.price)) > 0
  })

  const retColor = totalRet >= 0 ? 'up' : 'down'

  return (
    <>
      <div className="metric-grid">
        <MetricCard
          label="投資組合 NAV"
          value={fmtMoney(nav)}
          sub={`初始 ${fmtMoney(capital)}`}
          color={retColor}
        />
        <MetricCard
          label="累計報酬率"
          value={fmtPct(totalRet)}
          sub={`損益 ${totalRet >= 0 ? '+' : ''}${fmtMoney(nav - capital)}`}
          color={retColor}
        />
      </div>
      <div className="metric-grid cols3">
        <MetricCard
          label="最大回撤"
          value={maxDD.toFixed(2) + '%'}
          color={maxDD > 15 ? 'down' : maxDD > 8 ? 'warn' : 'up'}
          size="sm"
        />
        <MetricCard
          label="Sharpe"
          value={sharpe ?? '—'}
          color={sharpe == null ? 'neutral' : sharpe > 1 ? 'up' : sharpe > 0 ? 'neutral' : 'down'}
          size="sm"
        />
        <MetricCard
          label="成交筆數"
          value={execCount}
          sub="筆"
          color="neutral"
          size="sm"
        />
      </div>
    </>
  )
}
