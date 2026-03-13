import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EndorsementService } from '@/lib/database/endorsements';
import { sendEndorsementCompletedEmail } from '@/lib/email/service';
import { getAppUrl } from '@/config/domains';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, comment, instructorTitle, organization } = body;

    if (!token || !comment?.trim()) {
      return NextResponse.json(
        { error: 'Token and comment are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const endorsementService = new EndorsementService(supabase);

    const updated = await endorsementService.submitByToken({
      token,
      comment: comment.trim(),
      instructorTitle: (instructorTitle ?? '').trim(),
      organization: (organization ?? '').trim(),
    });

    console.log('[Endorsements] Submitted:', updated.id, 'status:', updated.status);

    // Send parent notification email
    try {
      const { data: highlight } = await supabase
        .from('highlights')
        .select('id, title, portfolio_id')
        .eq('id', updated.achievement_id)
        .single();

      if (highlight) {
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('id, user_id, child_name')
          .eq('id', highlight.portfolio_id)
          .single();

        if (portfolio) {
          const { data: authUser } = await supabase.auth.admin.getUserById(portfolio.user_id);
          const parentEmail = authUser?.user?.email;

          if (parentEmail) {
            const parts: string[] = [];
            if (updated.instructor_title) parts.push(updated.instructor_title);
            if (updated.organization) parts.push(`at ${updated.organization}`);
            const instructorCredentials = parts.length > 0 ? ` (${parts.join(' ')})` : '';

            const portfolioUrl = `${getAppUrl()}/portfolio/${portfolio.id}`;

            const { data: profile } = await supabase
              .from('users')
              .select('name')
              .eq('id', portfolio.user_id)
              .single();

            const parentName = profile?.name?.trim() || 'there';

            if (process.env.ENDORSEMENT_SKIP_SEND === 'true') {
              console.log('[Endorsements] Skipping parent notification (ENDORSEMENT_SKIP_SEND=true)');
            } else {
              await sendEndorsementCompletedEmail({
                to: parentEmail,
                subject: `Someone left an endorsement on ${portfolio.child_name}'s highlight - Kifolio`,
                parentName,
                childName: portfolio.child_name,
                achievementTitle: highlight.title,
                instructorName: updated.instructor_name,
                instructorCredentials,
                comment: updated.comment || '',
                portfolioUrl,
              });
            }
          }
        }
      }
    } catch (emailErr) {
      console.error('[Endorsements] Parent notification email failed:', emailErr);
      // Don't fail the request - endorsement was already saved
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your endorsement has been submitted.',
    });
  } catch (error) {
    console.error('[Endorsements] Submit error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit endorsement';
    const status = message.includes('Invalid') || message.includes('expired') || message.includes('already') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
