import { Webhook } from 'standardwebhooks';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Supabase Send Email Hook
 *
 * When enabled in Supabase Dashboard (Authentication → Hooks → Send Email Hook),
 * Supabase sends auth emails to this endpoint instead of sending them itself.
 *
 * We use MailerSend templates for signup verification (sent from /api/auth/signup).
 * For signup: we return 200 without sending — our signup API already sent the MailerSend email.
 * For other types (recovery, invite, etc.): return 200 — we handle those via our own APIs
 * (e.g. forgot-password uses generateLink + our MailerSend).
 *
 * Supabase signs payloads per Standard Webhooks. Set SEND_EMAIL_HOOK_SECRET in env
 * (from Supabase Dashboard → Auth Hooks when configuring the hook).
 */
export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET;

  if (!hookSecret) {
    console.error(
      '[supabase-email-hook] SEND_EMAIL_HOOK_SECRET is not set. Disable the Send Email Hook in Supabase until this variable is configured, or Supabase may retry this failing response.'
    );
    return NextResponse.json(
      {
        error:
          'Send Email Hook is not configured (missing SEND_EMAIL_HOOK_SECRET). Do not enable this hook until the secret is set.',
      },
      { status: 503 }
    );
  }

  try {
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    // Supabase secret format: v1,whsec_<base64>
    const base64Secret = hookSecret.replace(/^v1,whsec_/, '');
    const wh = new Webhook(base64Secret);

    const verified = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: { email_action_type: string };
    };

    const { email_action_type } = verified.email_data;

    // Signup: we already sent our MailerSend verification email from /api/auth/signup
    if (email_action_type === 'signup') {
      // No-op — our signup API handles this
      return NextResponse.json({}, { status: 200 });
    }

    // Recovery, invite, magiclink, etc.: we use our own flows (e.g. forgot-password
    // uses generateLink + sendPasswordResetEmail). Return 200 to acknowledge.
    if (
      [
        'recovery',
        'invite',
        'magiclink',
        'email_change',
        'email_change_new',
        'reauthentication',
        'password_changed_notification',
        'email_changed_notification',
      ].includes(email_action_type)
    ) {
      return NextResponse.json({}, { status: 200 });
    }

    // Unknown type — acknowledge to prevent Supabase retries
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error('[supabase-email-hook] Verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 401 }
    );
  }
}
