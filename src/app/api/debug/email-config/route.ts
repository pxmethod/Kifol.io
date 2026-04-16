import { NextResponse } from 'next/server';
import { getAppUrl } from '@/config/domains';
import { normalizeMailerSendApiKey } from '@/lib/email/client';
import { isProductionBuild } from '@/lib/env/deploy';

/**
 * Diagnostic endpoint for local / non-production builds only.
 * Disabled in production builds to avoid reconnaissance (key length, template flags, etc.).
 */
export async function GET() {
  if (isProductionBuild()) {
    return new NextResponse(null, { status: 404 });
  }

  const raw = process.env.MAILERSEND_API_KEY;
  const normalized = normalizeMailerSendApiKey(raw);
  const hasWelcomeTemplate = !!process.env.MAILERSEND_TEMPLATE_WELCOME;
  const appUrl = getAppUrl();

  const rawLooksQuoted =
    typeof raw === 'string' &&
    ((raw.trim().startsWith('"') && raw.trim().endsWith('"')) ||
      (raw.trim().startsWith("'") && raw.trim().endsWith("'")));
  const rawLooksBearer = typeof raw === 'string' && /^bearer\s/i.test(raw.trim());

  const hasMailerSendKey = normalized.length > 0;
  const emailConfigured = hasMailerSendKey;

  let message: string;
  if (!hasMailerSendKey) {
    message =
      'MAILERSEND_API_KEY is missing or empty after normalization. Add the token in your host’s environment variables, then redeploy.';
  } else if (rawLooksQuoted || rawLooksBearer) {
    message =
      'Key is present but looked like it included quotes or a Bearer prefix; the app normalizes that. If you still see 401 Unauthenticated from MailerSend, regenerate the token and ensure Production env has the new value.';
  } else {
    message =
      'MailerSend API key is set (length OK). If sends return 401 Unauthenticated, the token is invalid or revoked—create a new token with sending permission in MailerSend and update the env var.';
  }

  return NextResponse.json({
    emailConfigured,
    hasMailerSendKey,
    /** Character count after trim / strip quotes / strip Bearer (not the raw env string). */
    normalizedKeyLength: normalized.length,
    rawLooksQuoted,
    rawLooksBearer,
    hasWelcomeTemplate,
    appUrl,
    message,
  });
}
