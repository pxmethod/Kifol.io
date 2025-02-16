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
const FROM_EMAIL = 'noreply@educationtracker.com';

export async function generateVerificationToken(programId: number, parentEmail: string): Promise<string> {
  // Check if parent is already verified globally
  const parentVerification = await storage.getParentVerification(parentEmail);
  if (parentVerification?.isVerified) {
    return ''; // No need for token if already verified
  }

  // Check for existing active token
  const existingToken = await storage.getActiveVerificationToken(programId, parentEmail);
  if (existingToken) {
    return existingToken.token;
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_EXPIRY_HOURS);

  const verificationToken: InsertVerificationToken = {
    token,
    parentEmail,
    programId,
    expiresAt,
  };

  await storage.createVerificationToken(verificationToken);
  return token;
}

export async function sendParentVerificationEmail(
  students: Student[], 
  programTitle: string,
  programId: number
): Promise<boolean> {
  try {
    const parentEmail = students[0].parentEmail;
    const parentName = students[0].parentName || 'Parent/Guardian';

    // Get or create parent verification
    let parentVerification = await storage.getParentVerification(parentEmail);
    if (!parentVerification) {
      parentVerification = await storage.createParentVerification({
        email: parentEmail,
        isVerified: false,
      });
    }

    // If already verified, auto-verify all students and return success
    if (parentVerification.isVerified) {
      // Auto-verify all students with this parent email
      for (const student of students) {
        await storage.markStudentAsVerified(student.id);
      }
      return true;
    }

    const token = await generateVerificationToken(programId, parentEmail);
    // If no token needed (already verified), just return success
    if (!token) {
      return true;
    }

    const verificationUrl = `${process.env.PUBLIC_URL}/verify?token=${token}`;

    const studentsList = students
      .map(student => `- ${student.name} (Grade ${student.grade})`)
      .join('\n');

    const emailContent = {
      to: parentEmail,
      from: FROM_EMAIL,
      subject: `Verify Your Email for Education Progress Tracker`,
      html: `
        <div>
          <h2>Welcome to Education Progress Tracker</h2>
          <p>Dear ${parentName},</p>
          <p>Your children have been enrolled in the program: ${programTitle}</p>
          <p>Students enrolled:</p>
          <pre>${studentsList}</pre>
          <p>To verify your email and enable access to all current and future program enrollments, please click the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
          <p>This link will expire in ${VERIFICATION_EXPIRY_HOURS} hours.</p>
          <p>After verification, you won't need to verify again for future program enrollments.</p>
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

export async function verifyToken(token: string): Promise<Student[] | null> {
  const verificationToken = await storage.getVerificationToken(token);

  if (!verificationToken) {
    return null;
  }

  if (new Date() > verificationToken.expiresAt) {
    await storage.deleteVerificationToken(token);
    return null;
  }

  // Mark parent email as verified (this is now a global verification)
  await storage.markParentAsVerified(verificationToken.parentEmail);

  // Get all students with this parent email across all programs
  const allStudents = await storage.getStudentsByParentEmail(verificationToken.parentEmail);

  // Mark all students with this parent email as verified
  for (const student of allStudents) {
    await storage.markStudentAsVerified(student.id);
  }

  await storage.deleteVerificationToken(token);

  return allStudents;
}