import Link from 'next/link';
import Image from 'next/image';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Kifolio",
            "description": "Digital portfolio platform for children's achievements, creativity, and milestones",
            "url": "https://kifol.io",
            "logo": "https://kifol.io/kifolio_logo_dark.svg",
            "sameAs": [
              "https://kifol.io/auth/signup",
              "https://kifol.io/whats-happening"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "support@kifol.io"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free digital portfolio creation for children"
            }
          })
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <Image 
              src="/kifolio_logo_dark.svg" 
              alt="Kifolio Logo" 
              width={144}
              height={38}
              className="h-10 w-auto"
              priority
            />
          </div>
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-br from-kifolio-bg to-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Every milestone matters. Capture them all with Kifolio.
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Build beautiful portfolios for your children that showcase their work, 
              milestones, and achievements. Whether it&apos;s artwork, school projects, 
              sports accomplishments, or personal growth, Kifolio has you covered. 
              Simple, responsive, and totally free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-kifolio-primary hover:bg-kifolio-primary-dark text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
            <p className="py-4 text-gray-500 text-sm">Totally free. Set up in minutes.</p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-white" aria-labelledby="benefits-heading">
          <div className="max-w-6xl mx-auto text-center">
            <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Parents Choose Kifolio
            </h2>
            <p className="text-lg text-gray-600 mb-16 leading-relaxed">
              Everything you need to showcase your child&apos;s growth and achievements in one beautiful platform
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              {/* Left Column */}
              <div className="space-y-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Beautiful, customizable templates that grow with your child</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Organize achievements by date, category, or milestone</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Share with family and friends on any device</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Privacy controls to keep portfolios secure</p>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Track progress over time with visual timelines</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Add photos, videos, and documents easily</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Export and print for physical keepsakes</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">Perfect for school applications and memories</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The What Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            From first drawing to graduation
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Kifolio isn&apos;t only about preserving memories—it&apos;s about setting your child up for success. By curating their achievements and progress over the years, you&apos;ll have a ready-made portfolio that supports important milestones like:
            </p>
          </div>
          {/* Features Section */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-kifolio-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Beautiful Templates</h3>
                <p className="text-gray-600 leading-relaxed">
                  Start with one of our beautiful templates and make it your own. 
                  Customize colors, layouts, and content to match your child&apos;s personality.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-kifolio-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fully Responsive</h3>
                <p className="text-gray-600 leading-relaxed">
                  Look great at every screen size right out of the box, from phones 
                  to tablets to desktops. Share with family and friends on any device.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-kifolio-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Completely Free</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build unlimited portfolios and use all of Kifolio&apos;s core features 
                  – for free! No hidden fees, no credit card required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Sites Preview */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              See Kifolio in Action
            </h2>
                         <p className="text-lg text-gray-600 mb-12 leading-relaxed text-center">
             Digital scrapbook meets academic resume—built by parents to showcase their children&apos;s academic progress, personal achievements, and creative work in one organized, shareable portfolio.
             </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Demo Site 1 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p>Portfolio Preview</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Emma&apos;s Art Portfolio</h3>
                  <p className="text-gray-600 text-sm">Showcasing creative projects and artistic growth</p>
                </div>
              </div>

              {/* Demo Site 2 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Portfolio Preview</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lucas&apos;s Sports Journey</h3>
                  <p className="text-gray-600 text-sm">Tracking athletic achievements and progress</p>
                </div>
              </div>

              {/* Demo Site 3 */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 19 16.5 19c-1.746 0-3.332-.523-4.5-1.253" />
                    </svg>
                    <p>Portfolio Preview</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sophia&apos;s Learning Path</h3>
                  <p className="text-gray-600 text-sm">Documenting educational milestones and projects</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-white" aria-labelledby="testimonials-heading">
          <div className="max-w-6xl mx-auto">
            <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What Parents Are Saying
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah M.</h4>
                    <p className="text-sm text-gray-600">Parent of Emma, age 8</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;Kifolio has made it so easy to document Emma&apos;s artistic journey. Her grandparents love being able to see her progress, and it&apos;s become a beautiful digital keepsake.&rdquo;
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Michael T.</h4>
                    <p className="text-sm text-gray-600">Parent of Lucas, age 12</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;The templates are beautiful and easy to customize. Lucas loves seeing his sports achievements documented, and it motivates him to keep improving.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-kifolio-primary to-kifolio-primary-dark">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of parents creating beautiful portfolios for their children
            </p>
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-kifolio-primary hover:bg-gray-100 px-10 py-4 rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Create Your First Portfolio
            </Link>
          </div>
        </section>

        {/* FAQ Section for Featured Snippets */}
        <section className="py-20 px-4 bg-gray-50" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto">
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8" itemScope itemType="https://schema.org/FAQPage">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-gray-900 mb-3" itemProp="name">
                  How much does Kifolio cost?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Kifolio is completely free to start. No credit card required, 30-day free trial. You can create unlimited portfolios and use all core features without any hidden fees.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-gray-900 mb-3" itemProp="name">
                  What can I include in my child&apos;s portfolio?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    You can include artwork, school projects, sports achievements, academic milestones, creative writing, photos, videos, and any other accomplishments that showcase your child&apos;s growth and development.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-gray-900 mb-3" itemProp="name">
                  Can I share the portfolio with family and friends?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Yes! Kifolio portfolios are fully responsive and can be shared with anyone. You can control privacy settings and choose whether to make portfolios public or password-protected.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-gray-900 mb-3" itemProp="name">
                  How do I get started with Kifolio?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Getting started is simple! <a href="/auth/signup" className="text-kifolio-primary hover:underline">Sign up for free</a>, choose a template, add your child&apos;s information, and start documenting their achievements. The entire setup takes just minutes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Image 
                src="/kifolio_logo_dark.svg" 
                alt="Kifolio Logo" 
                width={144}
                height={38}
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-400 mb-4">
                Create beautiful portfolios to showcase your children&apos;s work, 
                milestones, and achievements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link></li>
                <li><Link href="/whats-happening" className="hover:text-white transition-colors">What&apos;s Happening</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Kifolio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
