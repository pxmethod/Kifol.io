import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Invitation = Database['public']['Tables']['invitations']['Row']
type NewInvitation = Database['public']['Tables']['invitations']['Insert']
type UpdateInvitation = Database['public']['Tables']['invitations']['Update']

export class InvitationService {
  private supabase = createClient()

  /**
   * Send an invitation
   */
  async sendInvitation(inviteeEmail: string, expiresAt: Date): Promise<Invitation> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if there's already a pending invitation to this email
    const existingInvitation = await this.getPendingInvitation(inviteeEmail)
    if (existingInvitation) {
      throw new Error('An invitation has already been sent to this email address')
    }

    const newInvitation: NewInvitation = {
      inviter_id: user.id,
      invitee_email: inviteeEmail,
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    }

    const { data, error } = await this.supabase
      .from('invitations')
      .insert([newInvitation])
      .select()
      .single()

    if (error) {
      console.error('Error creating invitation:', error)
      throw new Error('Failed to send invitation')
    }

    return data
  }

  /**
   * Get all invitations sent by the current user
   */
  async getSentInvitations(): Promise<Invitation[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('invitations')
      .select('*')
      .eq('inviter_id', user.id)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('Error fetching sent invitations:', error)
      throw new Error('Failed to fetch invitations')
    }

    return data || []
  }

  /**
   * Get pending invitation by email
   */
  async getPendingInvitation(email: string): Promise<Invitation | null> {
    const { data, error } = await this.supabase
      .from('invitations')
      .select('*')
      .eq('invitee_email', email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching pending invitation:', error)
      return null
    }

    return data
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(invitationId: string): Promise<Invitation> {
    const updates: UpdateInvitation = {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('invitations')
      .update(updates)
      .eq('id', invitationId)
      .select()
      .single()

    if (error) {
      console.error('Error accepting invitation:', error)
      throw new Error('Failed to accept invitation')
    }

    return data
  }

  /**
   * Mark expired invitations
   */
  async markExpiredInvitations(): Promise<number> {
    const { data, error } = await this.supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Error marking expired invitations:', error)
      throw new Error('Failed to update expired invitations')
    }

    return data?.length || 0
  }

  /**
   * Get invitation statistics for the current user
   */
  async getInvitationStats(): Promise<{
    total: number
    pending: number
    accepted: number
    expired: number
  }> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('invitations')
      .select('status')
      .eq('inviter_id', user.id)

    if (error) {
      console.error('Error fetching invitation stats:', error)
      throw new Error('Failed to fetch invitation statistics')
    }

    const stats = {
      total: data.length,
      pending: 0,
      accepted: 0,
      expired: 0
    }

    data.forEach((invitation: Invitation) => {
      switch (invitation.status) {
        case 'pending':
          stats.pending++
          break
        case 'accepted':
          stats.accepted++
          break
        case 'expired':
          stats.expired++
          break
      }
    })

    return stats
  }

  /**
   * Check if invitation is valid for sign-up
   */
  async validateInvitationForSignup(email: string): Promise<{
    isValid: boolean
    invitation?: Invitation
  }> {
    const invitation = await this.getPendingInvitation(email)
    
    if (!invitation) {
      return { isValid: false }
    }

    // Check if invitation is still valid (not expired)
    const isValid = new Date(invitation.expires_at) > new Date()
    
    return {
      isValid,
      invitation: isValid ? invitation : undefined
    }
  }
}

