import { MailService } from '@sendgrid/mail';
import crypto from 'crypto';

// Validate required environment variable
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendParentInvitation({
  parentEmail,
  studentName,
  token,
}: {
  parentEmail: string;
  studentName: string;
  token: string;
}): Promise<boolean> {
  const invitationLink = `${process.env.APP_URL || 'http://localhost:5000'}/register?token=${token}`;

  try {
    await mailService.send({
      to: parentEmail,
      from: process.env.FROM_EMAIL || 'noreply@edutrack.com',
      subject: `Invitation to View ${studentName}'s Educational Progress`,
      html: `
        <h2>Welcome to EduTrack!</h2>
        <p>You've been invited to track ${studentName}'s educational progress.</p>
        <p>Click the link below to create your account and access your child's portfolio:</p>
        <p><a href="${invitationLink}">Accept Invitation</a></p>
        <p>This invitation link will expire in 7 days.</p>
        <p>If you didn't expect this invitation, please ignore this email.</p>
      `,
    });

    console.log('Parent invitation email sent successfully to:', parentEmail);
    return true;
  } catch (error) {
    console.error('Failed to send parent invitation email:', {
      error: error instanceof Error ? error.message : String(error),
      email: parentEmail,
      studentName
    });
    return false;
  }
}