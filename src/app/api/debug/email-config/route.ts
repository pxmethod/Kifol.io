import { NextResponse } from 'next/server';
import { getAppUrl } from '@/config/domains';

/**
 * Diagnostic endpoint to verify email config in production.
 * Visit https://kifol.io/api/debug/email-config to check if MAILERSEND_API_KEY is set.
 * Safe to expose — returns no secrets.
 */
export async function GET() {
  const hasMailerSendKey = !!process.env.MAILERSEND_API_KEY;
  const hasWelcomeTemplate = !!process.env.MAILERSEND_TEMPLATE_WELCOME;
  const appUrl = getAppUrl();

  return NextResponse.json({
    emailConfigured: hasMailerSendKey,
    hasMailerSendKey,
    hasWelcomeTemplate,
    appUrl,
    message: hasMailerSendKey
      ? 'MailerSend is configured. If verification emails still fail, check Vercel function logs for [signup] errors.'
      : 'MAILERSEND_API_KEY is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.',
  });
}
