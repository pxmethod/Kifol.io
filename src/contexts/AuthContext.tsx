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
      // Same-origin API (works on localhost, 127.0.0.1, preview hosts, production).
      // Avoid hostname === 'localhost' only — that sent dev traffic to getAppUrl() and the wrong env.
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: typeof name === 'string' ? name.trim() : '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const base = data.error || 'Signup failed';
        const hint = typeof data.hint === 'string' ? data.hint : '';
        const code =
          typeof data.diagnosticCode === 'string' ? ` (${String(data.diagnosticCode)})` : '';
        const devLen =
          typeof data.normalizedLength === 'number' ? ` [length: ${data.normalizedLength}]` : '';
        return { error: `${base}${code}${devLen}${hint ? ` ${hint}` : ''}`.trim() };
      }

      return {}
    } catch {
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
    } catch {
      return { error: 'An unexpected error occurred' }
    }
  }


  const signOut = async () => {
    try {
      // Clear password access before signing out
      portfolioAccessService.clearAllPasswordAccess();
      
      await supabase.auth.signOut();
    } catch {
      console.error('Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Failed to send reset email' }
      }

      return {}
    } catch {
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