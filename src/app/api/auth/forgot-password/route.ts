import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email/service';
import { getAppUrl } from '@/config/domains';

/**
 * Request a password reset. Uses Supabase admin generateLink + our own email (MailerSend template or HTML).
 * Requires SUPABASE_SERVICE_ROLE_KEY and MAILERSEND_API_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const redirectTo = `${getAppUrl()}/auth/reset-password`;
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: { redirectTo },
    });

    if (error) {
      // Don't reveal whether the user exists
      console.error('Forgot password generateLink error:', error.message);
      return NextResponse.json({ success: true });
    }

    const actionLink = data?.properties?.action_link;
    if (!actionLink) {
      return NextResponse.json({ success: true });
    }

    // Build full URL if action_link is relative
    const resetUrl = actionLink.startsWith('http')
      ? actionLink
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')}/${actionLink}`;

    const userName = email.split('@')[0];
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h default

    const emailResult = await sendPasswordResetEmail({
      to: email,
      subject: 'Reset your Kifolio password',
      userName,
      resetUrl,
      expiresAt,
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    // Always return success to avoid email enumeration
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Forgot password API error:', err);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
