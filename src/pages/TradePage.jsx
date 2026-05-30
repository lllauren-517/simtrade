import { useState } from 'react'
import QuoteList from '../components/QuoteList'
import OrderForm from '../components/OrderForm'
import Holdings from '../components/Holdings'
import ChartModal from '../components/ChartModal'
import { money, pct } from '../lib/utils'

export default function TradePage({ securities, portfolio, onPlaceOrder, calcNav, calcUnrealized }) {
  const [chartSym, setChartSym] = useState(null)
  const [prefillSymbol, setPrefillSymbol] = useState(null)

  const nav = calcNav()
  const unrealized = calcUnrealized()
  const ret = portfolio.initialCash > 0 ? ((nav - portfolio.initialCash) / portfolio.initialCash) * 100 : 0
  const retClr = ret >= 0 ? '#4ade80' : '#f87171'

  const MetricCard = ({ label, value, sub, color }) => (
    <div style={{
      background: '#161c27',
      borderRadius: 10,
      padding: '12px 12px',
      minWidth: 0,
    }}>
      <div style={{ fontSize: 12, color: '#3e4d62', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 18, fontWeight: 600, color: color || '#e1e8f4', letterSpacing: -0.5, whiteSpace: 'nowrap' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#3e4d62', marginTop: 4 }}>{sub}</div>}
    </div>
  )

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

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
        <MetricCard label="總資產 (NAV)" value={money(nav)} color={retClr} sub={`${ret >= 0 ? '+' : ''}${ret.toFixed(2)}%`} />
        <MetricCard label="可用現金" value={money(portfolio.cash)} />
        <MetricCard label="未實現損益" value={money(unrealized)} color={unrealized >= 0 ? '#4ade80' : '#f87171'} />
        <MetricCard label="持股數" value={`${portfolio.positions.length} 檔`} />
      </div>

      {/* Desktop: 2 columns; Mobile: single column */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth >= 900 ? '1fr 1fr' : '1fr',
        gap: 12,
      }}>
        {/* Left: quotes + holdings */}
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
              onFillOrder={(sym, side) => {
                setPrefillSymbol(sym)
              }}
            />
          </Card>
        </div>

        {/* Right: order form */}
        <div>
          <Card>
            <SectionTitle title="下單" />
            <OrderForm
              securities={securities}
              portfolio={portfolio}
              onPlaceOrder={onPlaceOrder}
              prefillSymbol={prefillSymbol}
              onPrefillUsed={() => setPrefillSymbol(null)}
            />
          </Card>
        </div>
      </div>

      {/* Chart modal */}
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
