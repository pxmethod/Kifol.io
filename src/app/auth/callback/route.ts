import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const next = searchParams.get('next') ?? '/'
  const fromSignup = state === 'signup'
  
  // Use the origin for OAuth processing (Supabase domain)
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://kifol.io' 
    : 'http://localhost:3000'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if this is a new user (created within the last minute)
      const userCreated = new Date(data.user.created_at)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
      const isNewUser = userCreated > oneMinuteAgo

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
                loginUrl: `${baseUrl}/auth/login`
              }
            }),
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't block the auth flow if email fails
        }
      }

      // If coming from signup page, redirect to signup success or onboarding
      if (fromSignup) {
        return NextResponse.redirect(`${baseUrl}/auth/signup?success=true&email=${encodeURIComponent(data.user.email || '')}`)
      }

      // Successful authentication, redirect to dashboard
      const redirectUrl = next === '/' ? '/dashboard' : next
      return NextResponse.redirect(`${baseUrl}${redirectUrl}`)
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(`${baseUrl}/auth/login?error=Authentication failed`)
}
