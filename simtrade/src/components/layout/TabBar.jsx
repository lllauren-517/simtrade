export default function TabBar({ activeTab, onSwitch }) {
  const tabs = [
    { id: 'trade',   icon: '📊', label: '交易',  cls: 't-trade'   },
    { id: 'history', icon: '📋', label: '績效',  cls: 't-history' },
  ]
  return (
    <nav className="tabbar">
      {tabs.map(t => (
        <div
          key={t.id}
          className={`tab ${t.cls} ${activeTab === t.id ? 'active' : ''}`}
          onClick={() => onSwitch(t.id)}
        >
          <span className="tab-icon">{t.icon}</span>
          {t.label}
        </div>
      ))}
    </nav>
  )
}
