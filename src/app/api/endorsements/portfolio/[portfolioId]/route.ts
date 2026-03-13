import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EndorsementService } from '@/lib/database/endorsements';

/**
 * GET /api/endorsements/portfolio/[portfolioId]
 * Returns submitted endorsements for all highlights in the portfolio.
 * Used by both parent admin and public portfolio views.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get all highlight IDs for this portfolio
    const { data: highlights, error: highlightsError } = await supabase
      .from('highlights')
      .select('id')
      .eq('portfolio_id', portfolioId);

    if (highlightsError || !highlights?.length) {
      return NextResponse.json({ endorsements: {} });
    }

    const achievementIds = highlights.map((h) => h.id);
    const endorsementService = new EndorsementService(supabase);
    const grouped = await endorsementService.getSubmittedByAchievementIds(achievementIds);

    // Map to display-safe format (exclude instructor_email, token, etc.)
    const result: Record<string, Array<{
      id: string;
      instructorName: string;
      instructorTitle: string | null;
      organization: string | null;
      comment: string;
      submittedAt: string | null;
    }>> = {};

    for (const [aid, endorsements] of Object.entries(grouped)) {
      result[aid] = endorsements.map((e) => ({
        id: e.id,
        instructorName: e.instructor_name,
        instructorTitle: e.instructor_title,
        organization: e.organization,
        comment: e.comment || '',
        submittedAt: e.submitted_at,
      }));
    }

    return NextResponse.json({ endorsements: result });
  } catch (error) {
    console.error('[Endorsements] Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch endorsements' },
      { status: 500 }
    );
  }
}
