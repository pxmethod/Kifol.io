import { createClient } from '@/lib/supabase/client';

type SubscriptionPlan = 'free' | 'trial' | 'premium';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid';

export interface SubscriptionLimits {
  maxPortfolios: number;
  maxHighlightsPerPortfolio: number;
  allowedMediaTypes: string[];
  canUseTags: boolean;
  canUseCategories: boolean;
  canExportPDF: boolean;
  canAdvancedShare: boolean;
  supportLevel: 'email' | 'priority';
}

export class SubscriptionServiceClient {
  /**
   * Get user's current subscription plan
   */
  static async getUserPlan(userId: string): Promise<SubscriptionPlan> {
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_plan, trial_ends_at, subscription_ends_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return 'free';
    }

    // Check if trial has expired
    if (user.subscription_plan === 'trial' && user.trial_ends_at) {
      const trialEndDate = new Date(user.trial_ends_at);
      if (trialEndDate < new Date()) {
        // Trial expired, downgrade to free
        await this.updateUserPlan(userId, 'free');
        return 'free';
      }
    }

    // Check if premium subscription has expired
    if (user.subscription_plan === 'premium' && user.subscription_ends_at) {
      const subscriptionEndDate = new Date(user.subscription_ends_at);
      if (subscriptionEndDate < new Date()) {
        // Subscription expired, downgrade to free
        await this.updateUserPlan(userId, 'free');
        return 'free';
      }
    }

    return user.subscription_plan as SubscriptionPlan;
  }

  /**
   * Get subscription limits for a plan
   */
  static getPlanLimits(plan: SubscriptionPlan): SubscriptionLimits {
    switch (plan) {
      case 'free':
        return {
          maxPortfolios: 1,
          maxHighlightsPerPortfolio: 10,
          allowedMediaTypes: ['image/jpeg', 'image/png', 'image/webp'],
          canUseTags: false,
          canUseCategories: false,
          canExportPDF: false,
          canAdvancedShare: false,
          supportLevel: 'email'
        };
      
      case 'trial':
      case 'premium':
        return {
          maxPortfolios: -1, // unlimited
          maxHighlightsPerPortfolio: -1, // unlimited
          allowedMediaTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf', 'audio/mpeg', 'audio/wav'],
          canUseTags: true,
          canUseCategories: true,
          canExportPDF: true,
          canAdvancedShare: true,
          supportLevel: 'priority'
        };
      
      default:
        return this.getPlanLimits('free');
    }
  }

  /**
   * Check if user can create a new portfolio
   */
  static async canCreatePortfolio(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const limits = this.getPlanLimits(plan);

    if (limits.maxPortfolios === -1) {
      return { allowed: true };
    }

    // Count existing portfolios
    const supabase = createClient();
    const { count, error } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      return { allowed: false, reason: 'Unable to check portfolio limit' };
    }

    if (count && count >= limits.maxPortfolios) {
      return { 
        allowed: false, 
        reason: `Free plan limited to ${limits.maxPortfolios} portfolio. Upgrade to Premium for unlimited portfolios.` 
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can add a highlight to a portfolio
   */
  static async canAddHighlight(userId: string, portfolioId: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const limits = this.getPlanLimits(plan);

    if (limits.maxHighlightsPerPortfolio === -1) {
      return { allowed: true };
    }

    // Count existing highlights for this portfolio
    const supabase = createClient();
    const { count, error } = await supabase
      .from('highlights')
      .select('*', { count: 'exact', head: true })
      .eq('portfolio_id', portfolioId);

    if (error) {
      return { allowed: false, reason: 'Unable to check highlight limit' };
    }

    if (count && count >= limits.maxHighlightsPerPortfolio) {
      return { 
        allowed: false, 
        reason: `Free plan limited to ${limits.maxHighlightsPerPortfolio} highlights per portfolio. Upgrade to Premium for unlimited highlights.` 
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can upload a specific media type
   */
  static async canUploadMedia(userId: string, fileType: string): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const limits = this.getPlanLimits(plan);

    if (limits.allowedMediaTypes.includes(fileType)) {
      return { allowed: true };
    }

    return { 
      allowed: false, 
      reason: `Free plan only supports photos. Upgrade to Premium to upload videos, PDFs, and audio files.` 
    };
  }

  /**
   * Check if user can use a specific feature
   */
  static async canUseFeature(userId: string, feature: keyof SubscriptionLimits): Promise<{ allowed: boolean; reason?: string }> {
    const plan = await this.getUserPlan(userId);
    const limits = this.getPlanLimits(plan);

    const featureValue = limits[feature];
    
    if (typeof featureValue === 'boolean') {
      if (featureValue) {
        return { allowed: true };
      } else {
        return { 
          allowed: false, 
          reason: `This feature requires Premium. Upgrade to access ${feature}.` 
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Start a 14-day trial for a user
   */
  static async startTrial(userId: string): Promise<{ success: boolean; error?: string }> {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .update({
        subscription_plan: 'trial',
        subscription_status: 'active',
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Update user's subscription plan
   */
  static async updateUserPlan(userId: string, plan: SubscriptionPlan): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .update({
        subscription_plan: plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Get user's subscription details
   */
  static async getUserSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    trialEndsAt?: string;
    subscriptionEndsAt?: string;
    isTrialActive: boolean;
    isPremiumActive: boolean;
  }> {
    const supabase = createClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_plan, subscription_status, trial_ends_at, subscription_ends_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return {
        plan: 'free',
        status: 'active',
        isTrialActive: false,
        isPremiumActive: false
      };
    }

    const now = new Date();
    const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const subscriptionEndsAt = user.subscription_ends_at ? new Date(user.subscription_ends_at) : null;

    const isTrialActive = user.subscription_plan === 'trial' && trialEndsAt ? trialEndsAt > now : false;
    const isPremiumActive = user.subscription_plan === 'premium' && (!subscriptionEndsAt || (subscriptionEndsAt ? subscriptionEndsAt > now : false));

    return {
      plan: user.subscription_plan as SubscriptionPlan,
      status: user.subscription_status as SubscriptionStatus,
      trialEndsAt: user.trial_ends_at,
      subscriptionEndsAt: user.subscription_ends_at,
      isTrialActive,
      isPremiumActive
    };
  }
}
