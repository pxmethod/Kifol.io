import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { generateShortId } from '@/lib/utils/url-shortener'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type NewPortfolio = Database['public']['Tables']['portfolios']['Insert']
type UpdatePortfolio = Database['public']['Tables']['portfolios']['Update']

export class PortfolioService {
  private supabase = createClient()

  /**
   * Get all portfolios for the current user
   */
  async getUserPortfolios(): Promise<Portfolio[]> {
    // Get the current user first
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching portfolios:', error)
      throw new Error('Failed to fetch portfolios')
    }

    return data || []
  }

  /**
   * Get all portfolios for the current user with their achievements (optimized)
   */
  async getUserPortfoliosWithAchievements(): Promise<Array<Portfolio & { achievements: any[] }>> {
    // Get the current user first
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('portfolios')
      .select(`
        *,
        achievements:highlights(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching portfolios with achievements:', error)
      throw new Error('Failed to fetch portfolios')
    }

    return data || []
  }

  /**
   * Get a portfolio by ID with access control
   */
  async getPortfolioWithAccess(id: string): Promise<Portfolio | null> {
    // Get the current user first
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Portfolio not found
      }
      console.error('Error fetching portfolio:', error)
      throw new Error('Failed to fetch portfolio')
    }

    return data
  }

  /**
   * Get a specific portfolio by ID (legacy method for existing code)
   */
  async getPortfolio(id: string): Promise<Portfolio | null> {
    return this.getPortfolioWithAccess(id);
  }

  /**
   * Get a public portfolio by ID (for preview functionality)
   */
  async getPublicPortfolio(id: string): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('is_private', false)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Portfolio not found or not public
      }
      console.error('Error fetching public portfolio:', error)
      throw new Error('Failed to fetch portfolio')
    }

    return data
  }

  /**
   * Get portfolio access information
   */
  async getPortfolioAccessInfo(id: string): Promise<{
    isPrivate: boolean;
    hasPassword: boolean;
    ownerId: string;
  } | null> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('is_private, password, user_id')
      .eq('id', id)
      .single()

    if (error || !data) {
      return null
    }

    return {
      isPrivate: data.is_private,
      hasPassword: !!data.password,
      ownerId: data.user_id
    }
  }

  /**
   * Create a new portfolio
   */
  async createPortfolio(portfolio: Omit<NewPortfolio, 'user_id' | 'short_id'>): Promise<Portfolio> {
    // Generate a unique short ID
    let shortId: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortId = generateShortId();
      const existing = await this.getPortfolioByShortId(shortId);
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique short ID');
    }

    const { data, error } = await this.supabase
      .from('portfolios')
      .insert([{ ...portfolio, short_id: shortId }])
      .select()
      .single()

    if (error) {
      console.error('Error creating portfolio:', error)
      throw new Error('Failed to create portfolio')
    }

    return data
  }

  /**
   * Get a portfolio by short ID
   */
  async getPortfolioByShortId(shortId: string): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('short_id', shortId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Portfolio not found
      }
      console.error('Error fetching portfolio by short ID:', error)
      throw new Error('Failed to fetch portfolio')
    }

    return data
  }

  /**
   * Update an existing portfolio
   */
  async updatePortfolio(id: string, updates: UpdatePortfolio): Promise<Portfolio> {
    // Get the current user first
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating portfolio:', error)
      throw new Error('Failed to update portfolio')
    }

    return data
  }

  /**
   * Delete a portfolio
   */
  async deletePortfolio(id: string): Promise<void> {
    // Get the current user first
    const { data: { user }, error: userError } = await this.supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting portfolio:', error)
      throw new Error('Failed to delete portfolio')
    }
  }

  /**
   * Check if portfolio is accessible (either public or owned by user)
   */
  async isPortfolioAccessible(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('is_private, user_id')
      .eq('id', id)
      .single()

    if (error) {
      return false
    }

    // If it's public, it's accessible
    if (!data.is_private) {
      return true
    }

    // If it's private, check if user owns it
    const { data: { user } } = await this.supabase.auth.getUser()
    return user?.id === data.user_id
  }
}

