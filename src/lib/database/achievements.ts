import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Highlight = Database['public']['Tables']['highlights']['Row']
type NewHighlight = Database['public']['Tables']['highlights']['Insert']
type UpdateHighlight = Database['public']['Tables']['highlights']['Update']

function formatSupabaseError(error: unknown): string {
  if (error == null) return 'Unknown error';
  if (typeof error !== 'object') return String(error);
  const e = error as {
    message?: string
    details?: string
    hint?: string
    code?: string
  };
  const parts = [e.message, e.details, e.hint, e.code].filter(Boolean).map(String);
  return parts.join(' — ') || 'Unknown database error';
}

/** PostgREST / Postgres errors when new highlight columns or `custom` type are not migrated yet */
function shouldRetryHighlightWithLegacyPayload(error: unknown): boolean {
  const e = error as { message?: string; details?: string; hint?: string; code?: string }
  const t = `${e.message || ''} ${e.details || ''} ${e.hint || ''}`.toLowerCase()
  if (e.code === 'PGRST204') return true
  if (t.includes('schema cache')) return true
  if (t.includes('date_end') || t.includes('ongoing') || t.includes('custom_type')) return true
  if (e.code === '23514' || t.includes('highlights_type_check') || (t.includes('check constraint') && t.includes('type')))
    return true
  return false
}

function toLegacyHighlightInsert(highlight: NewHighlight): Record<string, unknown> {
  const {
    portfolio_id,
    title,
    description,
    date_achieved,
    media_urls,
    type,
    category,
    custom_type_label,
  } = highlight as NewHighlight & { custom_type_label?: string | null }
  if (type === 'custom') {
    return {
      portfolio_id,
      title,
      description: description ?? null,
      date_achieved,
      media_urls: media_urls ?? [],
      type: 'achievement',
      category: (custom_type_label && String(custom_type_label).trim()) || 'Custom',
    }
  }
  return {
    portfolio_id,
    title,
    description: description ?? null,
    date_achieved,
    media_urls: media_urls ?? [],
    type,
    category: category ?? null,
  }
}

function toLegacyHighlightUpdate(updates: UpdateHighlight): Record<string, unknown> {
  const u = { ...(updates as Record<string, unknown>) }
  delete u.date_end
  delete u.ongoing
  delete u.custom_type_label
  if (u.type === 'custom') {
    u.type = 'achievement'
    const label = updates.custom_type_label
    u.category =
      typeof label === 'string' && label.trim() ? label.trim() : (u.category as string | null) ?? 'Custom'
  }
  return u
}

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
    let { data, error } = await this.supabase
      .from('highlights')
      .insert([highlight as unknown as Record<string, unknown>])
      .select()
      .single()

    if (error && shouldRetryHighlightWithLegacyPayload(error)) {
      const legacy = toLegacyHighlightInsert(highlight)
      const second = await this.supabase
        .from('highlights')
        .insert([legacy])
        .select()
        .single()
      data = second.data
      error = second.error
    }

    if (error) {
      const msg = formatSupabaseError(error)
      console.error('Error creating highlight:', msg, error)
      throw new Error(
        msg ||
          'Failed to create highlight. If you recently updated the app, run the latest database migration for highlights.'
      )
    }

    return data as Highlight
  }

  // Legacy method for backward compatibility
  async createAchievement(achievement: NewHighlight): Promise<Highlight> {
    return this.createHighlight(achievement)
  }

  /**
   * Update an existing highlight
   */
  async updateHighlight(id: string, updates: UpdateHighlight): Promise<Highlight> {
    let { data, error } = await this.supabase
      .from('highlights')
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single()

    if (error && shouldRetryHighlightWithLegacyPayload(error)) {
      const legacy = toLegacyHighlightUpdate(updates)
      const second = await this.supabase
        .from('highlights')
        .update(legacy)
        .eq('id', id)
        .select()
        .single()
      data = second.data
      error = second.error
    }

    if (error) {
      const msg = formatSupabaseError(error)
      console.error('Error updating highlight:', msg, error)
      throw new Error(
        msg ||
          'Failed to update highlight. If you recently updated the app, run the latest database migration for highlights.'
      )
    }

    return data as Highlight
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

