import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { EndorsementService } from '@/lib/database/endorsements';

/**
 * DELETE /api/endorsements/delete/[id]
 * Removes an endorsement. User must own the portfolio that contains the highlight.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Endorsement ID required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch endorsement
    const { data: endorsement, error: fetchError } = await admin
      .from('endorsement_requests')
      .select('id, achievement_id')
      .eq('id', id)
      .single();

    if (fetchError || !endorsement) {
      return NextResponse.json({ error: 'Endorsement not found' }, { status: 404 });
    }

    // Fetch highlight and portfolio to verify ownership
    const { data: highlight, error: highlightError } = await admin
      .from('highlights')
      .select('id, portfolio_id')
      .eq('id', endorsement.achievement_id)
      .single();

    if (highlightError || !highlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    const { data: portfolio, error: portfolioError } = await admin
      .from('portfolios')
      .select('id, user_id')
      .eq('id', highlight.portfolio_id)
      .single();

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    if (portfolio.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const endorsementService = new EndorsementService(admin);
    await endorsementService.deleteById(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Endorsements] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete endorsement' },
      { status: 500 }
    );
  }
}
