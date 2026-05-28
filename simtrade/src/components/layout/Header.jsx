import { useMemo } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtMoney } from '../../lib/utils'

export default function Header({ liveCount, onCapitalClick }) {
  const { state } = usePortfolio()

  const isLive = liveCount > 0

  return (
    <header className="header">
      <div className="header-logo"><span>Sim</span>Trade</div>
      <div className="header-right">
        <button className="capital-btn" onClick={onCapitalClick}>
          💰 {fmtMoney(state.capital)}
        </button>
        <div className="price-pill">
          <div className={`price-dot ${isLive ? 'live' : ''}`} />
          <span>{isLive ? '模擬報價中' : '等待中'}</span>
        </div>
      </div>
    </header>
  )
}
