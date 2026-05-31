import { useState } from 'react'
import Header from './components/Header'
import TabBar from './components/TabBar'
import TradePage from './pages/TradePage'
import RecordsPage from './pages/RecordsPage'
import SettingsPage from './pages/SettingsPage'
import { usePortfolio } from './hooks/usePortfolio'

export default function App() {
  const [tab, setTab] = useState('trade')
  const {
    securities, portfolio,
    priceStatus, lastUpdate, marketOpen,
    placeOrder, updateInitialCash, resetAll,
    calcNav, calcUnrealized, calcRealized,
  } = usePortfolio()

  const nav = calcNav()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <Header
        priceStatus={priceStatus}
        lastUpdate={lastUpdate}
        marketOpen={marketOpen}
        nav={nav}
        initialCash={portfolio.initialCash}
      />
      <TabBar active={tab} onChange={setTab} />

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain' }}>
        {tab === 'trade' && (
          <TradePage
            securities={securities}
            portfolio={portfolio}
            onPlaceOrder={placeOrder}
            calcNav={calcNav}
            calcUnrealized={calcUnrealized}
          />
        )}
        {tab === 'records' && (
          <RecordsPage
            portfolio={portfolio}
            securities={securities}
            calcNav={calcNav}
            calcUnrealized={calcUnrealized}
            calcRealized={calcRealized}
          />
        )}
        {tab === 'settings' && (
          <SettingsPage
            portfolio={portfolio}
            onUpdateCash={updateInitialCash}
            onReset={resetAll}
          />
        )}
      </div>
    </div>
  )
}
