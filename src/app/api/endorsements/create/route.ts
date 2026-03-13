import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/crypto';
import { EndorsementService } from '@/lib/database/endorsements';
import { sendEndorsementRequestEmail } from '@/lib/email/service';
import { getAppUrl } from '@/config/domains';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { achievementId, instructorName, instructorEmail, relationship } = body;

    if (!achievementId || !instructorName || !instructorEmail || !relationship) {
      return NextResponse.json(
        { error: 'Missing required fields: achievementId, instructorName, instructorEmail, relationship' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(instructorEmail).trim())) {
      return NextResponse.json({ error: 'Invalid instructor email' }, { status: 400 });
    }

    // Fetch achievement (highlight) for title and to verify it exists (RLS ensures user owns it)
    const { data: achievement, error: fetchError } = await supabase
      .from('highlights')
      .select('id, title')
      .eq('id', achievementId)
      .single();

    if (fetchError || !achievement) {
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

    // Skip email when hitting MailerSend trial limits (local dev)
    if (process.env.ENDORSEMENT_SKIP_SEND === 'true') {
      console.log('[Endorsements] Skipping send (ENDORSEMENT_SKIP_SEND=true). Endorse URL:', endorseUrl);
      return NextResponse.json({
        success: true,
        id: requestRecord.id,
        message: 'Endorsement request created',
        endorseUrl, // Include in response for local testing
      });
    }

    const emailResult = await sendEndorsementRequestEmail({
      to: requestRecord.instructor_email,
      subject: 'Leave a comment about a student achievement - Kifolio',
      instructorName: requestRecord.instructor_name,
      achievementTitle: achievement.title,
      endorseUrl,
    });

    if (!emailResult.success) {
      console.error('[Endorsements] Email send failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Endorsement request created but email failed to send', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: requestRecord.id,
      message: 'Endorsement request sent',
    });
  } catch (error) {
    console.error('[Endorsements] Create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('Maximum') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
