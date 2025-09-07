import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmailVerification } from '@/lib/email/service'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Create user account with email confirmation enabled
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`,
        data: {
          name: name || email.split('@')[0]
        }
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Always send our custom verification email (regardless of confirmation status)
    if (data.user) {
      try {
        // Send our custom verification email directly
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?email=${encodeURIComponent(email)}&token=verify`
        
        console.log('Sending verification email to:', email)
        
        const emailResult = await sendEmailVerification({
          to: email,
          subject: 'Verify your email - Kifolio',
          userName: name || email.split('@')[0],
          verificationUrl: verificationUrl
        })

        if (!emailResult.success) {
          console.error('Failed to send verification email:', emailResult.error)
        } else {
          console.log('Verification email sent successfully to:', email)
        }
      } catch (emailError) {
        console.error('Failed to send custom verification email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
