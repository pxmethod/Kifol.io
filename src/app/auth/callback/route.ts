import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  console.log('OAuth callback - code:', !!code, 'next:', next, 'origin:', origin)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
    }
    
    if (!error && data.user) {
      // Check if this is a new user (created within the last minute)
      const userCreated = new Date(data.user.created_at)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
      const isNewUser = userCreated > oneMinuteAgo

      // For existing users, verify they still exist in our database
      if (!isNewUser) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()

          // If user doesn't exist in our database (was deleted), clear session and redirect to signup
          if (profileError || !profile) {
            console.log('User not found in database - clearing session and redirecting to signup')
            await supabase.auth.signOut()
            return NextResponse.redirect(`${origin}/auth/signup?error=Account not found. Please sign up again.`)
          }
        } catch (dbError) {
          console.error('Database check error:', dbError)
          // If we can't check the database, assume user exists and proceed
        }
      }

      // Send welcome email for new users
      if (isNewUser && data.user.email) {
        try {
          await fetch(`${origin}/api/email/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'welcome',
              data: {
                to: data.user.email,
                userName: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'there',
                loginUrl: `${origin}/auth/login`
              }
            }),
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't block the auth flow if email fails
        }
      }

      // Redirect based on whether this is a new user or existing user
      if (isNewUser) {
        console.log('New user detected - redirecting to signup success, origin:', origin)
        return NextResponse.redirect(`${origin}/auth/signup?success=true&email=${encodeURIComponent(data.user.email || '')}`)
      } else {
        console.log('Existing user - redirecting to dashboard, origin:', origin)
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
}
