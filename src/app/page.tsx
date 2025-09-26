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
  const howItWorksSection = useFadeUpOnScroll(0.3);
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
              "https://kifol.io/auth/signup"
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
      <header className="bg-discovery-beige-200 text-white px-9 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="pt-7 pb-0 px-9 bg-discovery-beige-200">
          <div className={`max-w-7xl mx-auto ${heroAnimation.className}`}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:gap-8">
              {/* Left Column - Content */}
              <div className="text-left pb-20 lg:flex-1 lg:max-w-2xl">
                <h1 className="text-5xl lg:text-7xl font-semibold text-discovery-black mb-6">
                  Every milestone matters. Capture them all with Kifolio.
                </h1>
                <p className="text-lg text-discovery-grey mb-8 leading-relaxed">
                  Build beautiful portfolios for your children that showcase their work, 
                  milestones, and achievements. Whether it&apos;s artwork, school projects, 
                  sports accomplishments, or personal growth, Kifolio has you covered. 
                  Simple, responsive, and totally free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Link
                    href="/auth/signup"
                    className="inline-block bg-discovery-primary text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-primary-light text-center">
                    Get started for free
                  </Link>
                </div>
                <p className="text-discovery-grey text-sm">Create your child&apos;s free portfolio in minutes.</p>
              </div>
              
              {/* Right Column - Image */}
              <div className="flex justify-center lg:justify-end lg:flex-1 lg:-ml-16">
                <div className="max-w-6xl">
                  <img 
                    src="/marketing/portfolio-ren-web.png" 
                    alt="Kifolio Portfolio Example" 
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Strip Section */}
        <section className="py-0">
          <div className="grid grid-cols-3 h-3">
            <div className="bg-discovery-blue-100"></div>
            <div className="bg-discovery-yellow"></div>
            <div className="bg-discovery-orange"></div>
          </div>
        </section>

        {/* The What Section */}
        <section 
          ref={whatSection.ref}
          className={`py-20 px-4 bg-discovery-primary ${whatSection.className}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl lg:text-5xl font-medium text-discovery-white-100 mb-6">
            From first drawing to graduation
            </h2>
            <p className="text-lg text-discovery-white-100 mb-8 leading-relaxed">
            Kifolio isn&apos;t only about preserving memories—it&apos;s about setting your child up for success. By curating their achievements and progress over the years, you&apos;ll have a ready-made portfolio that supports important milestones like:
            </p>
          </div>
          {/* Features Section */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className={`text-center ${featureCards.getItemClassName(0)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <img 
                    src="/marketing/academic-transitions.png" 
                    alt="Academic Transitions" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Academic transitions</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Provide a polished portfolio that complements transcripts and test scores—helping admissions teams see the full story behind the student.
                </p>
              </div>
              
              <div className={`text-center ${featureCards.getItemClassName(1)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <img 
                    src="/marketing/scholarships-awards.png" 
                    alt="Scholarships & Awards" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Scholarships & awards</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Present a record of academic honors, leadership roles, volunteer work, and creative projects to strengthen applications.
                </p>
              </div>
              
              <div className={`text-center ${featureCards.getItemClassName(2)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <img 
                    src="/marketing/resume-early-opps.png" 
                    alt="Resume & Early Opportunities" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Resume & early opportunities</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  For internships, summer programs, or specialized schools, Kifolio helps highlight experiences and growth in a clear, organized format.
                </p>
              </div>

              <div className={`text-center ${featureCards.getItemClassName(3)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <img 
                    src="/marketing/growth-tracking.png" 
                    alt="Personal Growth Tracking" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Personal growth tracking</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Beyond academics, Kifolio gives your child a narrative of progress that builds confidence and shows them how far they've come.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          ref={howItWorksSection.ref}
          className={`py-20 px-4 bg-discovery-orange ${howItWorksSection.className}`}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              How it works
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-discovery-yellow rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">1</span>
                </div>
                <h3 className="text-4xl lg:text-3xl font-medium text-discovery-yellow mb-2 leading-tight">
                  Create your child's portfolio
                </h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Start by setting up a dedicated space for your child or children. Add their name, photo, and a few details to make it their own.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Add their first highlight
                </h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Capture a special moment — an award, artwork, report card, or milestone — with a title, description, and photo.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Build their story over time
                </h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Keep adding highlights as they grow. From small wins to big achievements, Kifolio helps you preserve it all in one place.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">4</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Put it to work
                </h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Export a polished record for transcripts, résumés, college and scholarship applications — or simply as a keepsake of their journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section 
          ref={benefitsSection.ref}
          className={`py-20 px-4 relative bg-cover bg-center bg-no-repeat ${benefitsSection.className}`} 
          style={{ backgroundImage: 'url(/marketing/kifolio_mobile_hand.png)' }}
          aria-labelledby="benefits-heading"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h2 id="benefits-heading" className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why parents choose Kifolio
            </h2>
            <p className="text-lg text-white mb-16 leading-relaxed">
              Everything you need to showcase your child&apos;s growth and achievements in one beautiful platform
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              {/* Left Column */}
              <div className="space-y-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Simple templates that grow with your child</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Organize achievements by date, category, or milestone</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Share with family and friends on any device</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Privacy controls to keep portfolios secure</p>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Track progress over time with visual timelines</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Add photos, videos, and documents easily</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Export and print for physical keepsakes</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Perfect for school applications and memories</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          ref={testimonialsSection.ref}
          className={`py-20 px-4 bg-kifolio-bg ${testimonialsSection.className}`} 
          aria-labelledby="testimonials-heading"
        >
          <div className="max-w-6xl mx-auto">
            <h2 id="testimonials-heading" className="text-3xl md:text-4xl font-bold .text-kifolio-text mb-12 text-center">
              What parents are saying
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">S</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Kelli W.</h4>
                    <p className="text-sm text-gray-600">Parent of a 4-year-old</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;Kifolio has made it so easy to document Emma&apos;s artistic journey. Her grandparents love being able to see her progress, and it&apos;s become a beautiful digital keepsake.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-discovery-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-discovery-black">Sarah M.</h4>
                    <p className="text-sm text-discovery-grey">Parent of a 10-year-old</p>
                  </div>
                </div>
                <p className="text-discovery-grey italic">
                  &ldquo;I used to keep boxes of my son's artwork and certificates, but it always felt messy and incomplete.
                  With Kifolio, we finally have one beautiful place to look back at everything he's accomplished. He loves scrolling through his own progress—it makes him so proud.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Robert K.</h4>
                    <p className="text-sm text-gray-600">Parent of a 16-year-old</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;I started using Kifolio just to keep track of grades and awards, but it’s become so much more. Seeing my daughter’s journey laid out—her creativity,
                  her growth—it's something I'll cherish forever, and I know it will help her when she applies to college.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">D</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Daniel R.</h4>
                    <p className="text-sm text-gray-600">Parent of a 15-year-old</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;When my daughter started applying for summer programs, that was when we realized how valuable her Kifolio was.
                  We could easily share her projects, awards, and activities in a polished way. It showed more than grades—it told her story.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for Featured Snippets */}
        <section 
          ref={faqSection.ref}
          className={`py-20 px-4 bg-discovery-beige-100 ${faqSection.className}`} 
          aria-labelledby="faq-heading"
        >
          <div className="max-w-4xl mx-auto">
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-discovery-black mb-12 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-8" itemScope itemType="https://schema.org/FAQPage">
              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-discovery-black mb-3" itemProp="name">
                  How much does Kifolio cost?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-discovery-grey leading-relaxed" itemProp="text">
                    Kifolio is completely free! Parent's will have access to all features and will be able to create unlimited portfolios and highlights for their children.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-discovery-black mb-3" itemProp="name">
                  What can I include in my child&apos;s portfolio?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-discovery-grey leading-relaxed" itemProp="text">
                    You can include artwork, school projects, sports achievements, academic milestones, creative writing, photos, videos, and any other accomplishments that showcase your child&apos;s growth and development.
                  </div>
                </div>
      </div>

              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-discovery-black mb-3" itemProp="name">
                  Can I share the portfolio with family and friends?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-discovery-grey leading-relaxed" itemProp="text">
                    Yes! Kifolio portfolios are fully responsive and can be shared with anyone. You can control privacy settings and choose whether to make portfolios public or password-protected.
                  </div>
                </div>
      </div>

              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold text-discovery-black mb-3" itemProp="name">
                  How do I get started?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-discovery-grey leading-relaxed" itemProp="text">
                    Getting started is simple! <a href="/auth/signup" className="text-discovery-primary hover:underline">Sign up for free</a>, choose a template, add your child&apos;s information, and start documenting their milestones and achievements. The entire setup takes just minutes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-discovery-primary text-white py-12 px-4">
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
                <li><Link href="/auth/signup" className="hover:text-discovery-white-80 transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/login" className="hover:text-discovery-white-80 transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white">
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
