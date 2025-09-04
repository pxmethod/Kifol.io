'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivacyPolicyPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Matching Marketing Page */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <Link href="/">
              <Image 
                src="/kifolio_logo_dark.svg" 
                alt="Kifolio Logo" 
                width={144}
                height={38}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-kifolio-primary text-white px-6 py-2 rounded-lg hover:bg-kifolio-primary-dark transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="text-gray-700 hover:text-kifolio-primary transition-colors font-medium"
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-kifolio-primary text-white px-6 py-2 rounded-lg hover:bg-kifolio-primary-dark transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-left">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8 text-left">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to Kifolio ("we," "our," or "us"). We are committed to protecting your privacy and the privacy of your children. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital portfolio service for children's achievements and milestones.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Personal Information</h3>
              <p className="leading-relaxed mb-4">
                We may collect the following types of personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (email address, name, password)</li>
                <li>Child's information (name, age, photos, achievements, projects)</li>
                <li>Location information (city, state for local events)</li>
                <li>Communication preferences and settings</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">2.2 Usage Information</h3>
              <p className="leading-relaxed mb-4">
                We automatically collect certain information when you use our service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information (device type, operating system)</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our portfolio creation service</li>
                <li>Create and manage digital portfolios for your children</li>
                <li>Send notifications about local events and activities</li>
                <li>Improve our service and develop new features</li>
                <li>Communicate with you about your account and our service</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Portfolio Sharing</h3>
              <p className="leading-relaxed mb-4">
                You control who can view your child's portfolio. Portfolios can be:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Private (password-protected, accessible only to those you authorize)</li>
                <li>Public (accessible via direct link)</li>
                <li>Shared with specific individuals through secure links</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">4.2 Third-Party Services</h3>
              <p className="leading-relaxed mb-4">
                We may share information with trusted third-party service providers who assist us in:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hosting and maintaining our service</li>
                <li>Sending email communications</li>
                <li>Providing analytics and usage insights</li>
                <li>Processing payments (if applicable)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
              <p className="leading-relaxed">
                We may disclose your information if required by law, regulation, or legal process, or to protect the rights, property, or safety of Kifolio, our users, or others.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Children's Privacy (COPPA Compliance)</h2>
              <p className="leading-relaxed mb-4">
                We take children's privacy seriously and comply with the Children's Online Privacy Protection Act (COPPA):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do not knowingly collect personal information from children under 13 without parental consent</li>
                <li>Parents/guardians control all information about their children</li>
                <li>We do not use children's information for marketing or advertising</li>
                <li>Parents can review, modify, or delete their child's information at any time</li>
                <li>We implement additional security measures for children's data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure hosting infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
              <p className="leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct or update your information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Control portfolio privacy settings</li>
                <li>Opt out of certain communications</li>
                <li>Request information about how your data is used</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide our services. We will delete your information upon account closure, except where we are required to retain it for legal, regulatory, or security purposes. You can request deletion of your data at any time through your account settings or by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies and Tracking Technologies</h2>
              <p className="leading-relaxed mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Authenticate your account</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized content and features</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. State Privacy Rights</h2>
              <p className="leading-relaxed mb-4">
                If you are a resident of California, Virginia, Colorado, or other states with specific privacy laws, you may have additional rights under applicable state privacy laws, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to delete personal information</li>
                <li>Right to correct inaccurate personal information</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at{' '}
                <a href="mailto:john@kifol.io" className="text-kifolio-primary hover:underline">
                  john@kifol.io
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="bg-kifolio-primary text-white px-8 py-3 rounded-lg hover:bg-kifolio-primary-dark transition-colors font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-kifolio-header text-white py-12 px-4 mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Image 
                src="/kifolio_logo.svg" 
                alt="Kifolio Logo" 
                width={144}
                height={38}
                className="h-10 w-auto mb-4"
              />
              <p className="text-white mb-4">
                Create beautiful portfolios to showcase your children's work, 
                milestones, and achievements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white">
                <li><a href="mailto:john@kifol.io" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white">
            <p>&copy; 2025 Kifolio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
