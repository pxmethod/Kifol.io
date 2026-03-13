import { NextResponse } from 'next/server';
import { EmailTemplates } from '@/lib/email/template-loader';

/**
 * Preview the endorsement-completed email template with sample data.
 * Visit GET /api/email/preview/endorsement-completed in your browser.
 */
export async function GET() {
  try {
    const html = await EmailTemplates.endorsementCompleted({
      PARENT_NAME: 'Sarah',
      CHILD_NAME: 'Emma',
      ACHIEVEMENT_TITLE: 'First piano recital',
      INSTRUCTOR_NAME: 'Coach Mike Reynolds',
      INSTRUCTOR_CREDENTIALS: ' (Head Instructor at Atlanta BJJ)',
      COMMENT: 'Emma has shown incredible dedication and growth over the past year. Her commitment to practice and her positive attitude make her a joy to teach. I\'m proud of this milestone!',
      PORTFOLIO_URL: 'https://kifol.io/portfolio/abc123',
    });

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json(
      { error: 'Failed to load template' },
      { status: 500 }
    );
  }
}
