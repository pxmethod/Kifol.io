import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'Kifolio <noreply@kifol.io>',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@kifol.io',
  domain: process.env.EMAIL_DOMAIN || 'kifol.io',
} as const;

// Email categories for tracking and preferences
export const EMAIL_CATEGORIES = {
  TRANSACTIONAL: 'transactional',
  MARKETING: 'marketing', 
  ENGAGEMENT: 'engagement',
  SYSTEM: 'system'
} as const;

export type EmailCategory = typeof EMAIL_CATEGORIES[keyof typeof EMAIL_CATEGORIES];
