import nodemailer from 'nodemailer';
import crypto from 'crypto';

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error("SMTP configuration environment variables must be set (SMTP_HOST, SMTP_USER, SMTP_PASS)");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@edutrack.example.com';

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
    await transporter.sendMail({
      from: `"EduTrack" <${FROM_EMAIL}>`,
      to: parentEmail,
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
    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
}