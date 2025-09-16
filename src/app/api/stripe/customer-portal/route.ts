import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StripeService } from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userData.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No Stripe customer found. Please create a subscription first.' 
      }, { status: 400 });
    }

    // Create customer portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const result = await StripeService.createCustomerPortalSession(
      userData.stripe_customer_id,
      `${baseUrl}/profile/billing`
    );

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to create customer portal session' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      portalUrl: result.url
    });

  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
