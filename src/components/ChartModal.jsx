import { useEffect, useRef, useState } from 'react'
import { generateCandles } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { fmt, pct, cleanSym } from '../lib/utils'

const TF_LIST = ['1W', '1M', '3M', '6M', '1Y']
const TF_PARAMS = {
  '1W': { range: '5d',  interval: '1d' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y',  interval: '1wk' },
}

export default function ChartModal({ symbol, security, onClose, onSelectForTrade }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const [tf, setTf] = useState('1M')
  const [loading, setLoading] = useState(true)
  const cacheRef = useRef({})

  const buildChart = async (sym, tf) => {
    if (!containerRef.current || !window.LightweightCharts) return
    setLoading(true)

    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const container = containerRef.current
    const chart = window.LightweightCharts.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: { background: { color: '#0f1219' }, textColor: '#7f8ea4' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: { mode: window.LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true },
    })
    chartRef.current = chart

    const series = chart.addCandlestickSeries({
      upColor: '#4ade80',   downColor: '#f87171',
      borderUpColor: '#4ade80', borderDownColor: '#f87171',
      wickUpColor: '#4ade80',   wickDownColor: '#f87171',
    })

    let data = cacheRef.current[sym + tf]
    if (!data) {
      try {
        const { range, interval } = TF_PARAMS[tf]
        const { data: res } = await supabase.functions.invoke('history-function', {
          body: { symbol: sym, range, interval }
        })
        if (res?.candles?.length) {
          data = res.candles
          cacheRef.current[sym + tf] = data
        }
      } catch {}
    }

    if (!data) data = generateCandles(sym, security?.price || 100, tf)

    series.setData(data)
    chart.timeScale().fitContent()
    setLoading(false)


    const ro = new ResizeObserver(() => {
      if (chart && container) chart.applyOptions({ width: container.clientWidth, height: container.clientHeight })
    })
    ro.observe(container)
    return () => ro.disconnect()
  }

  useEffect(() => {
    if (!symbol || !security) return
    const cleanup = buildChart(symbol, tf)
    return () => {
      cleanup?.then?.(fn => fn?.())
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }
    }
  }, [symbol, tf])

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!symbol || !security) return null
  const chgRate = security.changeRate ?? 0
  const clr = chgRate >= 0 ? '#4ade80' : '#f87171'

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.8)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#0f1219',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px 16px 0 0',
        width: '100%',
        maxWidth: 900,
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp .25s ease',
      }}>

        <div style={{ width: 40, height: 5, background: '#1d2535', borderRadius: 3, margin: '10px auto 0' }} />


        <div style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 700 }}>
              {cleanSym(symbol)} <span style={{ fontFamily: 'Noto Sans TC', fontWeight: 400, fontSize: 14, color: '#7f8ea4' }}>{security.name}</span>
            </div>
            <div style={{ fontSize: 13, color: '#7f8ea4', marginTop: 2 }}>
              {security.grp === 'etf' ? 'ETF · 交易稅 0.1%' : '個股 · 交易稅 0.3%'}
            </div>
          </div>
          <div style={{ textAlign: 'right', marginRight: 12 }}>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 22, fontWeight: 700, color: clr }}>{fmt(security.price)}</div>
            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: clr }}>{pct(chgRate)}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1d2535', border: '1px solid rgba(255,255,255,0.1)',
              color: '#e1e8f4', width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, cursor: 'pointer', flexShrink: 0,
            }}
          >✕</button>
        </div>

        <div style={{
          display: 'flex', gap: 6, padding: '10px 16px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          overflowX: 'auto',
        }}>
          {TF_LIST.map(t => (
            <button
              key={t}
              onClick={() => setTf(t)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontFamily: 'IBM Plex Mono',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                background: tf === t ? 'rgba(96,165,250,0.12)' : '#161c27',
                border: `1px solid ${tf === t ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: tf === t ? '#60a5fa' : '#7f8ea4',
                transition: 'all .15s',
              }}
            >{t}</button>
          ))}
        </div>

        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(15,18,25,.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 10, zIndex: 10,
            }}>
              <div style={{
                width: 28, height: 28,
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#60a5fa',
                borderRadius: '50%',
                animation: 'spin .7s linear infinite',
              }} />
              <div style={{ fontSize: 13, color: '#7f8ea4' }}>載入中...</div>
            </div>
          )}
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                background: '#161c27', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e1e8f4', padding: '12px 20px', borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Noto Sans TC',
              }}
            >關閉</button>
            <button
              onClick={() => { onClose(); onSelectForTrade(symbol) }}
              style={{
                flex: 1, background: '#60a5fa', border: 'none',
                color: '#090b0f', padding: '12px 20px', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans TC',
              }}
            >帶入下單</button>
          </div>
        </div>
      </div>
    </div>
  )
}
