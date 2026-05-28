import { useState } from 'react'
import { PortfolioProvider } from './context/PortfolioContext'
import { usePrices }   from './hooks/usePrices'
import { useToast }    from './hooks/useToast'
import Header          from './components/layout/Header'
import TabBar          from './components/layout/TabBar'
import TradePanel      from './components/trade/TradePanel'
import HistoryPanel    from './components/history/HistoryPanel'
import CapitalModal    from './components/trade/CapitalModal'
import Toast           from './components/shared/Toast'

// Inner component: has access to context
function AppInner() {
  const [activeTab,      setActiveTab]      = useState('trade')
  const [capitalModalOpen, setCapitalModal] = useState(false)
  const prices              = usePrices()
  const { toasts, toast }   = useToast()

  return (
    <div className="app">
      <Header
        liveCount={Object.keys(prices).length}
        onCapitalClick={() => setCapitalModal(true)}
      />
      <TabBar activeTab={activeTab} onSwitch={setActiveTab} />

      <div className="content">
        {activeTab === 'trade' && (
          <TradePanel prices={prices} toast={toast} />
        )}
        {activeTab === 'history' && (
          <HistoryPanel prices={prices} toast={toast} />
        )}
      </div>

      <CapitalModal
        isOpen={capitalModalOpen}
        onClose={() => setCapitalModal(false)}
        toast={toast}
      />

      <Toast toasts={toasts} />
    </div>
  )
}

export default function App() {
  return (
    <PortfolioProvider>
      <AppInner />
    </PortfolioProvider>
  )
}
