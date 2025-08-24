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

export async function POST(request: Request) {
  try {
    const { date, eventId } = await request.json();
    
    // If no date provided, use yesterday
    const targetDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`Testing event followups for date: ${targetDate}`);

    // Get reminders for the specified date
    const reminders = await eventReminderService.getRemindersForDateWithEmails(targetDate);
    
    // Filter by specific event if provided
    const filteredReminders = eventId 
      ? reminders.filter(r => r.event_id === eventId)
      : reminders;

    if (filteredReminders.length === 0) {
      return NextResponse.json({ 
        message: 'No reminders found', 
        date: targetDate,
        eventId: eventId || 'all',
        count: 0 
      });
    }

    console.log(`Found ${filteredReminders.length} reminders to test`);

    // Send test followup emails
    const emailPromises = filteredReminders.map(async (reminder: EventReminder) => {
      try {
        // Use the EmailTemplates system to load the template
        const html = await EmailTemplates.engagement({
          APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          ENGAGEMENT_TITLE: `[TEST] Event Followup: ${reminder.event_title}`,
          ENGAGEMENT_MESSAGE: `We hope you and your child enjoyed ${reminder.event_title} on ${new Date(reminder.event_date).toLocaleDateString()} at ${reminder.event_location}!`,
          TIPS_TITLE: 'Portfolio Building Tip',
          TIP_1: 'Take a few minutes to reflect on what your child accomplished during the event',
          TIP_2: 'Even small wins are worth celebrating and documenting',
          TIP_3: 'Add photos, descriptions, and achievements to build their portfolio',
          CTA_URL: `${process.env.NEXT_PUBLIC_APP_URL}/create`,
          CTA_TEXT: 'Add Achievements'
        });

        // For now, we'll use a simple approach since we don't have a direct sendEmail function
        console.log(`Test followup email content prepared for event: ${reminder.event_title} to ${reminder.user_email}`);
        console.log('Email HTML:', html);

        return { 
          success: true, 
          eventId: reminder.event_id, 
          email: reminder.user_email,
          eventTitle: reminder.event_title
        };
      } catch (error) {
        return { 
          success: false, 
          eventId: reminder.event_id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    const successfulEmails = results
      .filter(r => r.status === 'fulfilled' && r.value.success)
      .map(r => (r as PromiseFulfilledResult<{ success: boolean; eventId: string; email?: string; eventTitle?: string; error?: string }>).value);

    const failedEmails = results
      .filter(r => r.status === 'fulfilled' && !r.value.success)
      .map(r => (r as PromiseFulfilledResult<{ success: boolean; eventId: string; error?: string }>).value);

    return NextResponse.json({
      message: 'Test event followup emails processed',
      date: targetDate,
      eventId: eventId || 'all',
      total: filteredReminders.length,
      successful,
      failed,
      successfulEmails,
      failedEmails
    });

  } catch (error) {
    console.error('Failed to test event followups:', error);
    return NextResponse.json(
      { error: 'Failed to test event followups' },
      { status: 500 }
    );
  }
}
