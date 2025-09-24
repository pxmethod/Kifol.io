import { Database } from '@/types/database'
import { Achievement } from '@/types/achievement'

// Database types
type DbPortfolio = Database['public']['Tables']['portfolios']['Row']
type DbHighlight = Database['public']['Tables']['highlights']['Row']

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
  highlights: DbHighlight[] = []
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
    achievements: highlights.map(dbHighlightToLegacy)
  }
}

// Transform legacy portfolio to database format
export function legacyPortfolioToDb(
  legacy: Omit<LegacyPortfolioData, 'id' | 'createdAt' | 'hasUnsavedChanges' | 'achievements'>,
  userId: string
): Omit<Database['public']['Tables']['portfolios']['Insert'], 'short_id'> {
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

// Transform database highlight to legacy format
function dbHighlightToLegacy(dbHighlight: DbHighlight): Achievement {
  return {
    id: dbHighlight.id,
    title: dbHighlight.title,
    date: dbHighlight.date_achieved,
    description: dbHighlight.description || undefined,
    media: dbHighlight.media_urls.map((url, index) => {
      const urlLower = url.toLowerCase();
      const filename = url.split('/').pop() || 'file';
      const extension = filename.split('.').pop()?.toLowerCase() || '';
      
      // Determine media type based on URL and extension
      let mediaType = 'image'; // default
      
      if (urlLower.includes('.pdf') || extension === 'pdf') {
        mediaType = 'pdf';
      } else if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(extension) || 
                 urlLower.includes('mp4') || urlLower.includes('video') || 
                 urlLower.includes('highlight-media')) {
        mediaType = 'video';
      } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(extension)) {
        mediaType = 'audio';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        mediaType = 'image';
      } else if (urlLower.includes('storage') && !urlLower.includes('image') && !urlLower.includes('photo')) {
        // For storage URLs without clear extensions, assume video if not explicitly image
        mediaType = 'video';
      }
      
      return {
        id: `media-${index}`,
        url,
        type: mediaType,
        fileName: filename,
        fileSize: 0 // We don't store file size in current schema
      };
    }),
    type: dbHighlight.type,
    isMilestone: dbHighlight.type === 'milestone',
    createdAt: dbHighlight.created_at,
    updatedAt: dbHighlight.updated_at
  }
}

// Transform legacy achievement to database format
export function legacyAchievementToDb(
  legacy: Achievement,
  portfolioId: string
): Database['public']['Tables']['highlights']['Insert'] {
  return {
    portfolio_id: portfolioId,
    title: legacy.title,
    description: legacy.description || null,
    date_achieved: legacy.date,
    media_urls: legacy.media.map(m => m.url),
    category: legacy.isMilestone ? 'milestone' : null,
    type: legacy.type
  }
}