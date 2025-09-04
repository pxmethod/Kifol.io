import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('=== FEEDBACK API DEBUG ===');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    
    const { email, type, message } = await request.json();
    console.log('Received data:', { email, type, messageLength: message?.length });

    // Validate required fields
    if (!email || !type || !message) {
      console.log('Validation failed - missing fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Resend is properly configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send feedback email
    console.log('Attempting to send email...');
    const { data, error } = await resend.emails.send({
      from: 'Kifolio <noreply@kifol.io>',
      to: ['john@kifol.io'],
      subject: `Kifolio Feedback: ${type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b9d, #ff8c42); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Feedback Received</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0; font-size: 18px;">Feedback Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">From:</strong> ${email}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Type:</strong> ${type}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Message:</strong>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b9d; white-space: pre-wrap; line-height: 1.6;">
              ${message}
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>This feedback was submitted through the Kifolio feedback form.</p>
            <p>Reply directly to this email to respond to the user.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data?.id);
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
