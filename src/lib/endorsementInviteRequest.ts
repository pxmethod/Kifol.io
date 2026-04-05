/**
 * Create an endorsement invite via API; best-effort copy instructor link when email is not sent.
 */
export async function submitEndorsementInviteRequest(payload: {
  achievementId: string;
  /** When set, the API scopes the highlight lookup to this portfolio (recommended from highlight forms). */
  portfolioId?: string;
  instructorName: string;
  instructorEmail: string;
  relationship: string;
}): Promise<'ok' | 'no_email' | 'error'> {
  try {
    const base =
      typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${base}/api/endorsements/create`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => null)) as {
      success?: boolean;
      emailSent?: boolean;
      endorseUrl?: string;
    } | null;

    if (!res.ok || !data?.success) {
      return 'error';
    }

    if (data.emailSent === true) {
      return 'ok';
    }

    if (data.emailSent === false) {
      if (data.endorseUrl) {
        try {
          await navigator.clipboard.writeText(data.endorseUrl);
        } catch {
          // Clipboard unavailable (e.g. permissions) — portfolio toast still explains
        }
      }
      return 'no_email';
    }

    // success without explicit emailSent — treat as failure to avoid a false "sent" UX
    return 'error';
  } catch {
    return 'error';
  }
}
