/**
 * Base app URL with no trailing slash. Use for auth redirects, verification links, and emails.
 * Set NEXT_PUBLIC_APP_URL in production (e.g. Vercel) to your app origin (e.g. https://my.kifol.io).
 */
export function getAppUrl(): string {
  const raw =
    typeof process.env.NEXT_PUBLIC_APP_URL === 'string' &&
    process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.NODE_ENV === 'production'
        ? 'https://kifol.io'
        : 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

// Domain configuration for Kifolio
export const DOMAIN_CONFIG = {
  // Main app domain (use getAppUrl() for redirects/emails to avoid trailing slash)
  APP_URL: getAppUrl(),
  
  // Portfolio subdomain for sharing
  PORTFOLIO_DOMAIN: process.env.NEXT_PUBLIC_PORTFOLIO_DOMAIN || 'my.kifol.io',
  
  // Full portfolio URL format
  getPortfolioUrl: (portfolioId: string) => {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${DOMAIN_CONFIG.PORTFOLIO_DOMAIN}/${portfolioId}`;
  },
  
  // Check if current host is portfolio domain
  isPortfolioDomain: (host: string) => {
    return host === DOMAIN_CONFIG.PORTFOLIO_DOMAIN;
  }
};
