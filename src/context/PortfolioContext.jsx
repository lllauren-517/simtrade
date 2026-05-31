import { createContext, useContext } from 'react'
import { usePortfolio } from '../hooks/usePortfolio'

const PortfolioContext = createContext(null)


export function PortfolioProvider({ children }) {

  const portfolioData = usePortfolio()

  return (
    <PortfolioContext.Provider value={portfolioData}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolioContext 必須在 PortfolioProvider 內部使用')
  }
  return context
}