import { promises as fs } from 'fs';
import path from 'path';

/**
 * Template variable replacer
 * Replaces {{VARIABLE}} placeholders with actual values
 */
function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  
  // Replace simple variables {{VARIABLE}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  // Handle conditional blocks {{#VARIABLE}}...{{/VARIABLE}}
  // If variable exists and has content, show the block, otherwise remove it
  Object.entries(variables).forEach(([key, value]) => {
    const blockRegex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
    if (value && value.trim()) {
      // Keep the content, remove the conditional tags
      result = result.replace(blockRegex, '$1');
    } else {
      // Remove the entire block
      result = result.replace(blockRegex, '');
    }
  });
  
  return result;
}

/**
 * Load and process email template
 */
export async function loadEmailTemplate(
  templateName: string, 
  variables: Record<string, string>
): Promise<string> {
  try {
    const templatePath = path.join(process.cwd(), 'src', 'lib', 'email', 'templates', `${templateName}.html`);
    const template = await fs.readFile(templatePath, 'utf-8');
    
    // Replace template variables
    const processedTemplate = replaceVariables(template, variables);
    
    return processedTemplate;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
}

/**
 * Template variable interfaces for type safety
 */

export interface PasswordResetVariables extends Record<string, string> {
  APP_URL: string;
  USER_NAME: string;
  RESET_URL: string;
  EXPIRES_AT: string;
}

export interface EngagementEmailVariables extends Record<string, string> {
  APP_URL: string;
  ENGAGEMENT_TITLE: string;
  ENGAGEMENT_MESSAGE: string;
  TIPS_TITLE: string;
  TIP_1: string;
  TIP_2: string;
  TIP_3: string;
  CTA_URL: string;
  CTA_TEXT: string;
}

export interface InvitationEmailVariables extends Record<string, string> {
  APP_URL: string;
  INVITER_NAME: string;
  PERSONAL_MESSAGE: string;
  INVITE_URL: string;
  EXPIRES_AT: string;
}

export interface EmailVerificationVariables extends Record<string, string> {
  APP_URL: string;
  USER_NAME: string;
  VERIFICATION_URL: string;
  SUPPORT_EMAIL: string;
}

export interface TrialStartVariables extends Record<string, string> {
  APP_URL: string;
  USER_NAME: string;
  TRIAL_START_DATE: string;
  TRIAL_END_DATE: string;
  DASHBOARD_URL: string;
  PRICING_URL: string;
  SUPPORT_EMAIL: string;
  PRIVACY_URL: string;
  TERMS_URL: string;
}

export interface TrialEndingVariables extends Record<string, string> {
  APP_URL: string;
  USER_NAME: string;
  TRIAL_START_DATE: string;
  TRIAL_END_DATE: string;
  DAYS_REMAINING: string;
  UPGRADE_URL: string;
  DASHBOARD_URL: string;
  PRICING_URL: string;
  SUPPORT_EMAIL: string;
  PRIVACY_URL: string;
  TERMS_URL: string;
}

export interface TrialEndedVariables extends Record<string, string> {
  APP_URL: string;
  USER_NAME: string;
  TRIAL_END_DATE: string;
  UPGRADE_URL: string;
  DASHBOARD_URL: string;
  PRICING_URL: string;
  SUPPORT_EMAIL: string;
  PRIVACY_URL: string;
  TERMS_URL: string;
}

/**
 * Pre-configured template loaders with type safety
 */
export const EmailTemplates = {
    
  passwordReset: (variables: PasswordResetVariables) => 
    loadEmailTemplate('password-reset', variables),
    
  engagement: (variables: EngagementEmailVariables) => 
    loadEmailTemplate('engagement', variables),
    
  invitation: (variables: InvitationEmailVariables) => 
    loadEmailTemplate('invitation', variables),
    
  emailVerification: (variables: EmailVerificationVariables) => 
    loadEmailTemplate('email-verification', variables),
    
  trialStart: (variables: TrialStartVariables) => 
    loadEmailTemplate('trial-start', variables),
    
  trialEnding: (variables: TrialEndingVariables) => 
    loadEmailTemplate('trial-ending', variables),
    
  trialEnded: (variables: TrialEndedVariables) => 
    loadEmailTemplate('trial-ended', variables),
};
