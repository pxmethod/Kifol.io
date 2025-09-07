import { NextRequest, NextResponse } from 'next/server';
import { 
  sendPasswordResetEmail, 
  sendEngagementEmail, 
  sendInvitationEmail,
  sendEmailVerification,
  sendTestEmail
} from '@/lib/email/service';
import { 
  PasswordResetEmailData, 
  EngagementEmailData, 
  InvitationEmailData,
  EmailVerificationData
} from '@/lib/email/types';

interface EmailRequest {
  type: 'password-reset' | 'engagement' | 'invitation' | 'email-verification' | 'test';
  data: PasswordResetEmailData | EngagementEmailData | InvitationEmailData | EmailVerificationData | { to: string };
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { type, data } = body;

    let result;

    switch (type) {
      case 'password-reset':
        result = await sendPasswordResetEmail(data as PasswordResetEmailData);
        break;
        
      case 'engagement':
        result = await sendEngagementEmail(data as EngagementEmailData);
        break;
        
      case 'invitation':
        result = await sendInvitationEmail(data as InvitationEmailData);
        break;
        
      case 'email-verification':
        result = await sendEmailVerification(data as EmailVerificationData);
        break;
        
      case 'test':
        if (!data.to) {
          return NextResponse.json(
            { error: 'Email address is required for test emails' }, 
            { status: 400 }
          );
        }
        const testEmail = Array.isArray(data.to) ? data.to[0] : data.to;
        result = await sendTestEmail(testEmail);
        break;
        
      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` }, 
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json(
        { error: result.error }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// GET endpoint for testing (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' }, 
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' }, 
      { status: 400 }
    );
  }

  try {
    const result = await sendTestEmail(email);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' }, 
      { status: 500 }
    );
  }
}
