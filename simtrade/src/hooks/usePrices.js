import { useState, useEffect, useRef } from 'react'
import { SECURITIES } from '../lib/constants'

// 初始化價格狀態（含漲跌幅）
function initPrices() {
  const p = {}
  for (const [sym, info] of Object.entries(SECURITIES)) {
    p[sym] = { price: info.basePrice, change: 0, changeRate: 0 }
  }
  return p
}

export function usePrices() {
  const [prices, setPrices] = useState(initPrices)
  const intervalRef = useRef(null)

  useEffect(() => {
    // 每 4 秒模擬一次微幅報價更新（基於隨機漫步）
    intervalRef.current = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev }
        for (const [sym, info] of Object.entries(SECURITIES)) {
          const old = prev[sym]
          const dailyVol = info.vol / Math.sqrt(252)
          const tick = dailyVol / 10 // 單次微幅
          const move = (Math.random() - 0.49) * tick  // 略偏正向
          const newPrice = Math.max(old.price * (1 + move), 0.01)
          const change = newPrice - info.basePrice
          const changeRate = (change / info.basePrice) * 100
          next[sym] = { price: newPrice, change, changeRate }
        }
        return next
      })
    }, 4000)

    return () => clearInterval(intervalRef.current)
  }, [])

  return prices
}
