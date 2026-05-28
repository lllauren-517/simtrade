import { useState, useMemo } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { SECURITIES }   from '../../lib/constants'
import { fmtMoney, fmtPct } from '../../lib/utils'
import TickerList   from './TickerList'
import PositionList from './PositionList'
import OrderForm    from './OrderForm'
import ChartModal   from './ChartModal'
import MetricCard   from '../shared/MetricCard'

export default function TradePanel({ prices, toast }) {
  const { state } = usePortfolio()
  const { cash, positions, capital } = state

  const [activeGroup, setActiveGroup] = useState('etf')
  const [chartSym,    setChartSym]    = useState(null)
  const [orderSym,    setOrderSym]    = useState('')

  const nav = useMemo(() => (
    positions.reduce((sum, p) => sum + (prices[p.symbol]?.price ?? p.avgPrice) * p.qty, cash)
  ), [positions, cash, prices])

  const totalRet = capital > 0 ? (nav - capital) / capital * 100 : 0
  const posCount = positions.length

  function handleTickerClick(sym) {
    setChartSym(sym)
  }

  function handleChartSelect(sym) {
    setChartSym(null)
    setOrderSym(sym)
    const type = SECURITIES[sym]?.type
    if (type) setActiveGroup(type)
    // Scroll to order form
    setTimeout(() => {
      document.querySelector('.order-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div id="panel-trade" className="panel active">

      {/* NAV Summary */}
      <div className="metric-grid">
        <MetricCard
          label="投資組合 NAV"
          value={fmtMoney(nav)}
          sub={fmtPct(totalRet)}
          color={totalRet >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          label="可用現金"
          value={fmtMoney(cash)}
          sub={`持倉 ${posCount} 檔`}
          color="neutral"
        />
      </div>

      {/* Group toggle */}
      <div className="group-toggle">
        <div
          className={`group-btn ${activeGroup === 'etf' ? 'etf' : ''}`}
          onClick={() => setActiveGroup('etf')}
        >ETF 📦</div>
        <div
          className={`group-btn ${activeGroup === 'stock' ? 'stock' : ''}`}
          onClick={() => setActiveGroup('stock')}
        >個股 📈</div>
      </div>

      {/* Quotes */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">商品報價</span>
          <span className="tag">點擊查看 K 線 →</span>
        </div>
        <TickerList
          activeGroup={activeGroup}
          prices={prices}
          onTickerClick={handleTickerClick}
        />
      </div>

      {/* Positions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">目前持倉</span>
          <span className="tag">{posCount} 檔</span>
        </div>
        <PositionList prices={prices} toast={toast} />
      </div>

      {/* Order form */}
      <div className="card order-card">
        <div className="card-header">
          <span className="card-title">下單</span>
        </div>
        <OrderForm
          activeGroup={activeGroup}
          prices={prices}
          preselected={orderSym}
          onOrderDone={() => setOrderSym('')}
          toast={toast}
        />
      </div>

      {/* Chart Modal */}
      <ChartModal
        symbol={chartSym}
        prices={prices}
        isOpen={!!chartSym}
        onClose={() => setChartSym(null)}
        onSelect={handleChartSelect}
      />
    </div>
  )
}
