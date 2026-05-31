import { usePortfolioContext } from '../context/PortfolioContext'

export default function Header() {
  const { priceStatus, lastUpdate, marketOpen, calcNav, portfolio } = usePortfolioContext()
  
  const nav = calcNav()
  const initialCash = portfolio.initialCash

  return (
    <header style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div>總資產 (NAV): {nav}</div>
      <div>初始資金: {initialCash}</div>
      <div>連線狀態: {priceStatus}</div>
      <div>市場是否開盤: {marketOpen ? '開盤中' : '已收盤'}</div>
    </header>
  )
}