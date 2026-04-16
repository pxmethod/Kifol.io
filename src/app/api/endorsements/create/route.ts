import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/crypto';
import { EndorsementService } from '@/lib/database/endorsements';
import { sendEndorsementRequestEmail } from '@/lib/email/service';
import { getAppUrl } from '@/config/domains';
import { isDeployProduction } from '@/lib/env/deploy';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

/** Safe one-line detail for the client when email send fails (no secrets). */
function sanitizeEmailErrorForClient(message: string | undefined): string | undefined {
  if (!message || typeof message !== 'string') return undefined;
  const oneLine = message.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!oneLine) return undefined;
  return oneLine.slice(0, 400);
}

/**
 * After a browser-side insert, the server may occasionally not see the row on the first read.
 * Short backoff retries avoid a false 404 and a skipped invitation email.
 */
async function fetchHighlightForEndorsement(
  supabase: SupabaseClient<Database>,
  achievementId: string,
  portfolioId?: string
): Promise<{ id: string; title: string | null } | null> {
  const delaysMs = [0, 80, 160, 320, 640, 1280];
  for (const delay of delaysMs) {
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }
    let q = supabase.from('highlights').select('id, title').eq('id', achievementId);
    if (portfolioId) {
      q = q.eq('portfolio_id', portfolioId);
    }
    const { data, error } = await q.maybeSingle();
    if (error) {
      console.error('[Endorsements] Highlight fetch error:', error);
      return null;
    }
    if (data) return data;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { achievementId, portfolioId: portfolioIdRaw, instructorName, instructorEmail, relationship } = body;

    if (!achievementId || !instructorName || !instructorEmail || !relationship) {
      return NextResponse.json(
        { error: 'Missing required fields: achievementId, instructorName, instructorEmail, relationship' },
        { status: 400 }
      );
    }

    if (!isUuid(achievementId)) {
      return NextResponse.json({ error: 'Invalid achievement id' }, { status: 400 });
    }

    const portfolioId =
      portfolioIdRaw !== undefined && portfolioIdRaw !== null && String(portfolioIdRaw).trim() !== ''
        ? String(portfolioIdRaw).trim()
        : undefined;
    if (portfolioId !== undefined && !isUuid(portfolioId)) {
      return NextResponse.json({ error: 'Invalid portfolio id' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(instructorEmail).trim())) {
      return NextResponse.json({ error: 'Invalid instructor email' }, { status: 400 });
    }

    let achievement = await fetchHighlightForEndorsement(supabase, achievementId, portfolioId);
    // If the client sent a mismatched portfolioId (or a race after save), retry without the
    // portfolio filter—RLS still restricts rows to highlights the user may access.
    if (!achievement && portfolioId) {
      achievement = await fetchHighlightForEndorsement(supabase, achievementId, undefined);
    }

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    const token = generateToken();
    const endorsementService = new EndorsementService(supabase);

    const requestRecord = await endorsementService.createRequest({
      achievementId,
      instructorName: String(instructorName).trim(),
      instructorEmail: String(instructorEmail).trim().toLowerCase(),
      relationship: String(relationship).trim(),
      token,
    });

    const endorseUrl = `${getAppUrl()}/endorse/${token}`;

    // Skip email for local/preview only — never in customer-facing production (avoids leaking endorseUrl in API responses)
    if (process.env.ENDORSEMENT_SKIP_SEND === 'true' && !isDeployProduction()) {
      console.log('[Endorsements] Skipping send (ENDORSEMENT_SKIP_SEND=true). Endorse URL:', endorseUrl);
      return NextResponse.json({
        success: true,
        id: requestRecord.id,
        emailSent: false,
        emailSkipped: true,
        message: 'Endorsement request created (email send skipped for this environment)',
        endorseUrl,
      });
    }

    const emailResult = await sendEndorsementRequestEmail({
      to: requestRecord.instructor_email,
      subject: 'Leave a comment about a student achievement - Kifolio',
      instructorName: requestRecord.instructor_name,
      achievementTitle: achievement.title?.trim() || 'this highlight',
      endorseUrl,
    });

    if (!emailResult.success) {
      console.error('[Endorsements] Email send failed:', emailResult.error);
      // Request is persisted; do not 500—client can copy endorseUrl for the instructor
      return NextResponse.json({
        success: true,
        id: requestRecord.id,
        emailSent: false,
        endorseUrl,
        emailError: sanitizeEmailErrorForClient(emailResult.error),
        message:
          'Endorsement request saved. The invitation email could not be sent—copy the link below to share with your instructor.',
      });
    }

    return NextResponse.json({
      success: true,
      id: requestRecord.id,
      emailSent: true,
      message: 'Endorsement request sent',
    });
  } catch (error) {
    console.error('[Endorsements] Create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Maximum') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
