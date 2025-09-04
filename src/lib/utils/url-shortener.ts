// URL shortening utilities for portfolio URLs

/**
 * Generate a short, user-friendly ID for portfolios
 * This creates a 6-character alphanumeric code that's easier to share
 */
export function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Generate 6-character code
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generate a short portfolio URL
 * Format: kifol.io/p/ABC123
 */
export function generateShortPortfolioUrl(portfolioId: string, shortId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kifol.io';
  const shortCode = shortId || generateShortId();
  return `${baseUrl}/p/${shortCode}`;
}

/**
 * Extract short ID from short URL
 */
export function extractShortIdFromUrl(url: string): string | null {
  const match = url.match(/\/p\/([A-Za-z0-9]{6})$/);
  return match ? match[1] : null;
}

/**
 * Validate short ID format
 */
export function isValidShortId(shortId: string): boolean {
  return /^[A-Za-z0-9]{6}$/.test(shortId);
}
