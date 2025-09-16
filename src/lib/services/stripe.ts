import { stripe, STRIPE_PRODUCT_ID, STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export interface CreateSubscriptionData {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  checkoutUrl?: string;
  clientSecret?: string;
  error?: string;
}

export class StripeService {
  /**
   * Create a Stripe customer
   */
  static async createCustomer(email: string, name?: string) {
    if (!stripe) {
      return { 
        success: false, 
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.' 
      };
    }

    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'kifolio_app',
        },
      });
      return { success: true, customerId: customer.id };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create customer' 
      };
    }
  }

  /**
   * Get or create a Stripe customer for a user
   */
  static async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      const supabase = await createClient();
      
      // Check if user already has a Stripe customer ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      // If user already has a customer ID, return it
      if (userData?.stripe_customer_id) {
        return { success: true, customerId: userData.stripe_customer_id };
      }

      // Create new customer
      const customerResult = await this.createCustomer(email, name);
      if (!customerResult.success) {
        return customerResult;
      }

      // Save customer ID to user record
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          stripe_customer_id: customerResult.customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error saving Stripe customer ID:', updateError);
        // Don't fail the operation, customer was created successfully
      }

      return customerResult;
    } catch (error) {
      console.error('Error getting/creating Stripe customer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get/create customer' 
      };
    }
  }

  /**
   * Create a subscription checkout session
   */
  static async createSubscriptionCheckout(data: CreateSubscriptionData): Promise<SubscriptionResult> {
    if (!stripe) {
      return { 
        success: false, 
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.' 
      };
    }

    try {
      // Get or create customer
      const customerResult = await this.getOrCreateCustomer(data.userId, data.userEmail);
      if (!customerResult.success) {
        return { success: false, error: customerResult.error || 'Failed to get/create customer' };
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerResult.customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: data.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          userId: data.userId,
          userEmail: data.userEmail,
        },
        subscription_data: {
          metadata: {
            userId: data.userId,
            userEmail: data.userEmail,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      return {
        success: true,
        subscriptionId: session.id,
        checkoutUrl: session.url || undefined,
        clientSecret: session.client_secret || undefined,
      };
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription checkout',
      };
    }
  }

  /**
   * Create a customer portal session for subscription management
   */
  static async createCustomerPortalSession(customerId: string, returnUrl: string) {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.',
      };
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { success: true, url: session.url };
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create customer portal session',
      };
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string) {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.',
      };
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return { success: true, subscription };
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve subscription',
      };
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string, immediately = false) {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.',
      };
    }

    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      return { success: true, subscription };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      };
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  static async reactivateSubscription(subscriptionId: string) {
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.',
      };
    }

    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return { success: true, subscription };
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reactivate subscription',
      };
    }
  }
}
