import { MailService } from '@sendgrid/mail';
import { randomBytes } from 'crypto';
import { storage } from './storage';
import { Student, InsertVerificationToken } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

const VERIFICATION_EXPIRY_HOURS = 24;
const FROM_EMAIL = 'noreply@educationtracker.com'; // Update this with your verified sender

export async function generateVerificationToken(studentId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_EXPIRY_HOURS);

  const verificationToken: InsertVerificationToken = {
    token,
    studentId,
    expiresAt,
  };

  await storage.createVerificationToken(verificationToken);
  return token;
}

export async function sendVerificationEmail(student: Student, programTitle: string): Promise<boolean> {
  try {
    const token = await generateVerificationToken(student.id);
    const verificationUrl = `${process.env.PUBLIC_URL}/verify?token=${token}`;

    const emailContent = {
      to: student.parentEmail,
      from: FROM_EMAIL,
      subject: `Verify Your Child's Enrollment in ${programTitle}`,
      html: `
        <div>
          <h2>Welcome to Education Progress Tracker</h2>
          <p>Dear ${student.parentName || 'Parent/Guardian'},</p>
          <p>Your child ${student.name} has been enrolled in the program: ${programTitle}</p>
          <p>To verify this enrollment and create your parent account, please click the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">
            Verify Enrollment
          </a>
          <p>This link will expire in ${VERIFICATION_EXPIRY_HOURS} hours.</p>
          <p>If you did not expect this email, please ignore it.</p>
        </div>
      `,
    };

    await mailService.send(emailContent);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function verifyToken(token: string): Promise<Student | null> {
  const verificationToken = await storage.getVerificationToken(token);
  
  if (!verificationToken) {
    return null;
  }

  if (new Date() > verificationToken.expiresAt) {
    await storage.deleteVerificationToken(token);
    return null;
  }

  const student = await storage.getStudent(verificationToken.studentId);
  if (!student) {
    return null;
  }

  await storage.markStudentAsVerified(student.id);
  await storage.deleteVerificationToken(token);
  
  return student;
}
