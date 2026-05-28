import { usePortfolio } from '../../context/PortfolioContext'
import { SECURITIES } from '../../lib/constants'
import { fmtMoney, fmtPrice } from '../../lib/utils'

export default function OrderHistoryList({ filter }) {
  const { state } = usePortfolio()
  const orders = [...(state.orders ?? [])]
    .filter(o => !filter || SECURITIES[o.symbol]?.type === filter)
    .reverse()

  if (!orders.length) return <div className="empty-state">尚無交易紀錄</div>

  return (
    <>
      {orders.map(o => {
        const type = SECURITIES[o.symbol]?.type ?? 'stock'
        return (
          <div key={o.id} className="order-item">
            <div className="order-top">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className="order-sym">{o.symbol}</span>
                  <span className={`badge badge-${o.side}`}>{o.side === 'buy' ? '買入' : '賣出'}</span>
                  <span className={`badge badge-${type}`}>{type === 'etf' ? 'ETF' : '個股'}</span>
                  <span className="badge badge-exec">成交</span>
                </div>
                <div className="order-meta">
                  {o.qty.toLocaleString()} 股 @ {fmtPrice(o.price)} · {o.time}
                </div>
                {o.tax > 0 && (
                  <div className="order-meta" style={{ color: 'var(--amber)' }}>
                    交易稅 ${o.tax.toLocaleString()}
                  </div>
                )}
                {o.reason && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, fontStyle: 'italic' }}>
                    💬 {o.reason}
                  </div>
                )}
              </div>
              <div className="order-amount">{fmtMoney(o.amount)}</div>
            </div>
          </div>
        )
      })}
    </>
  )
}
