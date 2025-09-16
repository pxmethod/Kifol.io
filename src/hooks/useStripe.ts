import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface StripeCheckoutData {
  billingCycle: 'monthly' | 'yearly';
}

export interface StripeCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  clientSecret?: string;
  error?: string;
}

export function useStripe() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (data: StripeCheckoutData): Promise<StripeCheckoutResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      return {
        success: true,
        checkoutUrl: result.checkoutUrl,
        clientSecret: result.clientSecret,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async (): Promise<{ success: boolean; portalUrl?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create customer portal session');
      }

      return {
        success: true,
        portalUrl: result.portalUrl,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCheckout = async (data: StripeCheckoutData) => {
    const result = await createCheckoutSession(data);
    
    if (result.success && result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    } else {
      setError(result.error || 'Failed to create checkout session');
    }
  };

  const redirectToCustomerPortal = async () => {
    const result = await openCustomerPortal();
    
    if (result.success && result.portalUrl) {
      window.location.href = result.portalUrl;
    } else {
      setError(result.error || 'Failed to open customer portal');
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    redirectToCheckout,
    redirectToCustomerPortal,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
