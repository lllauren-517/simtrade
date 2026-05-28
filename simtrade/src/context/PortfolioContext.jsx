import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { uid, nowTime, calcNAV } from '../lib/utils'
import { SECURITIES, DEFAULT_CAPITAL, TAX_RATE } from '../lib/constants'

// ── Initial state ──
function makeInitialState(capital) {
  return { cash: capital, positions: [], navHistory: [capital], returns: [] }
}

const PortfolioContext = createContext(null)

// ── Reducer ──
function portfolioReducer(state, action) {
  switch (action.type) {

    case 'SET_CAPITAL': {
      // 只在無任何持倉 + 交易紀錄時允許調整資本
      if (state.positions.length > 0 || state.orders.length > 0) return state
      const cap = action.payload
      return { ...state, capital: cap, cash: cap, navHistory: [cap], returns: [] }
    }

    case 'EXECUTE_ORDER': {
      const { order } = action.payload
      const { symbol, qty, side, price } = order
      const secType = SECURITIES[symbol]?.type ?? 'stock'
      const cost = price * qty
      const taxRate = TAX_RATE[secType]
      const tax = side === 'sell' ? Math.round(cost * taxRate) : 0

      let newCash = state.cash
      let newPositions = [...state.positions]

      if (side === 'buy') {
        if (newCash < cost) return state  // 餘額不足，不執行
        newCash -= cost
        const existing = newPositions.find(p => p.symbol === symbol)
        if (existing) {
          existing.avgPrice = (existing.avgPrice * existing.qty + cost) / (existing.qty + qty)
          existing.qty += qty
        } else {
          newPositions.push({ symbol, qty, avgPrice: price })
        }
      } else {
        const pos = newPositions.find(p => p.symbol === symbol)
        if (!pos || pos.qty < qty) return state  // 持股不足
        newCash += cost - tax
        pos.qty -= qty
        newPositions = newPositions.filter(p => p.qty > 0)
      }

      // NAV & returns
      const prevNAV = state.navHistory.at(-1) ?? state.capital
      const curNAV  = calcNAV(newCash, newPositions, Object.fromEntries(
        Object.entries(SECURITIES).map(([s, info]) => [s, { price: info.basePrice }])
      ))
      const ret = prevNAV > 0 ? (curNAV - prevNAV) / prevNAV * 100 : 0

      const newOrder = { ...order, tax, status: 'executed' }
      return {
        ...state,
        cash: newCash,
        positions: newPositions,
        orders: [...(state.orders ?? []), newOrder],
        navHistory: [...state.navHistory, curNAV],
        returns: [...state.returns, ret],
      }
    }

    case 'LOAD_STATE': {
      return { ...state, ...action.payload }
    }

    default:
      return state
  }
}

// ── Provider ──
export function PortfolioProvider({ children }) {
  const [state, dispatch] = useReducer(portfolioReducer, {
    capital: DEFAULT_CAPITAL,
    cash: DEFAULT_CAPITAL,
    positions: [],
    orders: [],
    navHistory: [DEFAULT_CAPITAL],
    returns: [],
  })

  // Load from Supabase on mount
  useEffect(() => {
    async function load() {
      // 1. Load capital setting
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'capital')
        .single()

      const capital = settings ? parseInt(settings.value) : DEFAULT_CAPITAL

      // 2. Load executed orders and replay
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'executed')
        .order('created_at', { ascending: true })

      if (!orders?.length) {
        dispatch({ type: 'LOAD_STATE', payload: { capital, cash: capital, navHistory: [capital] } })
        return
      }

      // Replay orders to rebuild portfolio
      let cash = capital
      let positions = []
      let navHistory = [capital]
      let returns = []
      const loadedOrders = []

      for (const row of orders) {
        const order = {
          id: row.id, time: row.time, symbol: row.symbol, name: row.name,
          qty: +row.qty, side: row.side, price: +row.price, amount: +row.amount,
          reason: row.reason, tax: row.tax ?? 0, status: 'executed',
        }
        const secType = SECURITIES[order.symbol]?.type ?? 'stock'
        const cost = order.price * order.qty
        const tax = order.side === 'sell' ? Math.round(cost * TAX_RATE[secType]) : 0
        order.tax = tax

        if (order.side === 'buy') {
          cash -= cost
          const ex = positions.find(p => p.symbol === order.symbol)
          if (ex) { ex.avgPrice = (ex.avgPrice * ex.qty + cost) / (ex.qty + order.qty); ex.qty += order.qty }
          else positions.push({ symbol: order.symbol, qty: order.qty, avgPrice: order.price })
        } else {
          const pos = positions.find(p => p.symbol === order.symbol)
          if (pos) {
            cash += cost - tax
            pos.qty -= order.qty
          }
          positions = positions.filter(p => p.qty > 0)
        }
        const prevNav = navHistory.at(-1) ?? capital
        const newNav = cash + positions.reduce((s, p) => {
          const bp = SECURITIES[p.symbol]?.basePrice ?? p.avgPrice
          return s + bp * p.qty
        }, 0)
        returns.push(prevNav > 0 ? (newNav - prevNav) / prevNav * 100 : 0)
        navHistory.push(newNav)
        loadedOrders.push(order)
      }

      dispatch({
        type: 'LOAD_STATE',
        payload: { capital, cash, positions, orders: loadedOrders, navHistory, returns }
      })
    }
    load()
  }, [])

  // ── Actions ──
  const executeOrder = useCallback(async (symbol, qty, side, price, reason) => {
    const secType = SECURITIES[symbol]?.type ?? 'stock'
    const order = {
      id: uid(), time: nowTime(), symbol, name: SECURITIES[symbol]?.name ?? symbol,
      qty, side, price, amount: price * qty,
      reason: reason || '', tax: 0, status: 'executed',
    }
    // Persist to Supabase
    await supabase.from('orders').insert([{
      id: order.id, time: order.time, symbol: order.symbol, name: order.name,
      qty: order.qty, side: order.side, price: order.price, amount: order.amount,
      reason: order.reason, status: 'executed',
    }])

    dispatch({ type: 'EXECUTE_ORDER', payload: { order } })
    return order
  }, [])

  const setCapital = useCallback(async (amount) => {
    await supabase.from('settings').upsert([{ key: 'capital', value: String(amount) }])
    dispatch({ type: 'SET_CAPITAL', payload: amount })
  }, [])

  const resetAll = useCallback(async () => {
    await supabase.from('orders').delete().neq('id', '__none__')
    const cap = state.capital
    dispatch({ type: 'LOAD_STATE', payload: {
      cash: cap, positions: [], orders: [], navHistory: [cap], returns: []
    }})
  }, [state.capital])

  return (
    <PortfolioContext.Provider value={{ state, executeOrder, setCapital, resetAll }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used inside PortfolioProvider')
  return ctx
}
