import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { parseEmailVerificationToken } from '@/lib/auth/email-verification-token';

/**
 * Confirms a user's email in Supabase (sets email_confirmed_at).
 * Expects a signed token from the signup verification email (see /api/auth/signup).
 * Requires SUPABASE_SERVICE_ROLE_KEY and EMAIL_VERIFICATION_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const parsed = parseEmailVerificationToken(token);
    if (!parsed.ok) {
      if (parsed.reason === 'expired') {
        return NextResponse.json(
          { error: 'This verification link has expired. Please sign up again or contact support.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid verification link. Please use the link from your latest verification email.' },
        { status: 400 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: userData, error: getUserError } = await adminSupabase.auth.admin.getUserById(
      parsed.userId
    );

    if (getUserError || !userData?.user) {
      return NextResponse.json({ error: 'Invalid verification link.' }, { status: 400 });
    }

    const userEmail = userData.user.email?.trim().toLowerCase();
    if (!userEmail || userEmail !== parsed.email) {
      return NextResponse.json({ error: 'Invalid verification link.' }, { status: 400 });
    }

    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(parsed.userId, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.json({ error: 'Failed to confirm email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
