import { NextRequest, NextResponse } from 'next/server';
import { sendHtmlEmail } from '@/lib/email/service';

const FEEDBACK_TO =
  process.env.FEEDBACK_EMAIL || process.env.SUPPORT_EMAIL || 'support@kifol.io';

/** Escape HTML to prevent injection when embedding user content in email. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const { email, type, message } = await request.json();

    if (!email || !type || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const safeEmail = escapeHtml(String(email).trim());
    const safeType = escapeHtml(String(type));
    const safeMessage = escapeHtml(String(message));

    const result = await sendHtmlEmail(
      FEEDBACK_TO,
      `Kifolio Feedback: ${type}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b9d, #ff8c42); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Feedback Received</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0; font-size: 18px;">Feedback Details</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">From:</strong> ${safeEmail}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Type:</strong> ${safeType}
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #555;">Message:</strong>
            </div>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b9d; white-space: pre-wrap; line-height: 1.6;">
              ${safeMessage}
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 14px;">
            <p>This feedback was submitted through the Kifolio feedback form.</p>
            <p>Reply directly to this email to respond to the user.</p>
          </div>
        </div>
      `,
      { replyTo: String(email).trim() }
    );

    if (!result.success) {
      console.error('[Feedback API] Email send failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('[Feedback API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
