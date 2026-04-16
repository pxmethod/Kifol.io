import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendInvitationEmail, sendTestEmail } from '@/lib/email/service';
import type { InvitationEmailData } from '@/lib/email/types';

interface InvitationEmailRequest {
  type: 'invitation';
  data: InvitationEmailData;
}

/**
 * Authenticated email send. Only `invitation` is supported — other transactional
 * flows use dedicated routes (e.g. forgot-password, signup verification).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<InvitationEmailRequest>;
    if (body.type !== 'invitation') {
      return NextResponse.json(
        { error: 'Only invitation emails are supported from this endpoint.' },
        { status: 403 }
      );
    }

    const data = body.data;
    if (!data?.to || !data.inviteUrl || !data.inviteeEmail) {
      return NextResponse.json({ error: 'Invalid invitation payload' }, { status: 400 });
    }

    const result = await sendInvitationEmail(data as InvitationEmailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
      });
    }

    return NextResponse.json({ error: result.error }, { status: 500 });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** Dev-only test send; requires a logged-in session. */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Test endpoint not available in production' }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
  }

  try {
    const result = await sendTestEmail(email);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}
