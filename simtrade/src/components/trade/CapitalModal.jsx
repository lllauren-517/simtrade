import { useState } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'

const PRESETS = [100_000, 500_000, 1_000_000, 3_000_000, 10_000_000]

export default function CapitalModal({ isOpen, onClose, toast }) {
  const { state, setCapital } = usePortfolio()
  const [input, setInput] = useState(String(state.capital))
  const canEdit = state.positions.length === 0 && state.orders.length === 0

  async function handleSave() {
    const amount = parseInt(input.replace(/,/g, ''))
    if (!amount || amount < 10000) { toast('請輸入有效金額（最低 10,000）', 'warn'); return }
    await setCapital(amount)
    toast(`資金已設定為 $${amount.toLocaleString()}`, 'success')
    onClose()
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal" style={{ maxHeight: '60vh' }}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span className="modal-title">💰 設定模擬資金</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {!canEdit && (
            <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-bd)', borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: 'var(--amber)' }}>
              ⚠ 已有持倉或交易紀錄，無法變更資金。請先重置後再調整。
            </div>
          )}
          <div className="form-row">
            <label className="form-label">資金金額（新台幣）</label>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!canEdit}
              min={10000}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {PRESETS.map(p => (
              <button
                key={p}
                className="btn btn-sm"
                style={{ flex: 'none' }}
                disabled={!canEdit}
                onClick={() => setInput(String(p))}
              >
                ${(p / 10000).toFixed(0)}萬
              </button>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <div className="btn-row">
            <button className="btn" onClick={onClose}>取消</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={!canEdit}>
              確認設定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
