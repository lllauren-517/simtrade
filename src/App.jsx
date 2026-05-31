import { useState } from 'react'
import Header from './components/Header'
import TabBar from './components/TabBar'
import TradePage from './pages/TradePage'
import RecordsPage from './pages/RecordsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [tab, setTab] = useState('trade')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <TabBar active={tab} onChange={setTab} />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain' }}>
        {tab === 'trade' && <TradePage />}
        {tab === 'records' && <RecordsPage />}
        {tab === 'settings' && <SettingsPage />}
      </div>
    </div>
  )
}