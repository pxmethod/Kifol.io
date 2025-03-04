import mailgun from 'mailgun-js';

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY!,
  domain: process.env.MAILGUN_DOMAIN!
});

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<boolean> {
  try {
    await mg.messages().send({
      from: `Student Progress <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export function generateParentInvitationEmail(studentName: string, programTitle: string, invitationToken: string): {
  subject: string;
  text: string;
  html: string;
} {
  const invitationLink = `${process.env.REPLIT_DOMAIN}/parent-signup/${invitationToken}`;

  const subject = `Invitation to Track ${studentName}'s Progress in ${programTitle}`;

  const text = `
    You've been invited to track ${studentName}'s educational progress in the ${programTitle} program!

    Click the following link to create your parent account:
    ${invitationLink}

    This link will expire in 7 days.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Student Progress Tracking!</h2>
      <p>You've been invited to track <strong>${studentName}'s</strong> educational progress in the <strong>${programTitle}</strong> program!</p>
      <p>Click the button below to create your parent account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}" 
           style="background-color: #0066cc; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Create Parent Account
        </a>
      </div>
      <p style="color: #666; font-size: 0.9em;">This invitation link will expire in 7 days.</p>
    </div>
  `;

  return { subject, text, html };
}