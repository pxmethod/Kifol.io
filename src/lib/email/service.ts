import { resend, emailConfig, EMAIL_CATEGORIES } from './client';
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



