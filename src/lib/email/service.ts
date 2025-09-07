import { resend, emailConfig, EMAIL_CATEGORIES } from './client';
import { 
  EmailResult, 
  PasswordResetEmailData,
  EngagementEmailData,
  InvitationEmailData,
  InvoiceEmailData,
  CancellationEmailData,
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
  tags?: string[]
): Promise<EmailResult> {
  try {
    // Convert string tags to Resend Tag format
    const resendTags = tags?.map(tag => ({ name: tag, value: 'true' })) || [];
    if (category) {
      resendTags.push({ name: 'category', value: category });
    }

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      tags: resendTags,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}


/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult> {
  try {
    // Ensure expiresAt is a Date object
    const expiresAt = data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt);
    
    // Load and process the password reset email template
    const html = await EmailTemplates.passwordReset({
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
      error: error instanceof Error ? error.message : 'Failed to send password reset email' 
    };
  }
}

/**
 * Send engagement email
 */
export async function sendEngagementEmail(data: EngagementEmailData): Promise<EmailResult> {
  try {
    const portfolioCount = data.personalizedContent?.portfolioCount || 0;
    const hasPortfolios = portfolioCount > 0;

    // Load and process the engagement email template
    const html = await EmailTemplates.engagement({
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
      CTA_URL: data.ctaUrl || `${process.env.NEXT_PUBLIC_APP_URL}/`,
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
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
 * Send invoice confirmation email
 */
export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<EmailResult> {
  try {
    // Basic HTML template (we'll enhance this later)
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Kifolio Invoice</h2>
        <p>Hi ${data.userName},</p>
        <p>Thank you for your payment! Here are your invoice details:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Invoice #:</strong> ${data.invoiceNumber}</p>
          <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
          <p><strong>Billing Period:</strong> ${data.billingPeriod.start.toLocaleDateString()} - ${data.billingPeriod.end.toLocaleDateString()}</p>
          <p><strong>Next Billing Date:</strong> ${data.nextBillingDate.toLocaleDateString()}</p>
        </div>
        <p>
          <a href="${data.downloadUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Download Invoice
          </a>
        </p>
      </div>
    `;

    return await sendEmail(
      data.to,
      data.subject || `Invoice ${data.invoiceNumber} - Kifolio`,
      html,
      EMAIL_CATEGORIES.TRANSACTIONAL,
      ['invoice', 'billing']
    );
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send invoice email' 
    };
  }
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationEmail(data: CancellationEmailData): Promise<EmailResult> {
  try {
    // Basic HTML template (we'll enhance this later)
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Cancellation Confirmed</h2>
        <p>Hi ${data.userName},</p>
        <p>We're sorry to see you go. Your Kifolio account cancellation has been confirmed.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Cancellation Date:</strong> ${data.cancellationDate.toLocaleDateString()}</p>
          ${data.finalBillingDate ? `<p><strong>Final Billing Date:</strong> ${data.finalBillingDate.toLocaleDateString()}</p>` : ''}
          ${data.dataRetentionDate ? `<p><strong>Data Deletion Date:</strong> ${data.dataRetentionDate.toLocaleDateString()}</p>` : ''}
        </div>
        <p>Your account will remain active until your final billing date.</p>
        ${data.feedbackUrl ? `<p><a href="${data.feedbackUrl}">Share feedback about your experience</a></p>` : ''}
        ${data.reactivationUrl ? `<p><a href="${data.reactivationUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reactivate Account</a></p>` : ''}
      </div>
    `;

    return await sendEmail(
      data.to,
      data.subject || 'Your Kifolio account has been cancelled',
      html,
      EMAIL_CATEGORIES.TRANSACTIONAL,
      ['cancellation', 'account']
    );
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send cancellation email' 
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
 * Send email verification email
 */
export async function sendEmailVerification(data: EmailVerificationData): Promise<EmailResult> {
  try {
    // Load and process the email verification template
    const html = await EmailTemplates.emailVerification({
      APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
      error: error instanceof Error ? error.message : 'Failed to send email verification' 
    };
  }
}
