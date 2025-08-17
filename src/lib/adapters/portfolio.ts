import { Database } from '@/types/database'
import { Achievement } from '@/types/achievement'

// Database types
type DbPortfolio = Database['public']['Tables']['portfolios']['Row']
type DbAchievement = Database['public']['Tables']['achievements']['Row']

// Legacy localStorage types
export interface LegacyPortfolioData {
  id: string;
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  createdAt: string;
  isPrivate?: boolean;
  password?: string;
  hasUnsavedChanges?: boolean;
  achievements?: Achievement[];
}

// Transform database portfolio to legacy format for existing components
export function dbPortfolioToLegacy(
  dbPortfolio: DbPortfolio, 
  achievements: DbAchievement[] = []
): LegacyPortfolioData {
  return {
    id: dbPortfolio.id,
    childName: dbPortfolio.child_name,
    portfolioTitle: dbPortfolio.portfolio_title,
    photoUrl: dbPortfolio.photo_url || '',
    template: dbPortfolio.template,
    createdAt: dbPortfolio.created_at,
    isPrivate: dbPortfolio.is_private,
    password: dbPortfolio.password || undefined,
    hasUnsavedChanges: false,
    achievements: achievements.map(dbAchievementToLegacy)
  }
}

// Transform legacy portfolio to database format
export function legacyPortfolioToDb(
  legacy: Omit<LegacyPortfolioData, 'id' | 'createdAt' | 'hasUnsavedChanges' | 'achievements'>,
  userId: string
): Database['public']['Tables']['portfolios']['Insert'] {
  return {
    user_id: userId,
    child_name: legacy.childName,
    portfolio_title: legacy.portfolioTitle,
    photo_url: legacy.photoUrl || null,
    template: legacy.template,
    is_private: legacy.isPrivate || false,
    password: legacy.password || null
  }
}

// Transform database achievement to legacy format
function dbAchievementToLegacy(dbAchievement: DbAchievement): Achievement {
  return {
    id: dbAchievement.id,
    title: dbAchievement.title,
    date: dbAchievement.date_achieved,
    description: dbAchievement.description || undefined,
    media: dbAchievement.media_urls.map((url, index) => ({
      id: `media-${index}`,
      url,
      type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
      fileName: url.split('/').pop() || 'file',
      fileSize: 0 // We don't store file size in current schema
    })),
    isMilestone: dbAchievement.category === 'milestone',
    createdAt: dbAchievement.created_at,
    updatedAt: dbAchievement.updated_at
  }
}

// Transform legacy achievement to database format
export function legacyAchievementToDb(
  legacy: Achievement,
  portfolioId: string
): Database['public']['Tables']['achievements']['Insert'] {
  return {
    portfolio_id: portfolioId,
    title: legacy.title,
    description: legacy.description || null,
    date_achieved: legacy.date,
    media_urls: legacy.media.map(m => m.url),
    category: legacy.isMilestone ? 'milestone' : null
  }
}