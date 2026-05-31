import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, DEFAULT_SECURITIES, FALLBACK_PRICES } from '../lib/supabase'
import { uid, nowTime, settlementDate, calcCosts, cleanSym } from '../lib/utils'

const DEFAULT_CASH = 1_000_000   


const mkState = (initialCash = DEFAULT_CASH) => ({
  cash: initialCash,
  initialCash,
  positions: [],  
  orders: [],      
})

export function usePortfolio() {
  
  const [securities, setSecurities] = useState({})
  const [portfolio, setPortfolio] = useState(mkState())
  const [priceStatus, setPriceStatus] = useState('idle')  
  const [lastUpdate, setLastUpdate] = useState(null)
  const [marketOpen, setMarketOpen] = useState(false)

 
  const portfolioRef = useRef(portfolio)
  portfolioRef.current = portfolio

  const securitiesRef = useRef(securities)
  securitiesRef.current = securities

 
  const updateSecurity = useCallback((sym, patch) => {
    setSecurities(prev => ({
      ...prev,
      [sym]: { ...prev[sym], ...patch }
    }))
  }, [])

  const fetchSecurities = useCallback(async () => {
    const { data } = await supabase.from('securities').select('*')
    const map = {}
    DEFAULT_SECURITIES.forEach(d => {
      const fb = FALLBACK_PRICES[d.symbol] || { price: 100, base: 100 }
      map[d.symbol] = {
        ...d,
        price: fb.price,
        base: fb.base,
        change: fb.price - fb.base,
        changeRate: ((fb.price - fb.base) / fb.base) * 100,
      }
    })
    if (data) {
      data.forEach(item => {
        if (map[item.symbol]) {
          const price = Number(item.price) || map[item.symbol].price
          const base = Number(item.base) || map[item.symbol].base
          map[item.symbol] = {
            ...map[item.symbol],
            price, base,
            change: price - base,
            changeRate: base > 0 ? ((price - base) / base) * 100 : 0,
            name: item.name || map[item.symbol].name,
          }
        }
      })
    }
    setSecurities(map)
  }, [])

  const fetchPrices = useCallback(async () => {
    setPriceStatus('loading')
    const symbols = DEFAULT_SECURITIES.map(d => d.symbol)
    try {
      const { data, error } = await supabase.functions.invoke('stock-yahoo-live', {
        body: { symbols, range: '1d', interval: '1m' }
      })
      if (error) throw error
      const rows = data?.rows || data?.quotes || []
      if (!rows.length) throw new Error('no rows')
      rows.forEach(item => {
        const sym = String(item?.symbol || '').toUpperCase()
        if (!sym) return
        const price = Number(item?.meta?.regularMarketPrice ?? item?.regularMarketPrice ?? item?.price)
        const base = Number(item?.meta?.previousClose ?? item?.previousClose)
        if (!Number.isFinite(price) || price <= 0) return
        setSecurities(prev => {
          const s = prev[sym]
          if (!s) return prev
          const prevClose = Number.isFinite(base) && base > 0 ? base : s.base
          return {
            ...prev,
            [sym]: { ...s, price, base: prevClose, change: price - prevClose, changeRate: prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0 }
          }
        })
      })
      setPriceStatus('live')
      setLastUpdate(new Date())
    } catch {
      setPriceStatus('error')
    }
  }, [])

  const loadOrders = useCallback(async (settingsRow = null) => {
    const [ordersRes, settingsRes] = await Promise.all([
      supabase.from('orders').select('*').eq('status', 'executed').order('created_at', { ascending: true }),
      settingsRow
        ? Promise.resolve({ data: [settingsRow] })
        : supabase.from('settings').select('*').eq('key', 'portfolio').single().catch(() => ({ data: null }))
    ])

    const initialCash = settingsRes?.data?.value?.initialCash || DEFAULT_CASH
    const state = mkState(initialCash)

    if (ordersRes.data) {
      const orders = ordersRes.data.map(o => ({
        id: o.id,
        symbol: o.symbol,
        name: o.name,
        qty: +o.qty,
        side: o.side,
        price: +o.price,
        amount: +o.amount,
        fee: +(o.fee_amount || 0),
        tax: +(o.tax_amount || 0),
        netAmount: +(o.settlement_amount || o.amount),
        grp: o.grp,
        comment: o.comment || '',
        time: o.time || '',
        settlement_date: o.settlementdate || o.settlement_date || '',
        status: o.status,
      }))

      orders.forEach(o => {
        if (o.side === 'buy') {
          state.cash -= o.netAmount
          const ex = state.positions.find(p => p.symbol === o.symbol)
          if (ex) {
            ex.avgPrice = (ex.avgPrice * ex.qty + (o.amount + o.fee)) / (ex.qty + o.qty)
            ex.qty += o.qty
          } else {
            state.positions.push({ symbol: o.symbol, qty: o.qty, avgPrice: (o.amount + o.fee) / o.qty })
          }
        } else {
          state.cash += o.netAmount
          const pos = state.positions.find(p => p.symbol === o.symbol)
          if (pos) {
            pos.qty -= o.qty
            if (pos.qty <= 0) state.positions = state.positions.filter(p => p.symbol !== o.symbol)
          }
        }
      })
      state.orders = orders
    }
    setPortfolio(state)
  }, [])

  const placeOrder = useCallback(async ({ symbol, qty, side, comment }) => {
    const s = securitiesRef.current[symbol]
    if (!s) throw new Error('找不到商品')
    const port = portfolioRef.current

    const price = s.price
    const amount = Math.round(price * qty)
    const { fee, tax, net } = calcCosts(amount, side, symbol, s.grp)

    if (side === 'buy' && net > port.cash) throw new Error('現金不足')
    if (side === 'sell') {
      const pos = port.positions.find(p => p.symbol === symbol)
      if (!pos || pos.qty < qty) throw new Error('持股不足')
    }

    const order = {
      id: uid(),
      time: nowTime(),
      symbol,
      name: s.name,
      qty,
      side,
      price,
      amount,
      grp: s.grp,
      status: 'executed',
      comment: comment || '市價成交',
      settlement_date: settlementDate(),
      settlement_price: price,
      fee_rate: fee / amount,
      fee_amount: fee,
      tax_rate: tax / amount,
      tax_amount: tax,
      settlement_amount: net,
    }

    const { error } = await supabase.from('orders').insert([order])
    if (error) throw new Error(error.message)

    await loadOrders()
    return order
  }, [loadOrders])

  const updateInitialCash = useCallback(async (amount) => {
    await supabase.from('settings').upsert([{ key: 'portfolio', value: { initialCash: amount } }], { onConflict: 'key' }).catch(() => {})
    await loadOrders()
  }, [loadOrders])

  const resetAll = useCallback(async () => {
    await supabase.from('orders').delete().neq('id', '___none___')
    await loadOrders()
  }, [loadOrders])

  useEffect(() => {
    const check = () => {
      const now = new Date()
      const twn = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000)
      const h = twn.getHours(), m = twn.getMinutes(), day = twn.getDay()
      const open = day >= 1 && day <= 5 && (h > 9 || (h === 9 && m >= 0)) && (h < 13 || (h === 13 && m < 30))
      setMarketOpen(open)
    }
    check()
    const t = setInterval(check, 10000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetchSecurities().then(() => {
      loadOrders()
      fetchPrices()
    })
    const t = setInterval(fetchPrices, 30000)
    return () => clearInterval(t)
  }, [fetchSecurities, loadOrders, fetchPrices])

  useEffect(() => {
    const ch = supabase.channel('rt-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [loadOrders])

  const calcNav = useCallback(() => {
    const mv = portfolio.positions.reduce((sum, p) => {
      const s = securitiesRef.current[p.symbol]
      return sum + (s ? s.price : p.avgPrice) * p.qty
    }, 0)
    return portfolio.cash + mv
  }, [portfolio])

  const calcUnrealized = useCallback(() => {
    return portfolio.positions.reduce((sum, p) => {
      const s = securitiesRef.current[p.symbol]
      const cur = s ? s.price : p.avgPrice
      return sum + (cur - p.avgPrice) * p.qty
    }, 0)
  }, [portfolio])

  const calcRealized = useCallback(() => {
    let realized = 0
    portfolio.orders.filter(o => o.side === 'sell').forEach(o => {
      const buyOrders = portfolio.orders.filter(b => b.symbol === o.symbol && b.side === 'buy' && b.time <= o.time)
      const avgCost = buyOrders.length
        ? buyOrders.reduce((s, b) => s + (b.amount + b.fee), 0) / buyOrders.reduce((s, b) => s + b.qty, 0)
        : o.price
      realized += o.netAmount - avgCost * o.qty
    })
    return realized
  }, [portfolio])

  return {
    securities, portfolio,
    priceStatus, lastUpdate, marketOpen,
    placeOrder, updateInitialCash, resetAll,
    calcNav, calcUnrealized, calcRealized,
    fetchPrices,
    updateSecurity,
  }
}
