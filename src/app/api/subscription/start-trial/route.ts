import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionService } from '@/lib/services/subscription';
import { 
  sendTrialStartEmail 
} from '@/lib/email/service';
import { 
  TrialStartData 
} from '@/lib/email/types';

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
      .select('email, name, subscription_plan, trial_used')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already on trial or premium
    if (userData.subscription_plan !== 'free') {
      return NextResponse.json({ 
        error: 'User is already on a trial or premium plan' 
      }, { status: 400 });
    }

    // Check if user has already used their trial
    if (userData.trial_used) {
      return NextResponse.json({ 
        error: 'You have already used your 14-day free trial. Please upgrade to Premium to access all features.' 
      }, { status: 400 });
    }

    // Start the trial using server-side service
    const result = await SubscriptionService.startTrial(user.id);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to start trial' 
      }, { status: 500 });
    }

    // Send trial start email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const supportEmail = process.env.SUPPORT_EMAIL || 'support@kifol.io';

      const trialStartData: TrialStartData = {
        to: userData.email,
        subject: 'Welcome to Kifolio Premium Trial!',
        userName: userData.name || 'User',
        trialStartDate: new Date().toLocaleDateString(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        dashboardUrl: `${baseUrl}/dashboard`,
        pricingUrl: `${baseUrl}/pricing`,
        supportEmail,
        privacyUrl: `${baseUrl}/privacy`,
        termsUrl: `${baseUrl}/terms`,
      };

      await sendTrialStartEmail(trialStartData);
    } catch (emailError) {
      console.error('Error sending trial start email:', emailError);
      // Don't fail the trial start if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Trial started successfully' 
    });

  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
