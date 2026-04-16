import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmailVerification } from '@/lib/email/service'
import { getAppUrl } from '@/config/domains'
import {
  createEmailVerificationToken,
  EMAIL_VERIFICATION_SECRET_MIN_LENGTH,
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
      const d = emailVerificationSecretDiagnostics();
      console.error('[signup] EMAIL_VERIFICATION_SECRET not usable (no secret value logged):', d);

      const diagnosticCode: 'MISSING' | 'TOO_SHORT' = !d.envVarPresent
        ? 'MISSING'
        : 'TOO_SHORT';

      const payload: {
        error: string;
        hint: string;
        diagnosticCode: 'MISSING' | 'TOO_SHORT';
        normalizedLength?: number;
      } = {
        error: `Email verification is not configured. Set EMAIL_VERIFICATION_SECRET on the server (at least ${EMAIL_VERIFICATION_SECRET_MIN_LENGTH} characters after trimming; 32+ recommended).`,
        diagnosticCode,
        hint:
          'Vercel: Project → Settings → Environment Variables → exact name EMAIL_VERIFICATION_SECRET → enable for the environment you deploy to (Production and/or Preview) → Save → redeploy. Paste the raw secret only (no Bearer prefix). If the value was copied from a file, remove accidental line breaks.',
      };
      if (process.env.NODE_ENV === 'development') {
        payload.normalizedLength = d.normalizedLength;
        payload.hint +=
          ' Local: use the URL from the terminal (correct port), restart `npm run dev` after changing .env.local.';
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
