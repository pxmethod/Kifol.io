import { createHmac, timingSafeEqual } from 'crypto';

const HMAC_ALG = 'sha256';
/** Links expire after this window (aligned with typical verification expectations). */
const TOKEN_MAX_AGE_MS = 72 * 60 * 60 * 1000;

function normalizeVerificationSecret(raw: string | undefined): string {
  if (raw == null) return '';
  let s = String(raw).trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function getSecret(): string | null {
  const s = normalizeVerificationSecret(process.env.EMAIL_VERIFICATION_SECRET);
  if (!s || s.length < 32) return null;
  return s;
}

export function isEmailVerificationConfigured(): boolean {
  return getSecret() !== null;
}

/** For server logs only — does not expose the secret. */
export function emailVerificationSecretDiagnostics(): {
  envVarPresent: boolean;
  normalizedLength: number;
} {
  const raw = process.env.EMAIL_VERIFICATION_SECRET;
  return {
    envVarPresent: raw !== undefined,
    normalizedLength: normalizeVerificationSecret(raw).length,
  };
}

/**
 * Create a signed verification token for the signup email link.
 * Requires EMAIL_VERIFICATION_SECRET (min 32 characters).
 */
export function createEmailVerificationToken(email: string, userId: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error('EMAIL_VERIFICATION_SECRET must be set (min 32 characters)');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const exp = Date.now() + TOKEN_MAX_AGE_MS;
  const payload = { sub: userId, email: normalizedEmail, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac(HMAC_ALG, secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export type ParsedVerificationToken =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'bad_signature' };

export function parseEmailVerificationToken(token: string): ParsedVerificationToken {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: 'invalid' };

  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'invalid' };

  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return { ok: false, reason: 'invalid' };

  const expectedSig = createHmac(HMAC_ALG, secret).update(payloadB64).digest('base64url');
  try {
    const sigBuf = Buffer.from(sig, 'base64url');
    const expBuf = Buffer.from(expectedSig, 'base64url');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return { ok: false, reason: 'bad_signature' };
    }
  } catch {
    return { ok: false, reason: 'bad_signature' };
  }

  let payload: { sub?: string; email?: string; exp?: number };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  if (
    typeof payload.sub !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    return { ok: false, reason: 'invalid' };
  }

  if (Date.now() > payload.exp) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, userId: payload.sub, email: payload.email.trim().toLowerCase() };
}
