import { SECURITIES } from '../../lib/constants'
import TickerRow from './TickerRow'

export default function TickerList({ activeGroup, prices, onTickerClick }) {
  const symbols = Object.keys(SECURITIES).filter(
    s => SECURITIES[s].type === activeGroup
  )

  return (
    <div>
      {symbols.map(sym => (
        <TickerRow
          key={sym}
          symbol={sym}
          priceData={prices[sym] ?? { price: SECURITIES[sym].basePrice, changeRate: 0 }}
          onClick={onTickerClick}
        />
      ))}
    </div>
  )
}
