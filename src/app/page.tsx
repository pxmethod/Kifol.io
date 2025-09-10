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
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <img 
                    src="/marketing/academic-transitions.png" 
                    alt="Academic Transitions" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Academic transitions</h3>
                <p className="text-gray-600 leading-relaxed">
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
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Scholarships & awards</h3>
                <p className="text-gray-600 leading-relaxed">
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
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Resume & early opportunities</h3>
                <p className="text-gray-600 leading-relaxed">
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
                <h3 className="text-2xl font-semibold .text-kifolio-text mb-4">Personal growth tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Beyond academics, Kifolio gives your child a narrative of progress that builds confidence and shows them how far they've come.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section 
          ref={howItWorksSection.ref}
          className={`py-20 px-4 bg-kifolio-header ${howItWorksSection.className}`}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-kifolio-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Create your child's portfolio
                </h3>
                <p className="text-white leading-relaxed">
                  Start by setting up a dedicated space for your child or children. Add their name, photo, and a few details to make it their own.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-kifolio-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Add their first highlight
                </h3>
                <p className="text-white leading-relaxed">
                  Capture a special moment — an award, artwork, report card, or milestone — with a title, description, and photo.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-kifolio-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Build their story over time
                </h3>
                <p className="text-white leading-relaxed">
                  Keep adding highlights as they grow. From small wins to big achievements, Kifolio helps you preserve it all in one place.
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
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Simple templates that grow with your child</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Organize achievements by date, category, or milestone</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Share with family and friends on any device</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Privacy controls to keep portfolios secure</p>
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
                  <p className="text-white">Track progress over time with visual timelines</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Add photos, videos, and documents easily</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-white">Export and print for physical keepsakes</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-kifolio-primary rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-kifolio-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold .text-kifolio-text">Sarah M.</h4>
                    <p className="text-sm text-gray-600">Parent of a 10-year-old</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &ldquo;I used to keep boxes of my son's artwork and certificates, but it always felt messy and incomplete.
                  With Kifolio, we finally have one beautiful place to look back at everything he's accomplished. He loves scrolling through his own progress—it makes him so proud.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
        {/* Kifolio Premium Section */}
        <section 
          ref={ctaSection.ref}
          className={`py-20 px-4 bg-gradient-to-br from-orange-500 to-pink-500 ${ctaSection.className}`}
        >
          <div className="max-w-6xl mx-auto text-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Optional: Kifolio Premium
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Unlock advanced features such as unlimited highlights, multiple portfolios, extra storage, and advanced organization.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Premium Features List */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-6">Premium features include:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg">Multiple children under one account</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg">Unlimited highlights</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg">Extra storage (videos, PDFs, audio)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg">Advanced organization (tags, categories, timeline filters)</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg">Export/share features (e.g., generate a portfolio PDF for college apps)</span>
                  </li>
                </ul>
              </div>
              
              {/* Call to Action */}
              <div className="text-center md:text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-xl font-semibold mb-4">Try Kifolio Premium free for 7 days.</h3>
                  <div className="space-y-4">
                    <Link
                      href="/pricing"
                      className="inline-block bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl w-full md:w-auto"
                    >
                      Learn more
                    </Link>
                    <p className="text-sm opacity-80">
                      No commitment • Cancel anytime • PayPal and all major credit and debit cards accepted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
              Frequently asked questions
            </h2>
            <div className="space-y-8" itemScope itemType="https://schema.org/FAQPage">
              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
                  How much does Kifolio cost?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Kifolio is completely free! There is also our optional <a href="/pricing" className="text-kifolio-primary hover:underline">Kifolio Premium plan</a> that offers unlimited highlights, multiple portfolios, extra storage, and advanced organization.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
                  What can I include in my child&apos;s portfolio?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    You can include artwork, school projects, sports achievements, academic milestones, creative writing, photos, videos, and any other accomplishments that showcase your child&apos;s growth and development.
                  </div>
                </div>
      </div>

              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
                  Can I share the portfolio with family and friends?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Yes! Kifolio portfolios are fully responsive and can be shared with anyone. You can control privacy settings and choose whether to make portfolios public or password-protected.
                  </div>
                </div>
      </div>

              <div className="bg-white rounded-lg p-6 shadow-sm" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 className="text-xl font-semibold .text-kifolio-text mb-3" itemProp="name">
                  How do I get started?
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <div className="text-gray-600 leading-relaxed" itemProp="text">
                    Getting started is simple! <a href="/auth/signup" className="text-kifolio-primary hover:underline">Sign up for free</a>, choose a template, add your child&apos;s information, and start documenting their milestones and achievements. The entire setup takes just minutes.
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
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
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
