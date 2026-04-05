/**
 * Create an endorsement invite via POST /api/endorsements/create.
 * Retries on 404 after highlight save so the server can see the new row; normalizes boolean fields from JSON.
 */
function toBool(v: unknown): boolean | undefined {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return undefined;
}

function classifyInviteResponse(
  res: Response,
  data: {
    success?: boolean;
    emailSent?: unknown;
    emailSkipped?: unknown;
    endorseUrl?: string;
  } | null
): 'ok' | 'no_email' | 'error' | 'retry_404' {
  if (res.status === 404) {
    return 'retry_404';
  }
  if (!res.ok || !data?.success) {
    return 'error';
  }

  const sent = toBool(data.emailSent);
  const skipped = toBool(data.emailSkipped);

  if (sent === true) {
    return 'ok';
  }
  if (skipped === true || sent === false) {
    return 'no_email';
  }

  // success without explicit emailSent — treat as failure to avoid a false "sent" UX
  return 'error';
}

/**
 * Create an endorsement invite via API; best-effort copy instructor link when email is not sent.
 * Retries on 404 so saves that finish on the browser can be followed by a server read that lags briefly.
 */
export async function submitEndorsementInviteRequest(payload: {
  achievementId: string;
  /** When set, the API scopes the highlight lookup to this portfolio (recommended from highlight forms). */
  portfolioId?: string;
  instructorName: string;
  instructorEmail: string;
  relationship: string;
}): Promise<'ok' | 'no_email' | 'error'> {
  const delaysMs = [0, 200, 400, 800, 1600];
  const maxAttempts = delaysMs.length;

  try {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (delaysMs[attempt] > 0) {
        await new Promise((r) => setTimeout(r, delaysMs[attempt]));
      }

      const res = await fetch('/api/endorsements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        emailSent?: unknown;
        emailSkipped?: unknown;
        endorseUrl?: string;
      } | null;

      const outcome = classifyInviteResponse(res, data);

      if (outcome === 'retry_404' && attempt < maxAttempts - 1) {
        continue;
      }

      if (outcome === 'error') {
        return 'error';
      }

      if (outcome === 'no_email') {
        const url = data?.endorseUrl;
        if (typeof url === 'string' && url) {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            // Clipboard unavailable — portfolio toast still explains
          }
        }
        return 'no_email';
      }

      if (outcome === 'ok') {
        return 'ok';
      }

      return 'error';
    }

    return 'error';
  } catch {
    return 'error';
  }
}
