import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtMoney } from '../../lib/utils'
import StatsCards        from './StatsCards'
import OrderHistoryList  from './OrderHistoryList'

Chart.register(...registerables)

export default function HistoryPanel({ prices, toast }) {
  const { state, resetAll } = usePortfolio()
  const [filter, setFilter] = useState(null) // null = all, 'etf', 'stock'
  const navChartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  // NAV mini chart
  useEffect(() => {
    if (!navChartRef.current) return
    const canvas = navChartRef.current
    const ctx = canvas.getContext('2d')
    const history = state.navHistory
    if (history.length < 2) return

    if (chartInstanceRef.current) chartInstanceRef.current.destroy()
    chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: history.map((_, i) => i === 0 ? '開始' : `T${i}`),
          datasets: [{
            label: 'NAV',
            data: history.map(Math.round),
            borderColor: '#3de89a',
            backgroundColor: 'rgba(61,232,154,0.07)',
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.35,
            fill: true,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#3d4f63', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#3d4f63', font: { size: 10 }, callback: v => '$' + Math.round(v / 10000) + 'w' } },
          }
        }
      })
  }, [state.navHistory])

  function exportCSV() {
    const exec = state.orders.filter(o => o.status === 'executed')
    if (!exec.length) { toast('尚無成交紀錄可匯出', 'warn'); return }

    const rows = [
      ['時間', '商品', '名稱', '方向', '數量', '成交價', '成交金額', '交易稅', '交易理由'],
      ...exec.map(o => [
        o.time, o.symbol, o.name,
        o.side === 'buy' ? '買入' : '賣出',
        o.qty, o.price, Math.round(o.amount),
        o.tax ?? 0, `"${(o.reason || '').replace(/"/g, '""')}"`
      ])
    ]
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `SimTrade_${new Date().toISOString().slice(0, 10)}.csv`
    })
    a.click(); URL.revokeObjectURL(url)
    toast('CSV 已匯出', 'success')
  }

  async function handleReset() {
    if (!confirm('確定重置全部資料？此操作無法復原。')) return
    await resetAll()
    toast('已重置', 'info')
  }

  return (
    <div id="panel-history" className="panel active">

      {/* Performance stats */}
      <StatsCards prices={prices} />

      {/* NAV chart */}
      {state.navHistory.length > 2 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">NAV 走勢</span>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              <canvas ref={navChartRef} />
            </div>
          </div>
        </div>
      )}

      {/* Holdings breakdown */}
      {state.positions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">期末持倉（未實現）</span>
          </div>
          {state.positions.map(p => {
            const cur = prices[p.symbol]?.price ?? p.avgPrice
            const pnl = (cur - p.avgPrice) * p.qty
            const pnlPct = (cur - p.avgPrice) / p.avgPrice * 100
            const cl = pnl >= 0 ? 'var(--green)' : 'var(--red)'
            return (
              <div key={p.symbol} className="info-row" style={{ padding: '9px 13px' }}>
                <div>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{p.symbol}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>× {p.qty.toLocaleString()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', color: cl, fontWeight: 600 }}>
                    {pnl >= 0 ? '+' : ''}{Math.round(pnl).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: cl }}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order history */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">交易紀錄</span>
          <button className="btn btn-sm btn-primary" onClick={exportCSV}>📄 匯出 CSV</button>
        </div>
        {/* Filter */}
        <div style={{ padding: '8px 13px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6 }}>
          {[null, 'etf', 'stock'].map(f => (
            <button key={f ?? 'all'}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
              onClick={() => setFilter(f)}>
              {f === null ? '全部' : f === 'etf' ? 'ETF' : '個股'}
            </button>
          ))}
        </div>
        <OrderHistoryList filter={filter} />
      </div>

      {/* Reset */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ color: 'var(--red)' }}>重置模擬</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 11 }}>
            清除所有交易紀錄與持倉，重新開始模擬。
          </p>
          <button className="btn btn-danger btn-full" onClick={handleReset}>⚠ 全部重置</button>
        </div>
      </div>
    </div>
  )
}
