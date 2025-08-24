// Domain configuration for Kifolio
export const DOMAIN_CONFIG = {
  // Main app domain
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://kifol.io',
  
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
