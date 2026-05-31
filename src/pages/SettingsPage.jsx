import { useState } from 'react'
import { money } from '../lib/utils'
import { toast } from '../components/Toast'

export default function SettingsPage({ portfolio, onUpdateCash, onReset }) {
  const [cashInput, setCashInput] = useState(portfolio.initialCash.toString())
  const [saving, setSaving] = useState(false)

  const handleSaveCash = async () => {
    const val = parseInt(cashInput.replace(/[^\d]/g, ''))
    if (!val || val < 10000) { toast('最低資金為 $10,000', 'warn'); return }
    if (val > 100_000_000) { toast('最高資金為 $1億', 'warn'); return }
    setSaving(true)
    try {
      await onUpdateCash(val)
      toast(`初始資金已更新為 ${money(val)}`, 'success')
    } catch {
      toast('更新失敗', 'danger')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('確定重置所有交易紀錄？此操作無法復原。')) return
    await onReset()
    toast('已重置所有交易紀錄', 'info')
  }

  const inputStyle = {
    width: '100%',
    background: '#161c27',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e1e8f4',
    borderRadius: 10,
    padding: '11px 14px',
    fontFamily: 'IBM Plex Mono',
    fontSize: 16,
    outline: 'none',
  }

  const Card = ({ title, children }) => (
    <div style={{
      background: '#0f1219', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 12,
    }}>
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ padding: '14px' }}>{children}</div>
    </div>
  )

  const presets = [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]

  return (
    <div style={{ padding: '12px 12px 32px', maxWidth: 600, margin: '0 auto' }}>

      {/* Current summary */}
      <Card title="資產概況">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['初始資金', money(portfolio.initialCash)],
            ['可用現金', money(portfolio.cash)],
            ['持股數', `${portfolio.positions.length} 檔`],
            ['成交次數', `${portfolio.orders.length} 筆`],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#161c27', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 12, color: '#3e4d62', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 17, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Initial cash setting */}
      <Card title="調整初始資金">
        <div style={{ fontSize: 13, color: '#7f8ea4', marginBottom: 12, lineHeight: 1.6 }}>
          調整模擬交易的總資金。建議在無持股的狀態下修改。
        </div>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#e1e8f4' }}>
          初始資金金額
        </label>
        <input
          type="number"
          value={cashInput}
          onChange={e => setCashInput(e.target.value)}
          style={inputStyle}
          placeholder="例如：1000000"
        />
        {/* Presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 14 }}>
          {presets.map(v => (
            <button
              key={v}
              onClick={() => setCashInput(v.toString())}
              style={{
                background: parseInt(cashInput) === v ? 'rgba(96,165,250,0.15)' : '#161c27',
                border: `1px solid ${parseInt(cashInput) === v ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: parseInt(cashInput) === v ? '#60a5fa' : '#7f8ea4',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'IBM Plex Mono',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >{money(v)}</button>
          ))}
        </div>
        <button
          onClick={handleSaveCash}
          disabled={saving}
          style={{
            width: '100%',
            background: '#60a5fa',
            border: 'none',
            color: '#090b0f',
            padding: '12px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            fontFamily: 'Noto Sans TC',
          }}
        >{saving ? '儲存中...' : '儲存設定'}</button>
      </Card>

      {/* About */}
      <Card title="關於 SimTrade">
        <div style={{ fontSize: 13, color: '#7f8ea4', lineHeight: 1.8 }}>
          <div style={{ marginBottom: 8, color: '#e1e8f4', fontWeight: 600 }}>SimTrade 模擬投資平台</div>
          以模擬資金進行台股 ETF 和個股的虛擬交易練習。<br />
          即時報價來自 Yahoo Finance，每 30 秒更新。<br />
          交易費率：手續費 0.028%（折扣後），ETF 交易稅 0.1%，個股交易稅 0.3%。
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#3e4d62' }}>
          免責聲明：本平台僅供練習，不構成任何投資建議。
        </div>
      </Card>

      {/* Danger zone */}
      <Card title="危險操作">
        <div style={{ fontSize: 13, color: '#7f8ea4', marginBottom: 14, lineHeight: 1.5 }}>
          重置後所有交易紀錄將從資料庫刪除，且無法恢復。
        </div>
        <button
          onClick={handleReset}
          style={{
            width: '100%',
            background: 'rgba(248,113,113,0.12)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171',
            padding: '12px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Noto Sans TC',
          }}
        >⚠ 重置所有交易紀錄</button>
      </Card>
    </div>
  )
}
