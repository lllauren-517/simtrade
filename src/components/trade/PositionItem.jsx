import { SECURITIES } from '../../lib/constants'
import { fmtPrice, fmtMoney, fmtPct, calcPnLColor } from '../../lib/utils'

export default function PositionItem({ position, prices, nav, onClose }) {
  const { symbol, qty, avgPrice } = position
  const info = SECURITIES[symbol]
  const cur  = prices[symbol]?.price ?? avgPrice
  const pnl  = (cur - avgPrice) * qty
  const pnlPct = (cur - avgPrice) / avgPrice * 100
  const mv   = cur * qty
  const wt   = nav > 0 ? (mv / nav * 100).toFixed(1) : 0
  const cl   = calcPnLColor(pnl)
  const type = info?.type ?? 'stock'

  return (
    <div className="pos-item">
      <div className="pos-top">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pos-sym">{symbol}</span>
            <span className={`badge badge-${type}`}>{type === 'etf' ? 'ETF' : '個股'}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{info?.name}</div>
        </div>
        <div className="pos-pnl" style={{ color: cl }}>
          {pnl >= 0 ? '+' : ''}{Math.round(pnl).toLocaleString()}
          <div style={{ fontSize: 10 }}>{fmtPct(pnlPct)}</div>
        </div>
      </div>
      <div className="pos-detail">
        <div className="pos-detail-item">持有 <span>{qty.toLocaleString()}</span></div>
        <div className="pos-detail-item">均價 <span>{fmtPrice(avgPrice)}</span></div>
        <div className="pos-detail-item">現價 <span style={{ color: cl }}>{fmtPrice(cur)}</span></div>
        <div className="pos-detail-item">市值 <span>{fmtMoney(mv)}</span></div>
        <div className="pos-detail-item">倉位 <span>{wt}%</span></div>
      </div>
      <div className="pos-actions">
        <button className="btn btn-sm" style={{ flex: 1 }}
          onClick={() => onClose(symbol, Math.ceil(qty / 2), 'half')}>
          賣出一半
        </button>
        <button className="btn btn-sm btn-danger" style={{ flex: 1 }}
          onClick={() => onClose(symbol, qty, 'all')}>
          全部賣出
        </button>
      </div>
    </div>
  )
}
