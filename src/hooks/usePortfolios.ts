import { useState, useEffect } from 'react'
import { portfolioService, achievementService } from '@/lib/database'
import { createClient } from '@/lib/supabase/client'
import { dbPortfolioToLegacy, legacyPortfolioToDb, LegacyPortfolioData } from '@/lib/adapters/portfolio'
import { storageService } from '@/lib/storage'

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

      // Get portfolios with achievements (try optimized query first, fallback to separate fetches)
      let legacyPortfolios: LegacyPortfolioData[]
      try {
        const dbPortfoliosWithAchievements = await portfolioService.getUserPortfoliosWithAchievements()
        legacyPortfolios = dbPortfoliosWithAchievements.map((dbPortfolio) => {
          return dbPortfolioToLegacy(dbPortfolio, dbPortfolio.achievements || [])
        })
      } catch (queryErr) {
        // Fallback: fetch portfolios and highlights separately (e.g. if relation query fails)
        console.warn('[usePortfolios] Relation query failed, using fallback:', queryErr)
        const dbPortfolios = await portfolioService.getUserPortfolios()
        legacyPortfolios = await Promise.all(
          dbPortfolios.map(async (p) => {
            const highlights = await achievementService.getPortfolioHighlights(p.id)
            return dbPortfolioToLegacy(p, highlights)
          })
        )
      }

      // Fetch endorsement counts for each portfolio (in parallel)
      // Use current origin in browser so API calls always hit the same server
      const base = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '')
      const portfoliosWithCounts = await Promise.all(
        legacyPortfolios.map(async (portfolio) => {
          let endorsementCount = 0
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            const res = await fetch(`${base}/api/endorsements/portfolio/${portfolio.id}`, {
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            if (res.ok) {
              const { endorsements } = await res.json()
              endorsementCount = Object.values(endorsements || {}).flat().length
            }
          } catch {
            // Non-fatal: show portfolios without endorsement count
          }
          return { ...portfolio, endorsementCount }
        })
      )
      
      setPortfolios(portfoliosWithCounts)
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

      // Get portfolio data before deletion to clean up photo
      const portfolio = portfolios.find(p => p.id === portfolioId)
      
      // Delete from database
      await portfolioService.deletePortfolio(portfolioId)
      
      // Clean up associated photo if it exists and is not a placeholder
      if (portfolio?.photoUrl && !portfolio.photoUrl.includes('placeholders')) {
        await storageService.deleteFile(portfolio.photoUrl)
      }
      
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