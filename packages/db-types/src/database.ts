export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          city: string | null
          state: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          city?: string | null
          state?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          city?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          child_name: string
          portfolio_title: string
          photo_url: string | null
          template: string
          is_private: boolean
          password: string | null
          short_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          child_name: string
          portfolio_title: string
          photo_url?: string | null
          template: string
          is_private?: boolean
          password?: string | null
          short_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          child_name?: string
          portfolio_title?: string
          photo_url?: string | null
          template?: string
          is_private?: boolean
          password?: string | null
          short_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      highlights: {
        Row: {
          id: string
          portfolio_id: string
          title: string
          description: string | null
          date_achieved: string
          date_end: string | null
          ongoing: boolean
          custom_type_label: string | null
          media_urls: string[]
          /** Byte sizes parallel to media_urls; null for legacy rows */
          media_sizes: number[] | null
          /** Original display filenames parallel to media_urls; null for legacy rows */
          media_display_names: string[] | null
          category: string | null
          type:
            | 'achievement'
            | 'creative_work'
            | 'milestone'
            | 'activity'
            | 'volunteer_work'
            | 'reflection_note'
            | 'custom'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          title: string
          description?: string | null
          date_achieved: string
          date_end?: string | null
          ongoing?: boolean
          custom_type_label?: string | null
          media_urls?: string[]
          media_sizes?: number[] | null
          media_display_names?: string[] | null
          category?: string | null
          type:
            | 'achievement'
            | 'creative_work'
            | 'milestone'
            | 'activity'
            | 'volunteer_work'
            | 'reflection_note'
            | 'custom'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          title?: string
          description?: string | null
          date_achieved?: string
          date_end?: string | null
          ongoing?: boolean
          custom_type_label?: string | null
          media_urls?: string[]
          media_sizes?: number[] | null
          media_display_names?: string[] | null
          category?: string | null
          type?:
            | 'achievement'
            | 'creative_work'
            | 'milestone'
            | 'activity'
            | 'volunteer_work'
            | 'reflection_note'
            | 'custom'
          updated_at?: string
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          user_id: string
          kifolio_communications: boolean
          account_activity: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          kifolio_communications?: boolean
          account_activity?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          kifolio_communications?: boolean
          account_activity?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      endorsement_requests: {
        Row: {
          id: string
          achievement_id: string
          instructor_name: string
          instructor_email: string
          relationship: string
          token: string
          status: 'pending' | 'submitted' | 'expired'
          comment: string | null
          instructor_title: string | null
          organization: string | null
          created_at: string
          submitted_at: string | null
        }
        Insert: {
          id?: string
          achievement_id: string
          instructor_name: string
          instructor_email: string
          relationship: string
          token: string
          status?: 'pending' | 'submitted' | 'expired'
          comment?: string | null
          instructor_title?: string | null
          organization?: string | null
          created_at?: string
          submitted_at?: string | null
        }
        Update: {
          id?: string
          achievement_id?: string
          instructor_name?: string
          instructor_email?: string
          relationship?: string
          token?: string
          status?: 'pending' | 'submitted' | 'expired'
          comment?: string | null
          instructor_title?: string | null
          organization?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          id: string
          inviter_id: string
          invitee_email: string
          status: 'pending' | 'accepted' | 'expired'
          sent_at: string
          accepted_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          inviter_id: string
          invitee_email: string
          status?: 'pending' | 'accepted' | 'expired'
          sent_at?: string
          accepted_at?: string | null
          expires_at: string
        }
        Update: {
          id?: string
          inviter_id?: string
          invitee_email?: string
          status?: 'pending' | 'accepted' | 'expired'
          sent_at?: string
          accepted_at?: string | null
          expires_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          seal_template_id: string | null
          about: string | null
          location: string | null
          plan_tier: 'solo' | 'team'
          seat_limit: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          subscription_status:
            | 'incomplete'
            | 'trialing'
            | 'active'
            | 'past_due'
            | 'canceled'
            | 'unpaid'
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          seal_template_id?: string | null
          about?: string | null
          location?: string | null
          plan_tier?: 'solo' | 'team'
          seat_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          subscription_status?:
            | 'incomplete'
            | 'trialing'
            | 'active'
            | 'past_due'
            | 'canceled'
            | 'unpaid'
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          seal_template_id?: string | null
          about?: string | null
          location?: string | null
          plan_tier?: 'solo' | 'team'
          seat_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          subscription_status?:
            | 'incomplete'
            | 'trialing'
            | 'active'
            | 'past_due'
            | 'canceled'
            | 'unpaid'
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: 'admin' | 'instructor'
          status: 'active' | 'suspended' | 'removed'
          photo_url: string | null
          display_name: string | null
          job_title: string | null
          invited_at: string | null
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role: 'admin' | 'instructor'
          status?: 'active' | 'suspended' | 'removed'
          photo_url?: string | null
          display_name?: string | null
          job_title?: string | null
          invited_at?: string | null
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: 'admin' | 'instructor'
          status?: 'active' | 'suspended' | 'removed'
          photo_url?: string | null
          display_name?: string | null
          job_title?: string | null
          invited_at?: string | null
          joined_at?: string
        }
        Relationships: []
      }
      org_invites: {
        Row: {
          id: string
          org_id: string
          email: string
          role: 'instructor'
          token: string
          status: 'pending' | 'accepted' | 'expired' | 'revoked'
          expires_at: string
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          role?: 'instructor'
          token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          expires_at?: string
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          role?: 'instructor'
          token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          expires_at?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      org_parent_invites: {
        Row: {
          id: string
          org_id: string
          email: string
          token: string
          status: 'pending' | 'accepted' | 'expired' | 'revoked'
          org_name_snapshot: string | null
          org_logo_snapshot: string | null
          expires_at: string
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          email: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          org_name_snapshot?: string | null
          org_logo_snapshot?: string | null
          expires_at?: string
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          email?: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          org_name_snapshot?: string | null
          org_logo_snapshot?: string | null
          expires_at?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      portfolio_org_connections: {
        Row: {
          id: string
          portfolio_id: string
          org_id: string
          status: 'connected' | 'disconnected'
          connected_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          org_id: string
          status?: 'connected' | 'disconnected'
          connected_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          org_id?: string
          status?: 'connected' | 'disconnected'
          connected_at?: string
        }
        Relationships: []
      }
      org_achievement_requests: {
        Row: {
          id: string
          org_id: string
          portfolio_id: string
          created_by: string
          type: 'endorsement' | 'shoutout' | 'promotion'
          title: string
          body: string | null
          media_url: string | null
          status: 'pending' | 'approved' | 'declined' | 'expired'
          expires_at: string
          approved_at: string | null
          declined_at: string | null
          parent_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          portfolio_id: string
          created_by: string
          type: 'endorsement' | 'shoutout' | 'promotion'
          title: string
          body?: string | null
          media_url?: string | null
          status?: 'pending' | 'approved' | 'declined' | 'expired'
          expires_at?: string
          approved_at?: string | null
          declined_at?: string | null
          parent_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          portfolio_id?: string
          created_by?: string
          type?: 'endorsement' | 'shoutout' | 'promotion'
          title?: string
          body?: string | null
          media_url?: string | null
          status?: 'pending' | 'approved' | 'declined' | 'expired'
          expires_at?: string
          approved_at?: string | null
          declined_at?: string | null
          parent_note?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

