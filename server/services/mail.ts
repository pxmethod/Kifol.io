import mailgun from 'mailgun-js';

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY!,
  domain: 'sandbox087f00a7106a482bbf6cf2c685d0e40d.mailgun.org' // Using sandbox domain for testing
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
      from: `Student Progress <noreply@sandbox087f00a7106a482bbf6cf2c685d0e40d.mailgun.org>`,
      to,
      subject,
      text,
      html
    });
    console.log('Successfully sent email to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    console.warn('Note: When using sandbox domain, recipient email must be authorized in Mailgun first');
    return false;
  }
}

export function generateParentInvitationEmail(studentName: string, invitationToken: string): {
  subject: string;
  text: string;
  html: string;
} {
  const invitationLink = `${process.env.REPLIT_DOMAIN}/parent-signup/${invitationToken}`;

  const subject = `Invitation to Track ${studentName}'s Progress`;

  const text = `
    You've been invited to track ${studentName}'s educational progress!

    Click the following link to create your parent account:
    ${invitationLink}

    This link will expire in 7 days.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Student Progress Tracking!</h2>
      <p>You've been invited to track <strong>${studentName}'s</strong> educational progress!</p>
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