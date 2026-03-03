import { MailerSend, Sender, Recipient, EmailParams } from 'mailersend';

/** Personalization for MailerSend templates: { email, data: { var_name: value } } */
export type TemplatePersonalization = { email: string; data: Record<string, string> };

/** MailerSend client; null if MAILERSEND_API_KEY is not set (app can still start, email sends will fail with a clear error). */
export const mailerSend: MailerSend | null = process.env.MAILERSEND_API_KEY
  ? new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY })
  : null;

// Email configuration
const fromRaw = process.env.EMAIL_FROM || 'Kifolio <noreply@kifol.io>';

/** Parse "Name <email>" into { email, name } for MailerSend Sender. */
function parseFrom(raw: string): { email: string; name: string } {
  const match = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: raw.trim(), name: 'Kifolio' };
}

const parsedFrom = parseFrom(fromRaw);

export const emailConfig = {
  from: fromRaw,
  fromEmail: parsedFrom.email,
  fromName: parsedFrom.name,
  supportEmail: process.env.SUPPORT_EMAIL || 'support@kifol.io',
  domain: process.env.EMAIL_DOMAIN || 'kifol.io',
} as const;

export const EMAIL_CATEGORIES = {
  TRANSACTIONAL: 'transactional',
  MARKETING: 'marketing',
  ENGAGEMENT: 'engagement',
  SYSTEM: 'system',
} as const;

export type EmailCategory = (typeof EMAIL_CATEGORIES)[keyof typeof EMAIL_CATEGORIES];

/** Create MailerSend Sender and Recipient objects for sending. */
export function createEmailParams(
  to: string | string[],
  subject: string,
  html: string,
  options?: { replyTo?: string }
): EmailParams {
  const sender = new Sender(emailConfig.fromEmail, emailConfig.fromName);
  const recipients = (Array.isArray(to) ? to : [to]).map(
    (email) => new Recipient(email, email.split('@')[0])
  );
  const params = new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(html);
  if (options?.replyTo) {
    params.setReplyTo(new Recipient(options.replyTo, options.replyTo.split('@')[0]));
  }
  return params;
}

/** Create EmailParams for sending via MailerSend template (template_id + personalization). */
export function createTemplateEmailParams(
  to: string | string[],
  templateId: string,
  personalization: TemplatePersonalization[]
): EmailParams {
  const sender = new Sender(emailConfig.fromEmail, emailConfig.fromName);
  const recipients = (Array.isArray(to) ? to : [to]).map(
    (email) => new Recipient(email, email.split('@')[0])
  );
  return new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setTemplateId(templateId)
    .setPersonalization(personalization);
}
