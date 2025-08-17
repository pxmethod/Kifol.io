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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          updated_at?: string
        }
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
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          portfolio_id: string
          title: string
          description: string | null
          date_achieved: string
          media_urls: string[]
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          title: string
          description?: string | null
          date_achieved: string
          media_urls?: string[]
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          title?: string
          description?: string | null
          date_achieved?: string
          media_urls?: string[]
          category?: string | null
          updated_at?: string
        }
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

