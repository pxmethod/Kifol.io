import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type UpdateUser = Database['public']['Tables']['users']['Update']
type EmailPreferences = Database['public']['Tables']['email_preferences']['Row']
type UpdateEmailPreferences = Database['public']['Tables']['email_preferences']['Update']

export class UserService {
  private supabase = createClient()

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) {
      return null
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      throw new Error('Failed to fetch user profile')
    }

    return data
  }

  /**
   * Update user profile
   */
  async updateUser(updates: UpdateUser): Promise<User> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', authUser.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  }

  /**
   * Create user profile
   */
  async createUser(profileData: Partial<User>): Promise<User> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('users')
      .insert([{
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || null,
        city: profileData.city || null,
        state: profileData.state || null
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return data
  }

  /**
   * Get user email preferences
   */
  async getEmailPreferences(): Promise<EmailPreferences | null> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) {
      return null
    }

    const { data, error } = await this.supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Create default preferences if they don't exist
        return await this.createDefaultEmailPreferences()
      }
      console.error('Error fetching email preferences:', error)
      throw new Error('Failed to fetch email preferences')
    }

    return data
  }

  /**
   * Update email preferences
   */
  async updateEmailPreferences(preferences: UpdateEmailPreferences): Promise<EmailPreferences> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('email_preferences')
      .update(preferences)
      .eq('user_id', authUser.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating email preferences:', error)
      throw new Error('Failed to update email preferences')
    }

    return data
  }

  /**
   * Create default email preferences
   */
  private async createDefaultEmailPreferences(): Promise<EmailPreferences> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('email_preferences')
      .insert([{
        user_id: authUser.id,
        kifolio_communications: true,
        account_activity: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating email preferences:', error)
      throw new Error('Failed to create email preferences')
    }

    return data
  }

  /**
   * Delete user account and all associated data
   */
  async deleteAccount(): Promise<void> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    
    if (!authUser) {
      throw new Error('User not authenticated')
    }

    // Note: Due to CASCADE DELETE constraints, deleting the user from auth.users will also delete:
    // - All data from public.users (via CASCADE)
    // - All portfolios (via CASCADE)
    // - All highlights (via portfolio deletion CASCADE)
    // - Email preferences (via CASCADE)
    // - Invitations sent by the user (via CASCADE)
    // - Event reminders (via CASCADE)

    // Call the API route to delete the user using Admin API
    const response = await fetch('/api/user/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete account')
    }

    // Don't call signOut here as it will invalidate the session
    // The user will be automatically signed out when the account is deleted
    // and the AuthContext will handle the session change
  }

  /**
   * Check if user exists (for invitation validation)
   */
  async userExists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user exists:', error)
      return false
    }

    return !!data
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        }
      }
    })

    if (error) {
      console.error('Error signing up:', error)
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Sign in user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Error signing in:', error)
      throw new Error(error.message)
    }

    return data
  }

  /**
   * Sign out user
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
      throw new Error('Failed to sign out')
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })

    if (error) {
      console.error('Error resetting password:', error)
      throw new Error(error.message)
    }
  }
}

