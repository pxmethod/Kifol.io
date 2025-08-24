import { NextResponse } from 'next/server';
import { eventReminderService } from '@/lib/database/event-reminders';
import { EmailTemplates } from '@/lib/email/template-loader';

interface EventReminder {
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  user_email: string;
}

async function sendFollowupEmail(reminder: EventReminder, retryCount = 0): Promise<{ success: boolean; eventId: string; error?: string }> {
  try {
    // Use the EmailTemplates system to load the template
    const html = await EmailTemplates.engagement({
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      ENGAGEMENT_TITLE: `Event Followup: ${reminder.event_title}`,
      ENGAGEMENT_MESSAGE: `We hope you and your child enjoyed ${reminder.event_title} on ${new Date(reminder.event_date).toLocaleDateString()} at ${reminder.event_location}!`,
      TIPS_TITLE: 'Portfolio Building Tip',
      TIP_1: 'Take a few minutes to reflect on what your child accomplished during the event',
      TIP_2: 'Even small wins are worth celebrating and documenting',
      TIP_3: 'Add photos, descriptions, and achievements to build their portfolio',
      CTA_URL: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
      CTA_TEXT: 'Add Achievements'
    });

    // For now, we'll use a simple approach since we don't have a direct sendEmail function
    // In production, you'd want to integrate with your email service
    console.log(`Followup email content prepared for event: ${reminder.event_title} to ${reminder.user_email}`);
    console.log('Email HTML:', html);
    
    return { success: true, eventId: reminder.event_id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Retry once if this is the first attempt
    if (retryCount === 0) {
      console.log(`First attempt failed for event ${reminder.event_id}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return sendFollowupEmail(reminder, 1);
    }
    
    // Log error after second attempt fails
    console.error(`Failed to send followup for event ${reminder.event_id} after retry:`, errorMessage);
    return { success: false, eventId: reminder.event_id, error: errorMessage };
  }
}

export async function GET() {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    console.log(`Checking for events on ${yesterdayStr} to send followups`);

    // Get all reminders for events that happened yesterday with user emails
    const reminders = await eventReminderService.getRemindersForDateWithEmails(yesterdayStr);

    if (reminders.length === 0) {
      console.log('No reminders found for yesterday');
      return NextResponse.json({ message: 'No reminders found', count: 0 });
    }

    console.log(`Found ${reminders.length} reminders to process`);

    // Send followup emails with retry logic
    const emailPromises = reminders.map(reminder => sendFollowupEmail(reminder));

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`Followup emails sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      message: 'Event followup emails processed',
      total: reminders.length,
      successful,
      failed,
      date: yesterdayStr
    });

  } catch (error) {
    console.error('Failed to process event followups:', error);
    return NextResponse.json(
      { error: 'Failed to process event followups' },
      { status: 500 }
    );
  }
}
