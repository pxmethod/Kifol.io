import { useState, useEffect } from 'react'
import { portfolioService, achievementService } from '@/lib/database'
import { createClient } from '@/lib/supabase/client'
import { dbPortfolioToLegacy, legacyPortfolioToDb, LegacyPortfolioData } from '@/lib/adapters/portfolio'

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<LegacyPortfolioData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load portfolios from database
  const loadPortfolios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // If not authenticated, show empty portfolios
        setPortfolios([])
        setLoading(false)
        return
      }

      // Get portfolios from database
      const dbPortfolios = await portfolioService.getUserPortfolios()
      
      // Transform to legacy format
      const legacyPortfolios = await Promise.all(
        dbPortfolios.map(async (dbPortfolio) => {
          // Get achievements for this portfolio
          const achievements = await achievementService.getPortfolioAchievements(dbPortfolio.id)
          return dbPortfolioToLegacy(dbPortfolio, achievements)
        })
      )
      
      setPortfolios(legacyPortfolios)
    } catch (err) {
      console.error('Error loading portfolios:', err)
      setError('Failed to load portfolios')
      setPortfolios([])
    } finally {
      setLoading(false)
    }
  }

  // Save portfolio to database
  const savePortfolio = async (portfolio: LegacyPortfolioData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Update in database
      const dbPortfolio = legacyPortfolioToDb(portfolio, user.id)
      await portfolioService.updatePortfolio(portfolio.id, dbPortfolio)
      
      // Reload portfolios
      await loadPortfolios()
    } catch (err) {
      console.error('Error saving portfolio:', err)
      setError('Failed to save portfolio')
      throw err
    }
  }

  // Delete portfolio from database
  const deletePortfolio = async (portfolioId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Delete from database
      await portfolioService.deletePortfolio(portfolioId)
      
      // Reload portfolios
      await loadPortfolios()
    } catch (err) {
      console.error('Error deleting portfolio:', err)
      setError('Failed to delete portfolio')
      throw err
    }
  }

  // Create new portfolio
  const createPortfolio = async (portfolioData: Omit<LegacyPortfolioData, 'id' | 'createdAt' | 'hasUnsavedChanges' | 'achievements'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create in database
      const dbPortfolio = legacyPortfolioToDb(portfolioData, user.id)
      const createdPortfolio = await portfolioService.createPortfolio(dbPortfolio)
      
      // Reload portfolios
      await loadPortfolios()
      
      return dbPortfolioToLegacy(createdPortfolio, [])
    } catch (err) {
      console.error('Error creating portfolio:', err)
      setError('Failed to create portfolio')
      throw err
    }
  }

  useEffect(() => {
    loadPortfolios()
  }, [])

  return {
    portfolios,
    loading,
    error,
    savePortfolio,
    deletePortfolio,
    createPortfolio,
    refreshPortfolios: loadPortfolios
  }
}