import { useState } from 'react'
import QuoteList from '../components/QuoteList'
import OrderForm from '../components/OrderForm'
import Holdings from '../components/Holdings'
import ChartModal from '../components/ChartModal'
import { money, pct } from '../lib/utils'
import { usePortfolioContext } from '../context/PortfolioContext'

// Tailwind 寫
const MetricCard = ({ label, value, sub, color }) => (
  <div className="bg-[#161c27] rounded-[10px] p-3 min-w-0">
    <div className="text-xs text-[#3e4d62] mb-1 truncate">{label}</div>
    <div 
      className="mono text-[18px] font-semibold tracking-[-0.5px] whitespace-nowrap"
      style={{ color: color || '#e1e8f4' }}
    >
      {value}
    </div>
    {sub && <div className="text-xs text-[#3e4d62] mt-1">{sub}</div>}
  </div>
)

export default function TradePage() {
  
  const { securities, portfolio, placeOrder, calcNav, calcUnrealized } = usePortfolioContext()
  
  const [chartSym, setChartSym] = useState(null)
  const [prefillSymbol, setPrefillSymbol] = useState(null)

  const nav = calcNav()
  const unrealized = calcUnrealized()
  const ret = portfolio.initialCash > 0 ? ((nav - portfolio.initialCash) / portfolio.initialCash) * 100 : 0
  const retClr = ret >= 0 ? '#4ade80' : '#f87171'

  const SectionTitle = ({ title, count }) => (
    <div style={{
      padding: '12px 14px 10px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', color: '#e1e8f4' }}>{title}</span>
      {count != null && <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: '#3e4d62' }}>{count}</span>}
    </div>
  )

  const Card = ({ children, style }) => (
    <div style={{
      background: '#0f1219',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  )

  return (
    <div style={{ padding: '12px 12px 32px', maxWidth: 1300, margin: '0 auto' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
        <MetricCard label="總資產 (NAV)" value={money(nav)} color={retClr} sub={`${ret >= 0 ? '+' : ''}${ret.toFixed(2)}%`} />
        <MetricCard label="可用現金" value={money(portfolio.cash)} />
        <MetricCard label="未實現損益" value={money(unrealized)} color={unrealized >= 0 ? '#4ade80' : '#f87171'} />
        <MetricCard label="持股數" value={`${portfolio.positions.length} 檔`} />
      </div>

      //RWD
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Card>
            <SectionTitle title="商品報價" />
            <QuoteList
              securities={securities}
              positions={portfolio.positions}
              onTickerClick={(sym) => setChartSym(sym)}
            />
          </Card>

          <Card>
            <SectionTitle title="持股明細" count={`${portfolio.positions.length} 筆`} />
            <Holdings
              portfolio={portfolio}
              securities={securities}
              onFillOrder={(sym, side) => setPrefillSymbol(sym)}
            />
          </Card>
        </div>

        <div>
          <Card>
            <SectionTitle title="下單" />
            <OrderForm
              securities={securities}
              portfolio={portfolio}
              onPlaceOrder={placeOrder}
              prefillSymbol={prefillSymbol}
              onPrefillUsed={() => setPrefillSymbol(null)}
            />
          </Card>
        </div>
      </div>

      //K 線圖
      {chartSym && (
        <ChartModal
          symbol={chartSym}
          security={securities[chartSym]}
          onClose={() => setChartSym(null)}
          onSelectForTrade={(sym) => { setPrefillSymbol(sym); setChartSym(null) }}
        />
      )}
    </div>
  )
}