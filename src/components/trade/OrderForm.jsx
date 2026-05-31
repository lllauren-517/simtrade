import { useState, useEffect } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { SECURITIES } from '../../lib/constants'
import { fmtMoney, fmtPrice } from '../../lib/utils'

export default function OrderForm({ activeGroup, prices, preselected, onOrderDone, toast }) {
  const { state, executeOrder } = usePortfolio()
  const [side, setSide]     = useState('buy')
  const [symbol, setSymbol] = useState(preselected || '')
  const [qty, setQty]       = useState(100)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  // When preselected symbol changes, update form
  useEffect(() => {
    if (preselected) setSymbol(preselected)
  }, [preselected])

  const symbols = Object.keys(SECURITIES).filter(s => SECURITIES[s].type === activeGroup)
  const priceData = symbol ? (prices[symbol] ?? { price: SECURITIES[symbol]?.basePrice }) : null
  const currentPrice = priceData?.price ?? 0
  const estimatedAmt = currentPrice * qty

  const maxQty = () => {
    if (side === 'buy') return Math.floor(state.cash / currentPrice)
    const pos = state.positions.find(p => p.symbol === symbol)
    return pos ? pos.qty : 0
  }

  async function handleSubmit() {
    if (!symbol)          { toast('請選擇商品', 'warn'); return }
    if (!qty || qty < 1)  { toast('請輸入有效數量', 'warn'); return }
    if (!reason.trim())   { toast('請填寫交易理由（至少一句話）', 'warn'); return }

    if (side === 'buy' && state.cash < estimatedAmt) {
      toast('資金不足', 'danger'); return
    }
    if (side === 'sell') {
      const pos = state.positions.find(p => p.symbol === symbol)
      if (!pos || pos.qty < qty) { toast('持股不足', 'danger'); return }
    }

    setLoading(true)
    try {
      await executeOrder(symbol, qty, side, currentPrice, reason)
      toast(`${side === 'buy' ? '買入' : '賣出'} ${symbol} × ${qty} 已執行`, 'success')
      setQty(100); setReason('')
      onOrderDone?.()
    } catch(e) {
      toast('下單失敗：' + e.message, 'danger')
    }
    setLoading(false)
  }

  return (
    <div className="card-body">
      {/* Direction */}
      <div className="dir-toggle">
        <div className={`dir-btn ${side === 'buy' ? 'active-buy' : ''}`} onClick={() => setSide('buy')}>▲ 買入</div>
        <div className={`dir-btn ${side === 'sell' ? 'active-sell' : ''}`} onClick={() => setSide('sell')}>▼ 賣出</div>
      </div>

      {/* Symbol */}
      <div className="form-row">
        <label className="form-label">選擇商品</label>
        <select value={symbol} onChange={e => setSymbol(e.target.value)}>
          <option value="">— 請選擇 —</option>
          {symbols.map(s => (
            <option key={s} value={s}>{s} — {SECURITIES[s].name}</option>
          ))}
        </select>
      </div>

      {/* Qty */}
      <div className="form-row">
        <label className="form-label">
          數量（股）
          {symbol && (
            <span style={{ color: 'var(--text3)', fontWeight: 400, marginLeft: 8 }}>
              最多可{side === 'buy' ? '買' : '賣'} {maxQty().toLocaleString()} 股
            </span>
          )}
        </label>
        <input type="number" value={qty} min={1}
          onChange={e => setQty(parseInt(e.target.value) || 0)} inputMode="numeric" />
      </div>

      {/* Price / Amount */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 11 }}>
        <div>
          <div className="form-label">參考報價</div>
          <input readOnly value={symbol ? fmtPrice(currentPrice) : '—'} />
        </div>
        <div>
          <div className="form-label">預估金額</div>
          <input readOnly value={symbol && qty ? fmtMoney(estimatedAmt) : '—'}
            style={{ color: 'var(--teal)', fontFamily: 'var(--mono)' }} />
        </div>
      </div>

      {/* Reason */}
      <div className="form-row">
        <label className="form-label">交易理由 <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(必填)</span></label>
        <textarea
          placeholder="例：技術面突破壓力區，配合量能放大，預計持有 2 週..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </div>

      <button
        className={`btn ${side === 'buy' ? 'btn-success' : 'btn-danger'} btn-full`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '執行中...' : (side === 'buy' ? '✓ 確認買入' : '✓ 確認賣出')}
      </button>
    </div>
  )
}
