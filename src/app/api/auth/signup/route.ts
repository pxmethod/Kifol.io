import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmailVerification } from '@/lib/email/service'
import { getAppUrl } from '@/config/domains'

/**
 * Signup API - uses MailerSend templates for verification emails (brand consistency).
 * Verification flow: We send a custom MailerSend email with link to /auth/verify?email=...&token=verify.
 * Supabase's built-in confirmation email should be disabled in project settings so users only receive
 * our branded MailerSend template. (Supabase Dashboard → Authentication → Email Templates)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Create user account with email confirmation enabled (user cannot login until verified)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAppUrl()}/auth/verify`,
        data: {
          name: name || email.split('@')[0]
        }
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Send our branded MailerSend verification email (sole verification source)
    if (data.user) {
      const verificationUrl = `${getAppUrl()}/auth/verify?email=${encodeURIComponent(email)}&token=verify`

      // Diagnostic: log config status (no secrets)
      const hasMailerSendKey = !!process.env.MAILERSEND_API_KEY
      const hasWelcomeTemplate = !!process.env.MAILERSEND_TEMPLATE_WELCOME
      console.log('[signup] Email config:', {
        hasMailerSendKey,
        hasWelcomeTemplate,
        appUrl: getAppUrl(),
        to: email,
      })

      if (!hasMailerSendKey) {
        console.error('[signup] MAILERSEND_API_KEY is not set. Verification email will not be sent. Add it to Vercel env vars.')
      }

      try {
        const emailResult = await sendEmailVerification({
          to: email,
          subject: 'Verify your email - Kifolio',
          userName: name || email.split('@')[0],
          verificationUrl: verificationUrl
        })

        if (!emailResult.success) {
          console.error('[signup] Failed to send verification email:', emailResult.error)
        } else {
          console.log('[signup] Verification email sent successfully to:', email, 'messageId:', emailResult.messageId)
        }
      } catch (emailError) {
        console.error('[signup] Exception sending verification email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
