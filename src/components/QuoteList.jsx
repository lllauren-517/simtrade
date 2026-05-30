import { fmt, pct, cleanSym } from '../lib/utils'

function TickerRow({ symbol, security, isHeld, onClick }) {
  const chgRate = security.changeRate ?? 0
  const clr = chgRate === 0 ? '#e1e8f4' : chgRate > 0 ? '#4ade80' : '#f87171'
  const sign = chgRate === 0 ? '•' : chgRate > 0 ? '▲' : '▼'

  return (
    <div
      onClick={() => onClick(symbol)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        cursor: 'pointer',
        background: isHeld ? 'rgba(96,165,250,0.06)' : 'transparent',
        boxShadow: isHeld ? 'inset 3px 0 0 #60a5fa' : 'none',
        transition: 'background .1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = isHeld ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = isHeld ? 'rgba(96,165,250,0.06)' : 'transparent'}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          {cleanSym(symbol)}
          {security.grp === 'etf'
            ? <span style={{ fontSize: 10, background: 'rgba(45,212,191,.1)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,.25)', padding: '1px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>ETF</span>
            : <span style={{ fontSize: 10, background: 'rgba(251,191,36,.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.25)', padding: '1px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>個股</span>
          }
        </div>
        <div style={{ fontSize: 13, color: '#7f8ea4', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {security.name}{isHeld ? ' · 已持有' : ''}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 600, color: clr }}>{fmt(security.price)}</div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: clr, marginTop: 2 }}>{sign} {Math.abs(chgRate).toFixed(2)}%</div>
      </div>
    </div>
  )
}

export default function QuoteList({ securities, positions, onTickerClick }) {
  const held = new Set((positions || []).map(p => p.symbol))

  const etfs  = Object.entries(securities).filter(([, s]) => s.grp === 'etf')
  const stocks = Object.entries(securities).filter(([, s]) => s.grp === 'stock')

  const SectionLabel = ({ label }) => (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 1,
      padding: '8px 14px 6px',
      color: '#3e4d62',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>{label}</div>
  )

  return (
    <div>
      <SectionLabel label="ETF" />
      {etfs.map(([sym, s]) => (
        <TickerRow key={sym} symbol={sym} security={s} isHeld={held.has(sym)} onClick={onTickerClick} />
      ))}
      <SectionLabel label="個股" />
      {stocks.map(([sym, s]) => (
        <TickerRow key={sym} symbol={sym} security={s} isHeld={held.has(sym)} onClick={onTickerClick} />
      ))}
    </div>
  )
}
