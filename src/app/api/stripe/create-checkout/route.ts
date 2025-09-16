import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService } from '@/lib/services/stripe';
import { STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name, subscription_plan')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const { billingCycle } = await request.json();
    
    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ 
        error: 'Invalid billing cycle. Must be "monthly" or "yearly"' 
      }, { status: 400 });
    }

    // Select the appropriate price ID
    const priceId = billingCycle === 'yearly' ? STRIPE_YEARLY_PRICE_ID : STRIPE_MONTHLY_PRICE_ID;
    
    if (!priceId) {
      return NextResponse.json({ 
        error: 'Stripe price ID not configured' 
      }, { status: 500 });
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const result = await StripeService.createSubscriptionCheckout({
      userId: user.id,
      userEmail: userData.email,
      priceId,
      successUrl: `${baseUrl}/profile/billing?success=true`,
      cancelUrl: `${baseUrl}/profile/billing?canceled=true`,
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to create checkout session' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      checkoutUrl: result.checkoutUrl,
      clientSecret: result.clientSecret
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
