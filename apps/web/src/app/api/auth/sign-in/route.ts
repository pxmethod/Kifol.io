import { createClient } from '@kifolio/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Password sign-in on the server so the browser never calls Supabase Auth directly.
 * Avoids client-side "Failed to fetch" issues some environments hit with @supabase/ssr PKCE + fetch.
 * Sets session cookies via the same cookie adapter as the rest of the app.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
