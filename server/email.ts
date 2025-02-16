import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is required');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendGrid = {
  async send({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
    return sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      subject,
      text,
      html: html || text,
    });
  },

  async sendParentInvitation(email: string, studentName: string, invitationToken: string) {
    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    const registrationUrl = `${appUrl}/auth/parent-register?token=${invitationToken}`;

    return this.send({
      to: email,
      subject: `Invitation to Join as ${studentName}'s Parent`,
      text: `
        You have been invited to join our education platform as ${studentName}'s parent.
        
        To complete your registration, please click on the following link:
        ${registrationUrl}
        
        This invitation will expire in 7 days.
        
        If you did not expect this invitation, please ignore this email.
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Parent Invitation</h2>
          <p>You have been invited to join our education platform as <strong>${studentName}'s</strong> parent.</p>
          
          <p>To complete your registration, please click on the following link:</p>
          <p>
            <a href="${registrationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
              Complete Registration
            </a>
          </p>
          
          <p><small>This invitation will expire in 7 days.</small></p>
          <p><small>If you did not expect this invitation, please ignore this email.</small></p>
        </div>
      `,
    });
  },
};
