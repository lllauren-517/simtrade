import { useState, useEffect } from 'react'

export default function Header({ priceStatus, lastUpdate, marketOpen, nav, initialCash }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('zh-TW', { hour12: false }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const ret = initialCash > 0 ? ((nav - initialCash) / initialCash) * 100 : 0
  const retColor = ret >= 0 ? '#4ade80' : '#f87171'
  const dotColor = priceStatus === 'live' ? '#4ade80' : priceStatus === 'error' ? '#f87171' : '#fbbf24'

  return (
    <header style={{
      background: '#0f1219',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <h1 style={{ fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>
        <span style={{ color: '#60a5fa' }}>Sim</span>Trade
      </h1>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* NAV */}
        <div style={{
          background: '#161c27',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: '#7f8ea4' }}>NAV</span>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 14, fontWeight: 600, color: retColor }}>
            {ret >= 0 ? '+' : ''}{ret.toFixed(2)}%
          </span>
        </div>

        {/* Market status */}
        <div style={{
          background: '#161c27',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: marketOpen ? '#4ade80' : '#fbbf24',
            animation: marketOpen ? 'pulse 2s infinite' : 'none',
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#7f8ea4', whiteSpace: 'nowrap' }}>
            {marketOpen ? '開盤中' : '休市'}
          </span>
        </div>

        {/* Price dot */}
        <div style={{
          background: '#161c27',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: dotColor,
            animation: priceStatus === 'live' ? 'pulse 2s infinite' : 'none',
            flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#7f8ea4', display: 'none' }}>
            {lastUpdate ? lastUpdate.toTimeString().slice(0, 5) : '—'}
          </span>
        </div>
      </div>
    </header>
  )
}
