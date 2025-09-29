'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function TermsOfUsePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      {/* Header - Matching Marketing Page */}
      <header className="bg-discovery-beige-200 text-white px-9 py-4 top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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
                className="bg-discovery-yellow text-discovery-black px-8 py-4 rounded-pill hover:bg-discovery-yellow-dark transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="text-discovery-black hover:text-discovery-grey transition-colors font-medium"
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-discovery-yellow text-discovery-black px-8 py-4 rounded-pill hover:bg-discovery-yellow-dark transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-9 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-5xl lg:text-5xl font-medium text-discovery-black mb-8">Terms of Use</h1>
          
          <p className="text-lg text-discovery-grey mb-8 leading-relaxed">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="space-y-8 text-discovery-grey">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Kifolio ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Kifolio is a portfolio creation platform that allows users to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Create and manage digital portfolios</li>
                <li>Document achievements and milestones</li>
                <li>Share portfolios with family and friends</li>
                <li>Customize portfolio designs and templates</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">3. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">4. User Content</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of any content you submit, post, or display on the Service. By using the Service, you grant us a worldwide, non-exclusive license to use, display, and distribute your content solely for the purpose of providing the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for ensuring that your content does not violate any laws, infringe on third-party rights, or contain harmful, offensive, or inappropriate material.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">5. Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use the Service to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Upload malicious code or attempt to compromise the Service</li>
                <li>Spam, harass, or abuse other users</li>
                <li>Use the Service for any commercial purpose without permission</li>
                <li>Attempt to reverse engineer or copy the Service</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">7. Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to maintain high availability of the Service, but we do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues beyond our control.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service is provided "as is" without warranties of any kind. We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of the Service.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, the Service, or third parties.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Your continued use of the Service after changes are posted constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-semibold text-discovery-black mb-4">11. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Use, please contact {' '}
                <a href="mailto:john@kifol.io" className="text-discovery-orange font-medium hover:text-discovery-orange-light">
                  john@kifol.io
                </a>
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="mt-12 text-center">
            <Link href="/" className="bg-discovery-orange text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-orange-light text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-discovery-black text-white py-12 px-4">
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
              <p className="text-discovery-white-100 leading-relaxed">
                Create beautiful portfolios to showcase your children&apos;s work, 
                milestones, and achievements.
              </p>
            </div>
            <div>
              <h4 className="text-2xl lg:text-2xl font-medium text-discovery-yellow mb-2 leading-tight">Product</h4>
              <ul className="space-y-2 text-discovery-white-100 leading-relaxed">
                <li><Link href="/auth/signup" className="hover:text-discovery-white-80 transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/login" className="hover:text-discovery-white-80 transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl lg:text-2xl font-medium text-discovery-yellow mb-2 leading-tight">Company</h4>
              <ul className="space-y-2 text-discovery-white-100 leading-relaxed">
                <li><a href="mailto:john@kifol.io" className="hover:text-discovery-white-80 transition-colors">Contact</a></li>
                <li><Link href="/privacy" className="hover:text-discovery-white-80 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-discovery-white-80 transition-colors">Terms</Link></li>
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
