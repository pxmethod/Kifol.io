import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmailVerification } from '@/lib/email/service'
import { getAppUrl } from '@/config/domains'
import {
  createEmailVerificationToken,
  emailVerificationSecretDiagnostics,
  isEmailVerificationConfigured,
} from '@/lib/auth/email-verification-token'

/**
 * Signup API - uses MailerSend templates for verification emails (brand consistency).
 * Verification link: `/auth/verify?token=<signed>` (see EMAIL_VERIFICATION_SECRET in env docs).
 * Supabase's built-in confirmation email should be disabled in project settings so users only receive
 * our branded MailerSend template. (Supabase Dashboard → Authentication → Email Templates)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!isEmailVerificationConfigured()) {
      if (process.env.NODE_ENV === 'development') {
        const d = emailVerificationSecretDiagnostics();
        console.warn('[signup] EMAIL_VERIFICATION_SECRET:', {
          ...d,
          meetsMin32: d.normalizedLength >= 32,
        });
      }
      const payload: {
        error: string;
        hint?: string;
      } = {
        error:
          'Email verification is not configured. Set EMAIL_VERIFICATION_SECRET (min 32 characters) on the server.',
      };
      if (process.env.NODE_ENV === 'development') {
        payload.hint =
          'Use the exact dev URL from your terminal (including port, e.g. http://localhost:3001). Restart `npm run dev` after editing .env.local. For production, set the same variable in your host (e.g. Vercel).';
      }
      return NextResponse.json(payload, { status: 503 });
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
      // Supabase rate limit: "email rate limit exceeded" — configure at Auth → Rate Limits
      const message =
        error.message?.toLowerCase().includes('rate limit')
          ? 'Too many signup attempts. Please wait 1–2 minutes and try again.'
          : error.message
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Send our branded MailerSend verification email (sole verification source)
    if (data.user) {
      const signed = createEmailVerificationToken(email, data.user.id)
      const verificationUrl = `${getAppUrl()}/auth/verify?token=${encodeURIComponent(signed)}`

      // Diagnostic: log config status (no secrets, no PII)
      const hasMailerSendKey = !!process.env.MAILERSEND_API_KEY
      const hasWelcomeTemplate = !!process.env.MAILERSEND_TEMPLATE_WELCOME
      console.log('[signup] Email config:', {
        hasMailerSendKey,
        hasWelcomeTemplate,
        appUrl: getAppUrl(),
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
          console.log('[signup] Verification email sent successfully, messageId:', emailResult.messageId)
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
