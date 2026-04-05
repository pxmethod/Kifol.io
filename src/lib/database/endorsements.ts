import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type EndorsementRequest = Database['public']['Tables']['endorsement_requests']['Row'];
type NewEndorsementRequest = Database['public']['Tables']['endorsement_requests']['Insert'];

/**
 * Max concurrent open invitation links per highlight (pending, within INVITE_VALID_DAYS).
 * High enough for several instructors and retries; still bounds abuse.
 */
export const MAX_OPEN_ENDORSEMENT_INVITES_PER_HIGHLIGHT = 6;
/** Must stay aligned with endorsement link expiry in API routes and submitByToken. */
const INVITE_VALID_DAYS = 30;

export class EndorsementService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create an endorsement request. Caller must use authenticated client;
   * RLS ensures user owns the achievement's portfolio.
   */
  async createRequest(data: {
    achievementId: string;
    instructorName: string;
    instructorEmail: string;
    relationship: string;
    token: string;
  }): Promise<EndorsementRequest> {
    // Anti-spam: cap *open* invitations only. Submitted endorsements do not consume a slot (parents
    // would otherwise hit the limit with many completed endorsements and still have pending invites).
    // Stale `pending` rows past the link window are excluded so expired links free a slot even if the
    // row was never updated to `expired` in the database.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - INVITE_VALID_DAYS);

    const { count, error: countError } = await this.supabase
      .from('endorsement_requests')
      .select('*', { count: 'exact', head: true })
      .eq('achievement_id', data.achievementId)
      .eq('status', 'pending')
      .gte('created_at', cutoff.toISOString());

    if (countError) {
      console.error('Error counting endorsement requests:', countError);
      throw new Error('Failed to create endorsement request');
    }

    if ((count ?? 0) >= MAX_OPEN_ENDORSEMENT_INVITES_PER_HIGHLIGHT) {
      throw new Error(
        `Maximum ${MAX_OPEN_ENDORSEMENT_INVITES_PER_HIGHLIGHT} open invitation links per highlight. ` +
          `You may already have pending requests from the last ${INVITE_VALID_DAYS} days—they are not shown as endorsements until the instructor completes the form.`
      );
    }

    const insert: NewEndorsementRequest = {
      achievement_id: data.achievementId,
      instructor_name: data.instructorName,
      instructor_email: data.instructorEmail,
      relationship: data.relationship,
      token: data.token,
      status: 'pending',
    };

    const { data: created, error } = await this.supabase
      .from('endorsement_requests')
      .insert([insert])
      .select()
      .single();

    if (error) {
      console.error('Error creating endorsement request:', error);
      throw new Error('Failed to create endorsement request');
    }

    return created;
  }

  /**
   * Get endorsement request by token. Use service role client for public page.
   */
  async getByToken(token: string): Promise<EndorsementRequest | null> {
    const { data, error } = await this.supabase
      .from('endorsement_requests')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching endorsement by token:', error);
      throw new Error('Failed to fetch endorsement request');
    }

    return data;
  }

  /**
   * Submit endorsement (update by token). Use service role client for public page.
   * Only allows submit when status is pending.
   */
  async submitByToken(data: {
    token: string;
    comment: string;
    instructorTitle: string;
    organization: string;
  }): Promise<EndorsementRequest> {
    const { data: existing, error: fetchError } = await this.supabase
      .from('endorsement_requests')
      .select('*')
      .eq('token', data.token)
      .single();

    if (fetchError || !existing) {
      throw new Error('Invalid or expired link');
    }

    if (existing.status !== 'pending') {
      throw new Error('This endorsement has already been submitted');
    }

    // Expiry check at read time: created_at + 30 days
    const createdAt = new Date(existing.created_at);
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + INVITE_VALID_DAYS);
    if (new Date() > expiresAt) {
      throw new Error('This endorsement link has expired');
    }

    const { data: updated, error } = await this.supabase
      .from('endorsement_requests')
      .update({
        status: 'submitted',
        comment: data.comment.trim(),
        instructor_title: data.instructorTitle.trim(),
        organization: data.organization.trim(),
        submitted_at: new Date().toISOString(),
      })
      .eq('token', data.token)
      .select()
      .single();

    if (error) {
      console.error('Error submitting endorsement:', error);
      throw new Error('Failed to submit endorsement');
    }

    return updated;
  }

  /**
   * Get submitted endorsements for an achievement (for timeline display).
   */
  async getSubmittedByAchievement(achievementId: string): Promise<EndorsementRequest[]> {
    const { data, error } = await this.supabase
      .from('endorsement_requests')
      .select('*')
      .eq('achievement_id', achievementId)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching endorsements:', error);
      throw new Error('Failed to fetch endorsements');
    }

    return data || [];
  }

  /**
   * Delete an endorsement by ID. Caller must verify portfolio ownership before calling.
   */
  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('endorsement_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting endorsement:', error);
      throw new Error('Failed to delete endorsement');
    }
  }

  /**
   * Get submitted endorsements for multiple achievements, grouped by achievement_id.
   */
  async getSubmittedByAchievementIds(
    achievementIds: string[]
  ): Promise<Record<string, EndorsementRequest[]>> {
    if (achievementIds.length === 0) return {};

    const { data, error } = await this.supabase
      .from('endorsement_requests')
      .select('*')
      .in('achievement_id', achievementIds)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching endorsements:', error);
      throw new Error('Failed to fetch endorsements');
    }

    const grouped: Record<string, EndorsementRequest[]> = {};
    for (const row of data || []) {
      if (!grouped[row.achievement_id]) {
        grouped[row.achievement_id] = [];
      }
      grouped[row.achievement_id].push(row);
    }
    return grouped;
  }
}
