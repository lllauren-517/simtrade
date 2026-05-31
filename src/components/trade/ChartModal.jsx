import { useEffect, useRef, useState } from 'react'
import { SECURITIES, TF_DAYS } from '../../lib/constants'
import { generateCandles } from '../../lib/utils'

const TF_LIST = ['1W', '1M', '3M', '6M', '1Y', '3Y']

export default function ChartModal({ symbol, prices, isOpen, onClose, onSelect }) {
  const containerRef = useRef(null)
  const chartRef     = useRef(null)
  const [tf, setTf]  = useState('1M')
  const [loading, setLoading] = useState(false)

  const info = symbol ? SECURITIES[symbol] : null
  const priceData = symbol ? (prices[symbol] ?? { price: info?.basePrice, changeRate: 0 }) : null
  const up = (priceData?.changeRate ?? 0) >= 0

  // Build/rebuild chart when modal opens or tf changes
  useEffect(() => {
    if (!isOpen || !symbol || !containerRef.current) return

    async function buildChart() {
      setLoading(true)
      // Dynamically import LightweightCharts
      const { createChart } = await import('lightweight-charts')

      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }

      const container = containerRef.current
      chartRef.current = createChart(container, {
        width:  container.clientWidth,
        height: container.clientHeight,
        layout: { background: { color: '#0f1218' }, textColor: '#7e8fa3' },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        rightPriceScale:  { borderColor: 'rgba(255,255,255,0.07)' },
        timeScale:        { borderColor: 'rgba(255,255,255,0.07)', timeVisible: true },
      })

      const series = chartRef.current.addCandlestickSeries({
        upColor:         '#3de89a', downColor:         '#f26b6b',
        borderUpColor:   '#3de89a', borderDownColor:   '#f26b6b',
        wickUpColor:     '#3de89a', wickDownColor:     '#f26b6b',
      })

      const candles = generateCandles(
        symbol,
        priceData.price,
        info.vol,
        TF_DAYS[tf]
      )
      series.setData(candles)
      chartRef.current.timeScale().fitContent()
      setLoading(false)
    }

    buildChart()

    return () => {
      if (chartRef.current) { chartRef.current.remove(); chartRef.current = null }
    }
  }, [isOpen, symbol, tf]) // eslint-disable-line

  // Handle resize
  useEffect(() => {
    if (!isOpen) return
    const ro = new ResizeObserver(() => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      }
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [isOpen])

  return (
    <div className={`chart-modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="chart-modal">
        <div className="modal-handle" />
        <div className="chart-modal-header">
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700 }}>
              {symbol} &nbsp;
              <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--sans)' }}>
                {info?.name}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
              {info?.type === 'etf' ? 'ETF · 交易稅 0.1%' : '個股 · 交易稅 0.3%'}
            </div>
          </div>
          <div style={{ textAlign: 'right', marginRight: 10 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 700, color: up ? 'var(--green)' : 'var(--red)' }}>
              {priceData?.price?.toFixed(priceData.price < 100 ? 2 : 0)}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: up ? 'var(--green)' : 'var(--red)' }}>
              {up ? '▲' : '▼'} {Math.abs(priceData?.changeRate ?? 0).toFixed(2)}%
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Timeframe bar */}
        <div className="tf-bar">
          {TF_LIST.map(t => (
            <button key={t} className={`tf-btn ${t === tf ? 'active' : ''}`} onClick={() => setTf(t)}>{t}</button>
          ))}
        </div>

        {/* Chart area */}
        <div className="chart-container" ref={containerRef}>
          {loading && (
            <div className="chart-loading">
              <div className="spinner" />
              <span>載入圖表中...</span>
            </div>
          )}
        </div>

        <div className="chart-modal-footer">
          <div className="btn-row">
            <button className="btn" onClick={onClose}>關閉</button>
            <button className="btn-primary btn" style={{ flex: 2 }} onClick={() => onSelect(symbol)}>
              選擇此商品下單 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
