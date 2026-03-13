import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EndorsementService } from '@/lib/database/endorsements';

const EXPIRY_DAYS = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const endorsementService = new EndorsementService(supabase);

    const endorsement = await endorsementService.getByToken(token);
    if (!endorsement) {
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }

    // Expiry check at read time
    const createdAt = new Date(endorsement.created_at);
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

    if (new Date() > expiresAt) {
      return NextResponse.json({
        status: 'expired',
        message: 'This endorsement link has expired',
      });
    }

    if (endorsement.status !== 'pending') {
      return NextResponse.json({
        status: 'submitted',
        message: 'This endorsement has already been submitted',
      });
    }

    // Fetch achievement title and child name (from portfolio)
    const { data: highlight } = await supabase
      .from('highlights')
      .select('title, portfolio_id')
      .eq('id', endorsement.achievement_id)
      .single();

    let childName = '';
    if (highlight?.portfolio_id) {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('child_name')
        .eq('id', highlight.portfolio_id)
        .single();
      childName = portfolio?.child_name ?? '';
    }

    return NextResponse.json({
      status: 'pending',
      instructorName: endorsement.instructor_name,
      achievementTitle: highlight?.title ?? 'Achievement',
      relationship: endorsement.relationship,
      childName,
    });
  } catch (error) {
    console.error('[Endorsements] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
