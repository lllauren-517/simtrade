import { useEffect, useRef, useState } from 'react'
import { SECURITIES } from '../../lib/constants'
import { fmtPrice } from '../../lib/utils'

export default function TickerRow({ symbol, priceData, onClick }) {
  const info = SECURITIES[symbol]
  const { price, changeRate } = priceData
  const prevRef = useRef(price)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    if (prevRef.current === price) return
    const dir = price > prevRef.current ? 'flash-up' : 'flash-down'
    prevRef.current = price
    setFlash(dir)
    const t = setTimeout(() => setFlash(''), 700)
    return () => clearTimeout(t)
  }, [price])

  const up = changeRate >= 0
  const clr = up ? 'var(--green)' : 'var(--red)'

  return (
    <div className={`ticker-row ${flash}`} data-symbol={symbol} onClick={() => onClick(symbol)}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ticker-sym">{symbol}</div>
        <div className="ticker-name">{info?.name}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="ticker-price" style={{ color: clr }}>{fmtPrice(price)}</div>
        <div className="ticker-chg" style={{ color: clr }}>
          {up ? '▲' : '▼'} {Math.abs(changeRate).toFixed(2)}%
        </div>
      </div>
      <div className="ticker-arrow">›</div>
    </div>
  )
}
