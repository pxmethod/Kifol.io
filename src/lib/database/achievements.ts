import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Highlight = Database['public']['Tables']['highlights']['Row']
type NewHighlight = Database['public']['Tables']['highlights']['Insert']
type UpdateHighlight = Database['public']['Tables']['highlights']['Update']

export class HighlightService {
  private supabase = createClient()

  /**
   * Get all highlights for a specific portfolio
   */
  async getPortfolioHighlights(portfolioId: string): Promise<Highlight[]> {
    const { data, error } = await this.supabase
      .from('highlights')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('date_achieved', { ascending: false })

    if (error) {
      console.error('Error fetching highlights:', error)
      throw new Error('Failed to fetch highlights')
    }

    return data || []
  }

  // Legacy method for backward compatibility
  async getPortfolioAchievements(portfolioId: string): Promise<Highlight[]> {
    return this.getPortfolioHighlights(portfolioId)
  }

  /**
   * Get a specific highlight by ID
   */
  async getHighlight(id: string): Promise<Highlight | null> {
    const { data, error } = await this.supabase
      .from('highlights')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Highlight not found
      }
      console.error('Error fetching highlight:', error)
      throw new Error('Failed to fetch highlight')
    }

    return data
  }

  // Legacy method for backward compatibility
  async getAchievement(id: string): Promise<Highlight | null> {
    return this.getHighlight(id)
  }

  /**
   * Create a new highlight
   */
  async createHighlight(highlight: NewHighlight): Promise<Highlight> {
    const { data, error } = await this.supabase
      .from('highlights')
      .insert([highlight])
      .select()
      .single()

    if (error) {
      console.error('Error creating highlight:', error)
      throw new Error('Failed to create highlight')
    }

    return data
  }

  // Legacy method for backward compatibility
  async createAchievement(achievement: NewHighlight): Promise<Highlight> {
    return this.createHighlight(achievement)
  }

  /**
   * Update an existing highlight
   */
  async updateHighlight(id: string, updates: UpdateHighlight): Promise<Highlight> {
    const { data, error } = await this.supabase
      .from('highlights')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating highlight:', error)
      throw new Error('Failed to update highlight')
    }

    return data
  }

  // Legacy method for backward compatibility
  async updateAchievement(id: string, updates: UpdateHighlight): Promise<Highlight> {
    return this.updateHighlight(id, updates)
  }

  /**
   * Delete a highlight
   */
  async deleteHighlight(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('highlights')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting highlight:', error)
      throw new Error('Failed to delete highlight')
    }
  }

  // Legacy method for backward compatibility
  async deleteAchievement(id: string): Promise<void> {
    return this.deleteHighlight(id)
  }

  /**
   * Get highlights by date range
   */
  async getHighlightsByDateRange(
    portfolioId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Highlight[]> {
    const { data, error } = await this.supabase
      .from('highlights')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .gte('date_achieved', startDate)
      .lte('date_achieved', endDate)
      .order('date_achieved', { ascending: false })

    if (error) {
      console.error('Error fetching highlights by date range:', error)
      throw new Error('Failed to fetch highlights')
    }

    return data || []
  }

  // Legacy method for backward compatibility
  async getAchievementsByDateRange(
    portfolioId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Highlight[]> {
    return this.getHighlightsByDateRange(portfolioId, startDate, endDate)
  }

  /**
   * Get highlights by type
   */
  async getHighlightsByType(
    portfolioId: string, 
    type: string
  ): Promise<Highlight[]> {
    const { data, error } = await this.supabase
      .from('highlights')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('type', type)
      .order('date_achieved', { ascending: false })

    if (error) {
      console.error('Error fetching highlights by type:', error)
      throw new Error('Failed to fetch highlights')
    }

    return data || []
  }

  /**
   * Get highlights by category
   */
  async getHighlightsByCategory(
    portfolioId: string, 
    category: string
  ): Promise<Highlight[]> {
    const { data, error } = await this.supabase
      .from('highlights')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('category', category)
      .order('date_achieved', { ascending: false })

    if (error) {
      console.error('Error fetching highlights by category:', error)
      throw new Error('Failed to fetch highlights')
    }

    return data || []
  }

  // Legacy method for backward compatibility
  async getAchievementsByCategory(
    portfolioId: string, 
    category: string
  ): Promise<Highlight[]> {
    return this.getHighlightsByCategory(portfolioId, category)
  }

  /**
   * Get unique categories for a portfolio
   */
  async getPortfolioCategories(portfolioId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('highlights')
      .select('category')
      .eq('portfolio_id', portfolioId)
      .not('category', 'is', null)

    if (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Failed to fetch categories')
    }

    // Extract unique categories
    const categories = [...new Set(data.map((item: { category: string | null }) => item.category).filter(Boolean))]
    return categories as string[]
  }

  /**
   * Get unique types for a portfolio
   */
  async getPortfolioTypes(portfolioId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('highlights')
      .select('type')
      .eq('portfolio_id', portfolioId)

    if (error) {
      console.error('Error fetching types:', error)
      throw new Error('Failed to fetch types')
    }

    // Extract unique types
    const types = [...new Set(data.map((item: { type: string }) => item.type))] as HighlightType[]
    return types
  }
}

