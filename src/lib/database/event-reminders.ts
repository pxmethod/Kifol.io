import { createClient } from '@/lib/supabase/client';

export interface EventReminder {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  created_at: string;
  updated_at: string;
}

export interface EventReminderWithUser extends EventReminder {
  user_email: string;
}

interface DatabaseReminderResponse {
  id: string;
  user_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  created_at: string;
  updated_at: string;
  users: {
    email: string;
  };
}

export interface CreateEventReminder {
  user_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
}

export class EventReminderService {
  private supabase = createClient();

  async createReminder(reminderData: CreateEventReminder): Promise<EventReminder> {
    const { data, error } = await this.supabase
      .from('event_reminders')
      .insert([reminderData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reminder: ${error.message}`);
    }

    return data;
  }

  async deleteReminder(userId: string, eventId: string): Promise<void> {
    const { error } = await this.supabase
      .from('event_reminders')
      .delete()
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (error) {
      throw new Error(`Failed to delete reminder: ${error.message}`);
    }
  }

  async getUserReminders(userId: string): Promise<EventReminder[]> {
    const { data, error } = await this.supabase
      .from('event_reminders')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user reminders: ${error.message}`);
    }

    return data || [];
  }

  async isUserRemindedForEvent(userId: string, eventId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('event_reminders')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check reminder status: ${error.message}`);
    }

    return !!data;
  }

  // Get all reminders for events that happened on a specific date with user emails
  async getRemindersForDateWithEmails(date: string): Promise<EventReminderWithUser[]> {
    const { data, error } = await this.supabase
      .from('event_reminders')
      .select(`
        *,
        users!inner(email)
      `)
      .eq('event_date', date);

    if (error) {
      throw new Error(`Failed to get reminders for date: ${error.message}`);
    }

    // Transform the data to flatten the user email
    return (data || []).map((reminder: DatabaseReminderResponse) => ({
      ...reminder,
      user_email: reminder.users.email
    }));
  }
}

export const eventReminderService = new EventReminderService();
