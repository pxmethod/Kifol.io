'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { portfolioAccessService } from '@/lib/services/portfolio-access';

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      // If user was created but needs email confirmation, send custom verification email
      if (data.user && !data.user.email_confirmed_at) {
        try {
          // Get the email confirmation token from Supabase
          const { data: confirmationData, error: confirmationError } = await supabase.auth.resend({
            type: 'signup',
            email: email
          })

          if (confirmationError) {
            console.error('Error getting confirmation token:', confirmationError)
            // Don't fail the signup if email sending fails
          } else {
            // Send our custom verification email
            const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${confirmationData?.token || 'fallback'}&email=${encodeURIComponent(email)}`
            
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'email-verification',
                data: {
                  to: email,
                  userName: name || email.split('@')[0],
                  verificationUrl: verificationUrl
                }
              }),
            })
          }
        } catch (emailError) {
          console.error('Failed to send custom verification email:', emailError)
          // Don't fail the signup if email sending fails
        }
      }

      // Note: User profile and email preferences will be automatically created
      // by the database trigger when the user confirms their email
      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }


  const signOut = async () => {
    try {
      // Clear password access before signing out
      portfolioAccessService.clearAllPasswordAccess();
      
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}