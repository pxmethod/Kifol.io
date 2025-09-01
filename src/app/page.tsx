'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  useFadeUpOnLoad, 
  useFadeUpOnScroll, 
  useScaleInOnScroll,
  useStaggeredLoadAnimation 
} from '@/hooks/useSimpleAnimations';

export default function MarketingPage() {
  // Load animations for above-the-fold content
  const heroAnimation = useFadeUpOnLoad(200);
  const portfolioShowcase = useFadeUpOnLoad(600);

  // Scroll animations for below-the-fold content
  const whatSection = useFadeUpOnScroll(0.3);
  const benefitsSection = useFadeUpOnScroll(0.3);
  const demoSection = useFadeUpOnScroll(0.3);
  const testimonialsSection = useFadeUpOnScroll(0.3);
  const ctaSection = useScaleInOnScroll(0.3);
  const faqSection = useFadeUpOnScroll(0.3);

  // Staggered animations
  const benefitItems = useStaggeredLoadAnimation(8, 1000, 100);
  const featureCards = useStaggeredLoadAnimation(4, 800, 150);
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
        <section className="py-20 pb-40 px-4 text-center bg-kifolio-header">
          <div className={`max-w-4xl mx-auto ${heroAnimation.className}`}>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Every milestone matters. Capture them all with Kifolio.
            </h1>
            <p className="text-xl text-white mb-12 leading-relaxed">
              Build beautiful portfolios for your children that showcase their work, 
              milestones, and achievements. Whether it&apos;s artwork, school projects, 
              sports accomplishments, or personal growth, Kifolio has you covered. 
              Simple, responsive, and totally free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-block btn-primary hover:bg-kifolio-primary-dark px-10 py-4 rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-xl">
                Get Started
              </Link>
            </div>
            <p className="py-4 text-white text-sm">Create your child&apos;s free portfolio in minutes.</p>
          </div>
        </section>

        {/* Portfolio Showcase Section with Overlap */}
        <section 
          className={`relative bg-contain bg-center bg-no-repeat h-64 md:h-96 lg:h-[800px] -mt-40 ${portfolioShowcase.className}`}
          style={{
            backgroundImage: "url('/marketing/portfolio-ren-web.png')"
          }}
        >     
          <div className="relative z-10 h-full flex items-center justify-center">
            {/* Portfolio showcase content can go here */}
          </div>
        </section>

        {/* The What Section */}
        <section 
          ref={whatSection.ref}
          className={`py-20 px-4 bg-kifolio-bg ${whatSection.className}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold .text-kifolio-text mb-8">
            From first drawing to graduation
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Kifolio isn&apos;t only about preserving memories—it&apos;s about setting your child up for success. By curating their achievements and progress over the years, you&apos;ll have a ready-made portfolio that supports important milestones like:
            </p>
          </div>
          {/* Features Section */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className={`text-center ${featureCards.getItemClassName(0)}`}>
                <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-kifolio-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Academic Transitions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Provide a polished portfolio that complements transcripts and test scores—helping admissions teams see the full story behind the student.
                </p>
              </div>
              
              <div className={`text-center ${featureCards.getItemClassName(1)}`}>
                <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-kifolio-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Scholarships & Awards</h3>
                <p className="text-gray-600 leading-relaxed">
                  Present a record of academic honors, leadership roles, volunteer work, and creative projects to strengthen applications.
                </p>
              </div>
              
              <div className={`text-center ${featureCards.getItemClassName(2)}`}>
                <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-kifolio-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Resume & Early Opportunities</h3>
                <p className="text-gray-600 leading-relaxed">
                  For internships, summer programs, or specialized schools, Kifolio helps highlight experiences and growth in a clear, organized format.
                </p>
              </div>

              <div className={`text-center ${featureCards.getItemClassName(3)}`}>
                <div className="bg-kifolio-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-kifolio-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Personal Growth Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Beyond academics, Kifolio gives your child a narrative of progress that builds confidence and shows them how far they've come.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section 
          ref={benefitsSection.ref}
          className={`py-20 px-4 bg-white ${benefitsSection.className}`} 
          aria-labelledby="benefits-heading"
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold .text-kifolio-text mb-4">
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

        {/* Testimonials Section */}
        <section 
          ref={testimonialsSection.ref}
          className={`py-20 px-4 bg-white ${testimonialsSection.className}`} 
          aria-labelledby="testimonials-heading"
        >
          <div className="max-w-6xl mx-auto">
            <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold .text-kifolio-text mb-12 text-center">
              What Parents Are Saying
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-kifolio-bg rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Sarah M.</h4>
                    <p className="text-sm text-gray-600">Parent of Emma, age 8</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;Kifolio has made it so easy to document Emma&apos;s artistic journey. Her grandparents love being able to see her progress, and it&apos;s become a beautiful digital keepsake.&rdquo;
                </p>
              </div>

              <div className="bg-kifolio-bg rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Michael T.</h4>
                    <p className="text-sm text-gray-600">Parent of Lucas, age 12</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;The templates are beautiful and easy to customize. Lucas loves seeing his sports achievements documented, and it motivates him to keep improving.&rdquo;
                </p>
              </div>

              <div className="bg-kifolio-bg rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Michael T.</h4>
                    <p className="text-sm text-gray-600">Parent of Lucas, age 9</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;The templates are beautiful and easy to customize. Lucas loves seeing his sports achievements documented, and it motivates him to keep improving.&rdquo;
                </p>
              </div>

              <div className="bg-kifolio-bg rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Rachel N.</h4>
                    <p className="text-sm text-gray-600">Parent of Jack, age 12</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;It’s amazing to see how his projects, awards,
                  and even his artwork tell a complete story of who he’s becoming. It’s something we’ll cherish as a family—and I know it’ll help him when he applies to high school too.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section 
          ref={ctaSection.ref}
          className={`py-20 px-4 bg-gradient-to-br bg-gradient-to-br from-orange-500 to-pink-500 ${ctaSection.className}`}
        >
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start building a record today that will support your child for years to come.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-kifolio-primary hover:bg-gray-100 px-10 py-4 rounded-lg text-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              Sign Up for Free
            </Link>
          </div>
        </section>

        {/* FAQ Section for Featured Snippets */}
        <section 
          ref={faqSection.ref}
          className={`py-20 px-4 bg-kifolio-bg ${faqSection.className}`} 
          aria-labelledby="faq-heading"
        >
          <div className="max-w-4xl mx-auto">
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold .text-kifolio-text mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8" itemScope itemType="https://schema.org/FAQPage">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
                  How much does Kifolio cost?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Kifolio is completely free to start. No credit card required, 30-day free trial. You can create unlimited portfolios and use all core features without any hidden fees.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
                  What can I include in my child&apos;s portfolio?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    You can include artwork, school projects, sports achievements, academic milestones, creative writing, photos, videos, and any other accomplishments that showcase your child&apos;s growth and development.
                  </div>
                </div>
      </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
                  Can I share the portfolio with family and friends?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Yes! Kifolio portfolios are fully responsive and can be shared with anyone. You can control privacy settings and choose whether to make portfolios public or password-protected.
                  </div>
                </div>
      </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
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
      <footer className="bg-kifolio-header text-white py-12 px-4">
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
                Create beautiful portfolios to showcase your children&apos;s work, 
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
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><a href="mailto:john@kifol.io" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white mt-8 pt-8 text-center text-white">
            <p>&copy; 2025 Kifolio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
