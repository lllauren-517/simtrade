export default function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'trade', label: '下單', icon: '📈' },
    { id: 'records', label: '紀錄', icon: '📋' },
    { id: 'settings', label: '設定', icon: '⚙️' },
  ]

  return (
    <nav style={{
      background: '#0f1219',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 4px 8px',
              gap: 4,
              fontSize: 12,
              fontFamily: 'Noto Sans TC',
              color: isActive ? '#e1e8f4' : '#3e4d62',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${isActive ? '#60a5fa' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
