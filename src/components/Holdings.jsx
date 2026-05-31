import { money, pct, fmt, cleanSym } from '../lib/utils'

function PositionCard({ position, security, onFillOrder }) {
  const cur = security ? security.price : position.avgPrice
  const cost = position.avgPrice * position.qty
  const mv = cur * position.qty
  const pnl = mv - cost
  const pnlPct = position.avgPrice > 0 ? ((cur - position.avgPrice) / position.avgPrice) * 100 : 0
  const clr = pnl >= 0 ? '#4ade80' : '#f87171'
  const isEtf = security?.grp === 'etf'

  return (
    <div
      onClick={() => onFillOrder?.(position.symbol, 'sell')}
      style={{
        padding: 14,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 16, fontWeight: 600 }}>
              {cleanSym(position.symbol)}
            </span>
            {isEtf
              ? <span style={{ fontSize: 10, background: 'rgba(45,212,191,.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,.25)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>ETF</span>
              : <span style={{ fontSize: 10, background: 'rgba(251,191,36,.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.25)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>個股</span>
            }
          </div>
          <div style={{ fontSize: 13, color: '#7f8ea4', marginTop: 2 }}>
            {security?.name || ''} · 持有 {position.qty} 股
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 16, fontWeight: 600, color: clr }}>
            {pnl >= 0 ? '+' : ''}{money(pnl).replace('$', '')}
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: clr }}>{pct(pnlPct)}</div>
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 6,
      }}>
        {[
          ['現價', fmt(cur)],
          ['均價', fmt(position.avgPrice)],
          ['市值', money(mv)],
          ['成本', money(cost)],
        ].map(([label, val]) => (
          <div key={label} style={{ fontSize: 13, color: '#7f8ea4' }}>
            {label} <span style={{ color: '#e1e8f4', fontFamily: 'IBM Plex Mono' }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Holdings({ portfolio, securities, onFillOrder }) {
  const { positions } = portfolio

  if (!positions.length) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#3e4d62', fontSize: 14 }}>
        目前無持股
      </div>
    )
  }

  return (
    <div>
      {positions.map(p => (
        <PositionCard
          key={p.symbol}
          position={p}
          security={securities[p.symbol]}
          onFillOrder={onFillOrder}
        />
      ))}
    </div>
  )
}
