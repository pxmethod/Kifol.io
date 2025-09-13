import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  sendTrialEndingEmail, 
  sendTrialEndedEmail 
} from '@/lib/email/service';
import { 
  TrialEndingData, 
  TrialEndedData 
} from '@/lib/email/types';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@kifol.io';

    // Get users whose trials end in 3 days (for reminder emails)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysFromNowISO = threeDaysFromNow.toISOString().split('T')[0]; // YYYY-MM-DD format

    const { data: trialEndingUsers, error: trialEndingError } = await supabase
      .from('users')
      .select('id, email, name, trial_started_at, trial_ends_at')
      .eq('subscription_plan', 'trial')
      .eq('subscription_status', 'active')
      .gte('trial_ends_at', threeDaysFromNowISO)
      .lt('trial_ends_at', new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (trialEndingError) {
      console.error('Error fetching trial ending users:', trialEndingError);
      return NextResponse.json({ error: 'Failed to fetch trial ending users' }, { status: 500 });
    }

    // Send trial ending emails
    for (const user of trialEndingUsers || []) {
      try {
        const trialStartDate = user.trial_started_at ? new Date(user.trial_started_at).toLocaleDateString() : 'Unknown';
        const trialEndDate = user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString() : 'Unknown';
        const daysRemaining = user.trial_ends_at ? 
          Math.ceil((new Date(user.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

        const trialEndingData: TrialEndingData = {
          to: user.email,
          subject: `Your Kifolio Premium trial ends in ${daysRemaining} days`,
          userName: user.name || 'User',
          trialStartDate,
          trialEndDate,
          daysRemaining,
          upgradeUrl: `${baseUrl}/profile/billing`,
          dashboardUrl: `${baseUrl}/dashboard`,
          pricingUrl: `${baseUrl}/pricing`,
          supportEmail,
          privacyUrl: `${baseUrl}/privacy`,
          termsUrl: `${baseUrl}/terms`,
        };

        await sendTrialEndingEmail(trialEndingData);
        console.log(`Sent trial ending email to ${user.email}`);
      } catch (emailError) {
        console.error(`Error sending trial ending email to ${user.email}:`, emailError);
      }
    }

    // Get users whose trials ended today (for trial ended emails)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const { data: trialEndedUsers, error: trialEndedError } = await supabase
      .from('users')
      .select('id, email, name, trial_ends_at')
      .eq('subscription_plan', 'trial')
      .eq('subscription_status', 'active')
      .gte('trial_ends_at', today)
      .lt('trial_ends_at', new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (trialEndedError) {
      console.error('Error fetching trial ended users:', trialEndedError);
      return NextResponse.json({ error: 'Failed to fetch trial ended users' }, { status: 500 });
    }

    // Send trial ended emails and downgrade users to free plan
    for (const user of trialEndedUsers || []) {
      try {
        const trialEndDate = user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString() : 'Unknown';

        const trialEndedData: TrialEndedData = {
          to: user.email,
          subject: 'Your Kifolio Premium trial has ended',
          userName: user.name || 'User',
          trialEndDate,
          upgradeUrl: `${baseUrl}/profile/billing`,
          dashboardUrl: `${baseUrl}/dashboard`,
          pricingUrl: `${baseUrl}/pricing`,
          supportEmail,
          privacyUrl: `${baseUrl}/privacy`,
          termsUrl: `${baseUrl}/terms`,
        };

        await sendTrialEndedEmail(trialEndedData);
        console.log(`Sent trial ended email to ${user.email}`);

        // Downgrade user to free plan
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_plan: 'free',
            subscription_status: 'active',
            trial_started_at: null,
            trial_ends_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`Error downgrading user ${user.email}:`, updateError);
        } else {
          console.log(`Downgraded user ${user.email} to free plan`);
        }
      } catch (emailError) {
        console.error(`Error sending trial ended email to ${user.email}:`, emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      trialEndingCount: trialEndingUsers?.length || 0,
      trialEndedCount: trialEndedUsers?.length || 0
    });

  } catch (error) {
    console.error('Error in trial reminders cron job:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
