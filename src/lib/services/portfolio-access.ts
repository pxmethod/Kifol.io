import { createClient } from '@/lib/supabase/client';

export interface PortfolioAccess {
  portfolioId: string;
  hasAccess: boolean;
  accessType: 'owner' | 'password' | 'public' | 'denied';
  expiresAt?: string;
}

export interface PasswordVerification {
  portfolioId: string;
  password: string;
}

export class PortfolioAccessService {
  private supabase = createClient();

  /**
   * Check if a user has access to a portfolio
   */
  async checkAccess(portfolioId: string): Promise<PortfolioAccess> {
    try {
      // Get portfolio details first
      const { data: portfolio, error } = await this.supabase
        .from('portfolios')
        .select('is_private, password, user_id')
        .eq('id', portfolioId)
        .single();

      if (error || !portfolio) {
        return {
          portfolioId,
          hasAccess: false,
          accessType: 'denied'
        };
      }

      // If portfolio is public, everyone has access
      if (!portfolio.is_private) {
        return {
          portfolioId,
          hasAccess: true,
          accessType: 'public'
        };
      }

      // For private portfolios, check if user is authenticated
      try {
        const { data: { user } } = await this.supabase.auth.getUser();
        
        // If user is owner, they have access
        if (user && user.id === portfolio.user_id) {
          return {
            portfolioId,
            hasAccess: true,
            accessType: 'owner'
          };
        }

        // Check if user has password access (from session storage)
        const hasPasswordAccess = this.checkPasswordAccess(portfolioId);
        if (hasPasswordAccess) {
          return {
            portfolioId,
            hasAccess: true,
            accessType: 'password'
          };
        }
      } catch (authError) {
        // User is not authenticated, check password access only
        const hasPasswordAccess = this.checkPasswordAccess(portfolioId);
        if (hasPasswordAccess) {
          return {
            portfolioId,
            hasAccess: true,
            accessType: 'password'
          };
        }
      }

      // No access
      return {
        portfolioId,
        hasAccess: false,
        accessType: 'denied'
      };
    } catch (error) {
      console.error('Error checking portfolio access:', error);
      return {
        portfolioId,
        hasAccess: false,
        accessType: 'denied'
      };
    }
  }

  /**
   * Verify password for a private portfolio
   */
  async verifyPassword(portfolioId: string, password: string): Promise<boolean> {
    try {
      // Get portfolio password
      const { data: portfolio, error } = await this.supabase
        .from('portfolios')
        .select('password, is_private')
        .eq('id', portfolioId)
        .single();

      if (error || !portfolio) {
        return false;
      }

      // Check if portfolio is private and password matches
      if (portfolio.is_private && portfolio.password === password) {
        // Grant access for this session
        this.grantPasswordAccess(portfolioId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Grant password access for current session
   */
  private grantPasswordAccess(portfolioId: string): void {
    try {
      const accessKey = `portfolio_access_${portfolioId}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      const accessData = {
        portfolioId,
        grantedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      };

      sessionStorage.setItem(accessKey, JSON.stringify(accessData));
    } catch (error) {
      console.error('Error granting password access:', error);
    }
  }

  /**
   * Check if user has password access for a portfolio
   */
  private checkPasswordAccess(portfolioId: string): boolean {
    try {
      const accessKey = `portfolio_access_${portfolioId}`;
      const accessData = sessionStorage.getItem(accessKey);
      
      if (!accessData) {
        return false;
      }

      const access = JSON.parse(accessData);
      const now = new Date();
      const expiresAt = new Date(access.expiresAt);

      // Check if access has expired
      if (now > expiresAt) {
        sessionStorage.removeItem(accessKey);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking password access:', error);
      return false;
    }
  }

  /**
   * Revoke password access for a portfolio
   */
  revokePasswordAccess(portfolioId: string): void {
    try {
      const accessKey = `portfolio_access_${portfolioId}`;
      sessionStorage.removeItem(accessKey);
    } catch (error) {
      console.error('Error revoking password access:', error);
    }
  }

  /**
   * Clear all password access (logout)
   */
  clearAllPasswordAccess(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('portfolio_access_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing password access:', error);
    }
  }
}

export const portfolioAccessService = new PortfolioAccessService();
