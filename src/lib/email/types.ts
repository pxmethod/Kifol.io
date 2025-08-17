import { EmailCategory } from './client';

// Base email data interface
export interface BaseEmailData {
  to: string | string[];
  subject: string;
  category?: EmailCategory;
  tags?: string[];
}

// Welcome email data
export interface WelcomeEmailData extends BaseEmailData {
  userName: string;
  loginUrl?: string;
}

// Password reset email data
export interface PasswordResetEmailData extends BaseEmailData {
  userName: string;
  resetUrl: string;
  resetToken: string;
  expiresAt: Date;
}

// Engagement email data
export interface EngagementEmailData extends BaseEmailData {
  userName: string;
  personalizedContent?: {
    portfolioCount?: number;
    lastActivity?: Date;
    suggestedActions?: string[];
  };
  ctaUrl?: string;
  ctaText?: string;
}

// Invoice confirmation email data  
export interface InvoiceEmailData extends BaseEmailData {
  userName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  downloadUrl: string;
  nextBillingDate: Date;
}

// Cancellation confirmation email data
export interface CancellationEmailData extends BaseEmailData {
  userName: string;
  cancellationDate: Date;
  finalBillingDate?: Date;
  dataRetentionDate?: Date;
  feedbackUrl?: string;
  reactivationUrl?: string;
}

// Invitation email data
export interface InvitationEmailData extends BaseEmailData {
  inviterName: string;
  inviteeEmail: string;
  inviteUrl: string;
  expiresAt: Date;
  personalMessage?: string;
}

// Email send result
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email preferences (for user settings)
export interface EmailPreferences {
  transactional: boolean; // Always true, cannot be disabled
  marketing: boolean;
  engagement: boolean;
  system: boolean;
}

// Email template props
export interface EmailTemplateProps {
  previewText?: string;
  logoUrl?: string;
  brandColor?: string;
  footerLinks?: {
    label: string;
    url: string;
  }[];
}
