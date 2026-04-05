import { MailerSend, Sender, Recipient, EmailParams } from 'mailersend';

/** Personalization for MailerSend templates: { email, data: { var_name: value } } */
export type TemplatePersonalization = { email: string; data: Record<string, string> };

let mailerSendSingleton: MailerSend | null | undefined;

/**
 * Normalize MAILERSEND_API_KEY from env. MailerSend uses `Authorization: Bearer <token>`;
 * if the value includes a duplicate `Bearer ` prefix or wrapping quotes, the API returns 401 Unauthenticated.
 */
export function normalizeMailerSendApiKey(raw: string | undefined): string {
  if (raw == null) return '';
  let k = String(raw).trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }
  const bearerMatch = k.match(/^bearer\s+(.+)$/i);
  if (bearerMatch) {
    k = bearerMatch[1].trim();
  }
  return k;
}

/**
 * Lazy MailerSend client so the API key is read at send time (after env is loaded).
 */
export function getMailerSend(): MailerSend | null {
  if (mailerSendSingleton !== undefined) {
    return mailerSendSingleton;
  }
  const key = normalizeMailerSendApiKey(process.env.MAILERSEND_API_KEY);
  mailerSendSingleton = key ? new MailerSend({ apiKey: key }) : null;
  return mailerSendSingleton;
}

// Email configuration
const fromRaw = process.env.EMAIL_FROM || 'Kifolio <noreply@kifol.io>';

/** Strip HTML to a short plain-text body (MailerSend / inbox clients often expect a text part). */
export function htmlToPlainText(html: string): string {
  const stripped = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
  const out = stripped.slice(0, 15000);
  return out.length > 0 ? out : ' ';
}

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
    .setText(htmlToPlainText(html))
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
  personalization: TemplatePersonalization[],
  subject: string
): EmailParams {
  const sender = new Sender(emailConfig.fromEmail, emailConfig.fromName);
  const recipients = (Array.isArray(to) ? to : [to]).map(
    (email) => new Recipient(email, email.split('@')[0])
  );
  return new EmailParams()
    .setFrom(sender)
    .setTo(recipients)
    .setSubject(subject)
    .setTemplateId(templateId)
    .setPersonalization(personalization);
}
