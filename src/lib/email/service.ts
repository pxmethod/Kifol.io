import { mailerSend, emailConfig, EMAIL_CATEGORIES, createEmailParams, createTemplateEmailParams } from './client';
import { getAppUrl } from '@/config/domains';
import { 
  EmailResult, 
  PasswordResetEmailData,
  EngagementEmailData,
  InvitationEmailData,
  EmailVerificationData
} from './types';

// Import email template loader
import { EmailTemplates } from './template-loader';

/**
 * Base email sending function
 */
async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  category?: string,
  tags?: string[],
  options?: { replyTo?: string }
): Promise<EmailResult> {
  if (!mailerSend) {
    return {
      success: false,
      error: 'Email service not configured (MAILERSEND_API_KEY missing)',
    };
  }
  try {
    const emailParams = createEmailParams(to, subject, html, options);
    const response = await mailerSend.email.send(emailParams) as {
      headers?: Record<string, string | string[] | undefined>;
      body?: { message_id?: string };
    };
    const messageId =
      (typeof response?.headers?.['x-message-id'] === 'string'
        ? response.headers['x-message-id']
        : Array.isArray(response?.headers?.['x-message-id'])
          ? response.headers['x-message-id'][0]
          : undefined) ??
      response?.body?.message_id;

    if (messageId) {
      console.log('Email sent successfully:', messageId);
    }
    return { success: true, messageId: messageId?.toString() };
  } catch (error: unknown) {
    console.error('Email service error:', error);
    const err = error as { body?: { message?: string; errors?: Record<string, string[]> }; message?: string };
    const message =
      err?.body?.message ||
      (err?.body?.errors && typeof err.body.errors === 'object'
        ? Object.values(err.body.errors).flat().join('; ')
        : undefined) ||
      (err instanceof Error ? err.message : undefined) ||
      'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Send email using a MailerSend template (template_id + personalization variables).
 */
async function sendEmailWithTemplate(
  to: string | string[],
  templateId: string,
  personalization: { email: string; data: Record<string, string> }[]
): Promise<EmailResult> {
  if (!mailerSend) {
    return {
      success: false,
      error: 'Email service not configured (MAILERSEND_API_KEY missing)',
    };
  }
  try {
    const emailParams = createTemplateEmailParams(to, templateId, personalization);
    const response = await mailerSend.email.send(emailParams) as {
      headers?: Record<string, string | string[] | undefined>;
      body?: { message_id?: string };
    };
    const messageId =
      (typeof response?.headers?.['x-message-id'] === 'string'
        ? response.headers['x-message-id']
        : Array.isArray(response?.headers?.['x-message-id'])
          ? response.headers['x-message-id'][0]
          : undefined) ??
      response?.body?.message_id;

    if (messageId) {
      console.log('Email sent successfully:', messageId);
    }
    return { success: true, messageId: messageId?.toString() };
  } catch (error: unknown) {
    console.error('Email service error:', error);
    const err = error as { body?: { message?: string; errors?: Record<string, string[]> }; message?: string };
    const message =
      err?.body?.message ||
      (err?.body?.errors && typeof err.body.errors === 'object'
        ? Object.values(err.body.errors).flat().join('; ')
        : undefined) ||
      (err instanceof Error ? err.message : undefined) ||
      'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Send password reset email.
 * Uses MailerSend template when MAILERSEND_TEMPLATE_PASSWORD_RESET is set, otherwise falls back to HTML template.
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult> {
  const templateId = process.env.MAILERSEND_TEMPLATE_PASSWORD_RESET;
  const toEmail = Array.isArray(data.to) ? data.to[0] : data.to;
  const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt);

  if (templateId) {
    return sendEmailWithTemplate(
      data.to,
      templateId,
      [
        {
          email: toEmail,
          data: {
            user_name: data.userName,
            reset_url: data.resetUrl,
            expires_at: expiresAt.toLocaleString(),
            app_url: getAppUrl(),
          },
        },
      ]
    );
  }

  try {
    const html = await EmailTemplates.passwordReset({
      APP_URL: getAppUrl(),
      USER_NAME: data.userName,
      RESET_URL: data.resetUrl,
      EXPIRES_AT: expiresAt.toLocaleString(),
    });

    return await sendEmail(
      data.to,
      data.subject || 'Reset your Kifolio password',
      html,
      EMAIL_CATEGORIES.TRANSACTIONAL,
      ['password-reset', 'security']
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send password reset email',
    };
  }
}

/**
 * Send engagement email (e.g. "continue building" tips).
 * Not used by the app: no cron or in-app trigger calls this. Kept for future use (e.g. scheduled emails).
 */
export async function sendEngagementEmail(data: EngagementEmailData): Promise<EmailResult> {
  try {
    const portfolioCount = data.personalizedContent?.portfolioCount || 0;
    const hasPortfolios = portfolioCount > 0;

    // Load and process the engagement email template
    const html = await EmailTemplates.engagement({
      APP_URL: getAppUrl(),
      ENGAGEMENT_TITLE: hasPortfolios 
        ? `Keep building, ${data.userName}! 🚀` 
        : `Ready to start your portfolio, ${data.userName}? ✨`,
      ENGAGEMENT_MESSAGE: hasPortfolios 
        ? `We noticed you have ${portfolioCount} portfolio${portfolioCount > 1 ? 's' : ''} on Kifolio. That's awesome! Here are some ways to make your portfolio even better:`
        : "We're excited to help you create your first portfolio! Here's how to get started:",
      TIPS_TITLE: hasPortfolios ? "Ideas to enhance your portfolio:" : "Getting started is easy:",
      TIP_1: hasPortfolios ? "Add new achievements" : "Document your first achievement",
      TIP_2: hasPortfolios ? "Try a new template" : "Customize your design", 
      TIP_3: hasPortfolios ? "Share your portfolio" : "Invite family and friends",
      CTA_URL: data.ctaUrl || `${getAppUrl()}/`,
      CTA_TEXT: data.ctaText || (hasPortfolios ? "Continue Building" : "Create Your Portfolio"),
    });

    return await sendEmail(
      data.to,
      data.subject || `${data.userName}, let's continue building your portfolio`,
      html,
      EMAIL_CATEGORIES.ENGAGEMENT,
      ['engagement', 'retention']
    );
  } catch (error) {
    console.error('Error sending engagement email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send engagement email' 
    };
  }
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(data: InvitationEmailData): Promise<EmailResult> {
  try {
    // Ensure expiresAt is a Date object
    const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt);
    
    // Load and process the invitation email template
    const html = await EmailTemplates.invitation({
      APP_URL: getAppUrl(),
      INVITER_NAME: data.inviterName,
      PERSONAL_MESSAGE: data.personalMessage || '',
      INVITE_URL: data.inviteUrl,
      EXPIRES_AT: expiresAt.toLocaleDateString(),
    });

    return await sendEmail(
      data.to,
      data.subject || `${data.inviterName} invited you to join Kifolio`,
      html,
      EMAIL_CATEGORIES.TRANSACTIONAL,
      ['invitation', 'onboarding']
    );
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send invitation email' 
    };
  }
}



/**
 * Test email service (development only)
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Test emails not allowed in production' };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Kifolio Email Service Test</h2>
      <p>This is a test email from your Kifolio application.</p>
      <p>If you received this, your email service is working correctly!</p>
      <p><small>Sent at: ${new Date().toISOString()}</small></p>
    </div>
  `;

  return await sendEmail(
    to,
    'Kifolio Email Service Test',
    html,
    EMAIL_CATEGORIES.SYSTEM,
    ['test']
  );
}

/**
 * Send email verification (welcome) email.
 * Uses MailerSend template when MAILERSEND_TEMPLATE_WELCOME is set, otherwise falls back to HTML template.
 */
export async function sendEmailVerification(data: EmailVerificationData): Promise<EmailResult> {
  const templateId = process.env.MAILERSEND_TEMPLATE_WELCOME;
  const toEmail = Array.isArray(data.to) ? data.to[0] : data.to;

  if (templateId) {
    // Use MailerSend dashboard template; variables must match your template (e.g. {{user_name}}, {{verification_url}})
    return sendEmailWithTemplate(
      data.to,
      templateId,
      [
        {
          email: toEmail,
          data: {
            user_name: data.userName,
            verification_url: data.verificationUrl,
            support_email: process.env.SUPPORT_EMAIL || 'support@kifol.io',
            app_url: getAppUrl(),
          },
        },
      ]
    );
  }

  try {
    const html = await EmailTemplates.emailVerification({
      APP_URL: getAppUrl(),
      USER_NAME: data.userName,
      VERIFICATION_URL: data.verificationUrl,
      SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@kifol.io',
    });

    return await sendEmail(
      data.to,
      data.subject || `Verify your email - Kifolio`,
      html,
      EMAIL_CATEGORIES.TRANSACTIONAL,
      ['verification', 'onboarding']
    );
  } catch (error) {
    console.error('Error sending email verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email verification',
    };
  }
}



