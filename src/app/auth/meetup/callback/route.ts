import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Meetup OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/whats-happening?error=meetup_auth_failed`);
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/whats-happening?error=no_code`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://secure.meetup.com/oauth2/access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_MEETUP_CLIENT_ID!,
        client_secret: process.env.MEETUP_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/meetup/callback`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Store the token in a secure way (you might want to store this in the user's session/database)
    // For now, we'll pass it as a query parameter (not ideal for production)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/whats-happening?meetup_token=${accessToken}`);

  } catch (error) {
    console.error('Meetup OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/whats-happening?error=meetup_auth_error`);
  }
}

