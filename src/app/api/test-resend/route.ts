import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    console.log('=== RESEND TEST DEBUG ===');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length);
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not configured',
        success: false
      });
    }

    // Test sending a simple email
    const { data, error } = await resend.emails.send({
      from: 'Kifolio <noreply@kifol.io>',
      to: ['john@kifol.io'],
      subject: 'Test Email from Kifolio',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });

    if (error) {
      console.error('Resend test error:', error);
      return NextResponse.json({
        error: 'Failed to send test email',
        details: error,
        success: false
      });
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Resend test error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
}
