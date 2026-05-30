import { useState, useCallback, useEffect, useRef } from 'react'

const COLORS = {
  success: { bg: '#161c27', border: '#4ade80', accent: '#4ade80' },
  danger:  { bg: '#161c27', border: '#f87171', accent: '#f87171' },
  warn:    { bg: '#161c27', border: '#fbbf24', accent: '#fbbf24' },
  info:    { bg: '#161c27', border: '#60a5fa', accent: '#60a5fa' },
}

let _addToast = null
export const toast = (msg, type = 'info') => _addToast?.(msg, type)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((msg, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => { _addToast = add; return () => { _addToast = null } }, [add])

  return (
    <>
      {children}
      <div style={{
        position: 'fixed',
        top: 68,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 999,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info
          return (
            <div
              key={t.id}
              style={{
                background: c.bg,
                border: `1px solid rgba(255,255,255,0.1)`,
                borderLeft: `4px solid ${c.accent}`,
                borderRadius: 10,
                padding: '11px 16px',
                fontSize: 14,
                color: '#e1e8f4',
                boxShadow: '0 8px 32px rgba(0,0,0,.6)',
                animation: 'fadeIn .2s ease both',
                pointerEvents: 'auto',
              }}
            >
              {t.msg}
            </div>
          )
        })}
      </div>
    </>
  )
}
