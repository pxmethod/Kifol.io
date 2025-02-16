import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Validate required environment variables
const requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'] as const;
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Create transporter with detailed error logging
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Enable debug logging
  logger: true  // Log to console
});

const FROM_EMAIL = process.env.FROM_EMAIL;

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
    // Verify SMTP connection before sending
    await transporter.verify();

    const result = await transporter.sendMail({
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

    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    // Provide more detailed error information
    console.error('Failed to send invitation email:', {
      error: error.message,
      code: error.code,
      response: error.response,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER
    });
    return false;
  }
}