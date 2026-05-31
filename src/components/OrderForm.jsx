import { useState, useEffect } from 'react'
import { DEFAULT_SECURITIES } from '../lib/supabase'
import { fmt, money, calcCosts, cleanSym } from '../lib/utils'
import { toast } from './Toast'

export default function OrderForm({ securities, portfolio, onPlaceOrder, prefillSymbol, onPrefillUsed }) {
  const [symbol, setSymbol] = useState('')
  const [side, setSide] = useState('buy')
  const [qty, setQty] = useState('1000')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Prefill from chart modal
  useEffect(() => {
    if (prefillSymbol) {
      setSymbol(prefillSymbol)
      onPrefillUsed?.()
    }
  }, [prefillSymbol])

  const sec = securities[symbol] || null
  const price = sec?.price || 0
  const amount = Math.round(price * (parseInt(qty) || 0))
  const { fee, tax, net } = amount > 0 ? calcCosts(amount, side, symbol, sec?.grp) : { fee: 0, tax: 0, net: 0 }

  const pos = portfolio.positions.find(p => p.symbol === symbol)
  const maxSell = pos?.qty || 0

  const handleSubmit = async () => {
    if (!symbol) { toast('請選擇商品', 'warn'); return }
    if (!sec)    { toast('找不到商品報價', 'warn'); return }
    const qtyNum = parseInt(qty)
    if (!qtyNum || qtyNum < 1) { toast('請輸入有效數量', 'warn'); return }
    if (side === 'buy' && net > portfolio.cash) { toast('現金不足', 'danger'); return }
    if (side === 'sell' && qtyNum > maxSell) { toast(`持股不足，最多可賣 ${maxSell} 股`, 'danger'); return }

    setSubmitting(true)
    try {
      await onPlaceOrder({ symbol, qty: qtyNum, side, comment })
      toast(`${side === 'buy' ? '買入' : '賣出'} ${cleanSym(symbol)} 成功！`, 'success')
      setQty('1000')
      setComment('')
    } catch (e) {
      toast(e.message || '下單失敗', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const InputField = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#e1e8f4', display: 'block', marginBottom: 6, letterSpacing: .3 }}>
        {label}
      </label>
      {children}
    </div>
  )

  const inputStyle = {
    width: '100%',
    background: '#161c27',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e1e8f4',
    borderRadius: 10,
    padding: '11px 14px',
    fontFamily: 'Noto Sans TC',
    fontSize: 16,
    outline: 'none',
    WebkitAppearance: 'none',
  }

  return (
    <div style={{ padding: '14px 14px 24px' }}>

      {/* Buy / Sell toggle */}
      <div style={{
        display: 'flex',
        background: '#161c27',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        {[
          { id: 'buy',  label: '▲ 買入', activeStyle: { background: 'rgba(74,222,128,.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,.3)' } },
          { id: 'sell', label: '▼ 賣出', activeStyle: { background: 'rgba(248,113,113,.12)', color: '#f87171', border: '1px solid rgba(248,113,113,.3)' } },
        ].map(({ id, label, activeStyle }) => (
          <div
            key={id}
            onClick={() => setSide(id)}
            style={{
              flex: 1, padding: '12px', textAlign: 'center',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              transition: 'all .15s',
              color: side === id ? activeStyle.color : '#3e4d62',
              background: side === id ? activeStyle.background : 'transparent',
              borderRadius: 10,
            }}
          >{label}</div>
        ))}
      </div>

      {/* Symbol selector */}
      <InputField label="選擇商品">
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          style={{
            ...inputStyle,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='10' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237f8ea4' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: 36,
          }}
        >
          <option value="">請選擇商品...</option>
          <optgroup label="ETF">
            {DEFAULT_SECURITIES.filter(d => d.grp === 'etf').map(d => (
              <option key={d.symbol} value={d.symbol}>{cleanSym(d.symbol)} {d.name}</option>
            ))}
          </optgroup>
          <optgroup label="個股">
            {DEFAULT_SECURITIES.filter(d => d.grp === 'stock').map(d => (
              <option key={d.symbol} value={d.symbol}>{cleanSym(d.symbol)} {d.name}</option>
            ))}
          </optgroup>
        </select>
        {sec && (
          <div style={{ marginTop: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: '#4ade80' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            現價 <strong style={{ fontFamily: 'IBM Plex Mono' }}>{fmt(sec.price)}</strong>
            <span style={{ color: sec.changeRate >= 0 ? '#4ade80' : '#f87171', fontFamily: 'IBM Plex Mono' }}>
              {sec.changeRate >= 0 ? '▲' : '▼'} {Math.abs(sec.changeRate ?? 0).toFixed(2)}%
            </span>
          </div>
        )}
        {side === 'sell' && pos && (
          <div style={{ marginTop: 4, fontSize: 12, color: '#60a5fa' }}>
            可賣：{pos.qty} 股
          </div>
        )}
      </InputField>

      {/* Qty */}
      <InputField label="數量（股）">
        <input
          type="number"
          value={qty}
          min="1"
          inputMode="numeric"
          onChange={e => setQty(e.target.value)}
          style={inputStyle}
        />
      </InputField>

      {/* Price info */}
      {sec && amount > 0 && (
        <div style={{
          background: '#0f1219',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
          padding: 12,
          marginBottom: 14,
        }}>
          {[
            ['成交金額', money(amount)],
            ['手續費', money(fee)],
            ['交易稅', money(tax)],
            [side === 'buy' ? '應付金額' : '實收金額', money(net), side === 'buy' ? '#f87171' : '#4ade80'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
              <span style={{ color: '#7f8ea4' }}>{label}</span>
              <span style={{ fontFamily: 'IBM Plex Mono', fontWeight: 600, color: color || '#e1e8f4' }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comment */}
      <InputField label="交易備註（選填）">
        <input
          type="text"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="例如：長期持有、技術突破..."
          style={inputStyle}
        />
      </InputField>

      {/* Cash info */}
      <div style={{ fontSize: 13, color: '#7f8ea4', marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
        <span>可用現金</span>
        <span style={{ fontFamily: 'IBM Plex Mono', color: '#e1e8f4' }}>{money(portfolio.cash)}</span>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          background: side === 'buy' ? '#4ade80' : '#f87171',
          border: 'none',
          color: '#090b0f',
          padding: '14px',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 700,
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          fontFamily: 'Noto Sans TC',
          transition: 'opacity .15s',
        }}
      >
        {submitting ? '處理中...' : `確認${side === 'buy' ? '買入' : '賣出'}`}
      </button>
    </div>
  )
}
