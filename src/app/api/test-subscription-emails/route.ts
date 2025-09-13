import { NextRequest, NextResponse } from 'next/server';
import { 
  sendTrialStartEmail, 
  sendTrialEndingEmail, 
  sendTrialEndedEmail 
} from '@/lib/email/service';
import { 
  TrialStartData, 
  TrialEndingData, 
  TrialEndedData 
} from '@/lib/email/types';

export async function POST(request: NextRequest) {
  try {
    const { emailType, testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email is required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@kifol.io';

    let result;

    switch (emailType) {
      case 'trial-start':
        const trialStartData: TrialStartData = {
          to: testEmail,
          subject: 'Welcome to Kifolio Premium Trial!',
          userName: 'Test User',
          trialStartDate: new Date().toLocaleDateString(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          dashboardUrl: `${baseUrl}/dashboard`,
          pricingUrl: `${baseUrl}/pricing`,
          supportEmail,
          privacyUrl: `${baseUrl}/privacy`,
          termsUrl: `${baseUrl}/terms`,
        };
        result = await sendTrialStartEmail(trialStartData);
        break;

      case 'trial-ending':
        const trialEndingData: TrialEndingData = {
          to: testEmail,
          subject: 'Your Kifolio Premium trial ends in 3 days',
          userName: 'Test User',
          trialStartDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          daysRemaining: 3,
          upgradeUrl: `${baseUrl}/profile/billing`,
          dashboardUrl: `${baseUrl}/dashboard`,
          pricingUrl: `${baseUrl}/pricing`,
          supportEmail,
          privacyUrl: `${baseUrl}/privacy`,
          termsUrl: `${baseUrl}/terms`,
        };
        result = await sendTrialEndingEmail(trialEndingData);
        break;

      case 'trial-ended':
        const trialEndedData: TrialEndedData = {
          to: testEmail,
          subject: 'Your Kifolio Premium trial has ended',
          userName: 'Test User',
          trialEndDate: new Date().toLocaleDateString(),
          upgradeUrl: `${baseUrl}/profile/billing`,
          dashboardUrl: `${baseUrl}/dashboard`,
          pricingUrl: `${baseUrl}/pricing`,
          supportEmail,
          privacyUrl: `${baseUrl}/privacy`,
          termsUrl: `${baseUrl}/terms`,
        };
        result = await sendTrialEndedEmail(trialEndedData);
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: result.success, 
      messageId: result.messageId,
      error: result.error 
    });

  } catch (error) {
    console.error('Error testing subscription email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email' 
    }, { status: 500 });
  }
}
