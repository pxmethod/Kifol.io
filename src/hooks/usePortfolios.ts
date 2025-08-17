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
      
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Fall back to localStorage if Supabase is not configured
        const storedPortfolios = JSON.parse(localStorage.getItem('portfolios') || '[]')
        setPortfolios(storedPortfolios)
        setLoading(false)
        return
      }
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // If not authenticated, fall back to localStorage for backwards compatibility
        const storedPortfolios = JSON.parse(localStorage.getItem('portfolios') || '[]')
        setPortfolios(storedPortfolios)
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
      
      // Fall back to localStorage on error
      const storedPortfolios = JSON.parse(localStorage.getItem('portfolios') || '[]')
      setPortfolios(storedPortfolios)
    } finally {
      setLoading(false)
    }
  }

  // Save portfolio to database
  const savePortfolio = async (portfolio: LegacyPortfolioData) => {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Fall back to localStorage if Supabase is not configured
        const updatedPortfolios = portfolios.map(p => 
          p.id === portfolio.id ? portfolio : p
        )
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios))
        setPortfolios(updatedPortfolios)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Fall back to localStorage if not authenticated
        const updatedPortfolios = portfolios.map(p => 
          p.id === portfolio.id ? portfolio : p
        )
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios))
        setPortfolios(updatedPortfolios)
        return
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
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Fall back to localStorage if Supabase is not configured
        const updatedPortfolios = portfolios.filter(p => p.id !== portfolioId)
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios))
        setPortfolios(updatedPortfolios)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Fall back to localStorage if not authenticated
        const updatedPortfolios = portfolios.filter(p => p.id !== portfolioId)
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios))
        setPortfolios(updatedPortfolios)
        return
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
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        // Fall back to localStorage if Supabase is not configured
        const newPortfolio: LegacyPortfolioData = {
          ...portfolioData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          hasUnsavedChanges: false,
          achievements: []
        }
        const updatedPortfolios = [...portfolios, newPortfolio]
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios))
        setPortfolios(updatedPortfolios)
        return newPortfolio
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Fall back to localStorage if not authenticated
        const newPortfolio: LegacyPortfolioData = {
          ...portfolioData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          hasUnsavedChanges: false,
          achievements: []
        }
        const updatedPortfolios = [...portfolios, newPortfolio]
        localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios))
        setPortfolios(updatedPortfolios)
        return newPortfolio
      }

      // Create in database
      const dbPortfolio = legacyPortfolioToDb(portfolioData, user.id)
      const createdPortfolio = await portfolioService.createPortfolio(dbPortfolio)
      
      // Reload portfolios
      await loadPortfolios()
      
      return dbPortfolioToLegacy(createdPortfolio)
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