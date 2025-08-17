import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Achievement = Database['public']['Tables']['achievements']['Row']
type NewAchievement = Database['public']['Tables']['achievements']['Insert']
type UpdateAchievement = Database['public']['Tables']['achievements']['Update']

export class AchievementService {
  private supabase = createClient()

  /**
   * Get all achievements for a specific portfolio
   */
  async getPortfolioAchievements(portfolioId: string): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('date_achieved', { ascending: false })

    if (error) {
      console.error('Error fetching achievements:', error)
      throw new Error('Failed to fetch achievements')
    }

    return data || []
  }

  /**
   * Get a specific achievement by ID
   */
  async getAchievement(id: string): Promise<Achievement | null> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Achievement not found
      }
      console.error('Error fetching achievement:', error)
      throw new Error('Failed to fetch achievement')
    }

    return data
  }

  /**
   * Create a new achievement
   */
  async createAchievement(achievement: NewAchievement): Promise<Achievement> {
    const { data, error } = await this.supabase
      .from('achievements')
      .insert([achievement])
      .select()
      .single()

    if (error) {
      console.error('Error creating achievement:', error)
      throw new Error('Failed to create achievement')
    }

    return data
  }

  /**
   * Update an existing achievement
   */
  async updateAchievement(id: string, updates: UpdateAchievement): Promise<Achievement> {
    const { data, error } = await this.supabase
      .from('achievements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating achievement:', error)
      throw new Error('Failed to update achievement')
    }

    return data
  }

  /**
   * Delete an achievement
   */
  async deleteAchievement(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('achievements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting achievement:', error)
      throw new Error('Failed to delete achievement')
    }
  }

  /**
   * Get achievements by date range
   */
  async getAchievementsByDateRange(
    portfolioId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .gte('date_achieved', startDate)
      .lte('date_achieved', endDate)
      .order('date_achieved', { ascending: false })

    if (error) {
      console.error('Error fetching achievements by date range:', error)
      throw new Error('Failed to fetch achievements')
    }

    return data || []
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(
    portfolioId: string, 
    category: string
  ): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('achievements')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('category', category)
      .order('date_achieved', { ascending: false })

    if (error) {
      console.error('Error fetching achievements by category:', error)
      throw new Error('Failed to fetch achievements')
    }

    return data || []
  }

  /**
   * Get unique categories for a portfolio
   */
  async getPortfolioCategories(portfolioId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('achievements')
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
}

