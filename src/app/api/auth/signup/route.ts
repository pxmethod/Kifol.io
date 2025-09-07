import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Create user account - this will trigger Supabase's default email if confirmation is enabled
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
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Always send our custom verification email (in addition to Supabase's default)
    if (data.user) {
      try {
        // Send our custom verification email
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?email=${encodeURIComponent(email)}&token=verify`
        
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
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

        if (!emailResponse.ok) {
          console.error('Failed to send verification email')
          // Don't fail the signup if email sending fails
        }
      } catch (emailError) {
        console.error('Failed to send custom verification email:', emailError)
        // Don't fail the signup if email sending fails
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
