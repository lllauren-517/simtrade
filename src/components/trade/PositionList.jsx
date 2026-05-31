import { usePortfolio } from '../../context/PortfolioContext'
import { calcNAV } from '../../lib/utils'
import PositionItem from './PositionItem'

export default function PositionList({ prices, onQuickSell, toast }) {
  const { state, executeOrder } = usePortfolio()
  const { cash, positions } = state

  const nav = positions.reduce((sum, p) => {
    return sum + (prices[p.symbol]?.price ?? p.avgPrice) * p.qty
  }, cash)

  if (!positions.length) {
    return <div className="empty-state">尚無持倉</div>
  }

  async function handleClose(symbol, qty, mode) {
    const pos = positions.find(p => p.symbol === symbol)
    if (!pos) return
    const price = prices[symbol]?.price ?? pos.avgPrice
    const actualQty = Math.min(qty, pos.qty)
    await executeOrder(symbol, actualQty, 'sell', price, `快速${mode === 'all' ? '全部' : '半倉'}賣出`)
    toast(`已賣出 ${symbol} × ${actualQty}`, 'success')
  }

  return (
    <>
      {positions.map(p => (
        <PositionItem
          key={p.symbol}
          position={p}
          prices={prices}
          nav={nav}
          onClose={handleClose}
        />
      ))}
    </>
  )
}
