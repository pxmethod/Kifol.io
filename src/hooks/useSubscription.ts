'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionServiceClient } from '@/lib/services/subscription-client';

export interface SubscriptionDetails {
  plan: 'free' | 'trial' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  isTrialActive: boolean;
  isPremiumActive: boolean;
  limits: {
    maxPortfolios: number;
    maxHighlightsPerPortfolio: number;
    allowedMediaTypes: string[];
    canUseTags: boolean;
    canUseCategories: boolean;
    canExportPDF: boolean;
    canAdvancedShare: boolean;
    supportLevel: 'email' | 'priority';
  };
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    loadSubscription();
  }, [user]);

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const details = await SubscriptionServiceClient.getUserSubscription(user!.id);
      const limits = SubscriptionServiceClient.getPlanLimits(details.plan);

      setSubscription({
        ...details,
        limits
      });
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const startTrial = async () => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch('/api/subscription/start-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        await loadSubscription(); // Refresh subscription details
      }
      return result;
    } catch (err) {
      console.error('Error starting trial:', err);
      return { success: false, error: 'Failed to start trial' };
    }
  };

  const canCreatePortfolio = async () => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };
    return await SubscriptionServiceClient.canCreatePortfolio(user.id);
  };

  const canAddHighlight = async (portfolioId: string) => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };
    return await SubscriptionServiceClient.canAddHighlight(user.id, portfolioId);
  };

  const canUploadMedia = async (fileType: string) => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };
    return await SubscriptionServiceClient.canUploadMedia(user.id, fileType);
  };

  const canUseFeature = async (feature: keyof SubscriptionDetails['limits']) => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };
    return await SubscriptionServiceClient.canUseFeature(user.id, feature);
  };

  return {
    subscription,
    loading,
    error,
    startTrial,
    canCreatePortfolio,
    canAddHighlight,
    canUploadMedia,
    canUseFeature,
    refresh: loadSubscription
  };
}
