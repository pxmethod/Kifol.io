import crypto from 'crypto';

/**
 * Generate a secure random token for endorsement request links.
 * 32 bytes = 64 hex characters.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
