import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@kifolio/db-types'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured, some features may not work')
    // Return a more complete mock client for development
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signInWithOAuth: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } }),
        resetPasswordForEmail: () => Promise.resolve({ error: null })
      }
    } as any
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

