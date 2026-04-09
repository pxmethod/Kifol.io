'use client';

import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/MarketingNav';
import { SITE_ORIGIN } from '@/lib/seo';
import {
  useFadeUpOnLoad,
  useFadeUpOnScroll,
  useStaggeredLoadAnimation,
} from '@/hooks/useSimpleAnimations';

export default function MarketingPage() {
  
  // Load animations for above-the-fold content
  const heroAnimation = useFadeUpOnLoad(200);

  // Scroll animations for below-the-fold content
  const whatSection = useFadeUpOnScroll(0.3);
  const howItWorksSection = useFadeUpOnScroll(0.3);
  const benefitsSection = useFadeUpOnScroll(0.3);
  const testimonialsSection = useFadeUpOnScroll(0.3);
  const faqSection = useFadeUpOnScroll(0.3);
  
  // Staggered animations
  const featureCards = useStaggeredLoadAnimation(4, 800, 150);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'Kifolio',
        description:
          "Digital portfolio platform for children's achievements, creativity, and milestones",
        url: SITE_ORIGIN,
        logo: `${SITE_ORIGIN}/kifolio_logo_dark.svg`,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'support@kifol.io',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_ORIGIN}/#softwareapplication`,
        name: 'Kifolio',
        url: SITE_ORIGIN,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web browser',
        description:
          'Free digital portfolio for kids and students. Capture milestones, school projects, sports achievements, artwork, and academic records in one shareable place.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free',
        },
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_ORIGIN}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much does Kifolio cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Kifolio is completely free! Parents have access to all features and can create unlimited portfolios and highlights for their children.',
            },
          },
          {
            '@type': 'Question',
            name: "What can I include in my child's portfolio?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: "You can include artwork, school projects, sports achievements, academic milestones, creative writing, photos, videos, and any other accomplishments that showcase your child's growth and development.",
            },
          },
          {
            '@type': 'Question',
            name: 'Can I share the portfolio with family and friends?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! Kifolio portfolios are fully responsive and can be shared with anyone. You can control privacy settings and choose whether to make portfolios public or password-protected.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I get started?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Getting started is simple! Visit the onboarding page to create a free account, choose a template, add your child's information, and start documenting milestones and achievements in minutes.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <MarketingNav />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="pt-7 pb-0 px-9 bg-discovery-beige-200">
          <div className={`max-w-7xl mx-auto ${heroAnimation.className}`}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:gap-8">
              {/* Left Column - Content */}
              <div className="text-left pb-20 lg:flex-1 lg:max-w-2xl">
                <h1 className="text-5xl lg:text-7xl font-semibold text-discovery-black mb-6">
                The free digital portfolio for your child's milestones & achievements.
                </h1>
                <p className="text-lg text-discovery-grey mb-8 leading-relaxed">
                  Build beautiful portfolios for your children or students that showcase their work, 
                  milestones, and achievements. Whether it&apos;s artwork, school projects, 
                  sports accomplishments, or personal growth, Kifolio has you covered. 
                  Simple, responsive, and totally free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Link
                    href="/onboarding"
                    className="inline-block bg-discovery-orange text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-orange-light text-center">
                    Get started for free
                  </Link>
                </div>
                <p className="text-discovery-orange text-md font-medium">Create a portfolio in minutes.</p>
              </div>
              
              {/* Right Column - Image */}
              <div className="flex justify-center lg:justify-end lg:flex-1 lg:-ml-16">
                <div className="max-w-6xl w-full">
                  <Image
                    src="/marketing/hero-img.png"
                    alt="Digital portfolio for kids and students: phone and tablet mockup showing a child’s milestones, artwork, and achievements in Kifolio"
                    width={1200}
                    height={928}
                    priority
                    sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 55vw, 840px"
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
          id="features"
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
            <div className="grid md:grid-cols-2 gap-12 justify-items-center">
              <div className={`text-center ${featureCards.getItemClassName(0)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <Image
                    src="/marketing/academic-transitions.png"
                    alt="Illustration: student digital portfolio supporting academic transitions and school applications"
                    width={200}
                    height={200}
                    loading="lazy"
                    sizes="200px"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Academic transitions</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                  Provide a polished portfolio that complements transcripts and test scores—helping admissions teams see the full story behind the student.
                </p>
              </div>

              <div className={`text-center ${featureCards.getItemClassName(0)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <Image
                    src="/marketing/athletic-dev.png"
                    alt="Illustration: tracking sports achievements and athletic development in a child’s digital portfolio"
                    width={200}
                    height={200}
                    loading="lazy"
                    sizes="200px"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Athletic development</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                Document achievements such as belt promotions, new skills, and training successes to provide a fuller view of the student&apos;s growth.
                </p>
              </div>
              
              <div className={`text-center ${featureCards.getItemClassName(1)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <Image
                    src="/marketing/scholarships-awards.png"
                    alt="Illustration: scholarships and awards documented in a student portfolio for applications"
                    width={200}
                    height={200}
                    loading="lazy"
                    sizes="200px"
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
                  <Image
                    src="/marketing/community.png"
                    alt="Illustration: community service and leadership highlights in a digital portfolio for students"
                    width={200}
                    height={200}
                    loading="lazy"
                    sizes="200px"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Community service & leadership</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                Highlight volunteer work, leadership roles, service hours, and impact projects—building a complete picture of character and contribution.
                </p>
              </div>

              <div className={`text-center ${featureCards.getItemClassName(3)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <Image
                    src="/marketing/competitions.png"
                    alt="Illustration: competitions, science fairs, and student achievements organized in one portfolio"
                    width={200}
                    height={200}
                    loading="lazy"
                    sizes="200px"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-4xl lg:text-4xl font-medium text-discovery-white-100 mb-3">Competitions & achievements</h3>
                <p className="text-discovery-white-80 leading-relaxed">
                Track awards from science fairs, robotics tournaments, debate teams, coding challenges, art contests, and more in one organized place.
                </p>
              </div>

              <div className={`text-center ${featureCards.getItemClassName(3)}`}>
                <div className="mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                  <Image
                    src="/marketing/growth-tracking.png"
                    alt="Illustration: personal growth and confidence tracked over time in a child’s digital portfolio"
                    width={200}
                    height={200}
                    loading="lazy"
                    sizes="200px"
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
          id="how-it-works"
          ref={howItWorksSection.ref}
          className={`py-20 px-4 bg-discovery-orange ${howItWorksSection.className}`}
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl lg:text-5xl font-medium text-discovery-yellow mb-12">
              How it works
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-discovery-yellow rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">1</span>
                </div>
                <h3 className="text-4xl lg:text-3xl font-medium text-discovery-yellow mb-2 leading-tight">
                  Create your child's portfolio
                </h3>
                <p className="text-discovery-white-100 leading-relaxed">
                  Start by setting up a dedicated space for your child or children. Add their name, photo, and a few details to make it their own.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-discovery-yellow rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">2</span>
                </div>
                <h3 className="text-4xl lg:text-3xl font-medium text-discovery-yellow mb-2 leading-tight">
                  Add their first highlight
                </h3>
                <p className="text-discovery-white-100 leading-relaxed">
                  Capture a special moment — an award, artwork, report card, or milestone — with a title, description, and photo.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-discovery-yellow rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">3</span>
                </div>
                <h3 className="text-4xl lg:text-3xl font-medium text-discovery-yellow mb-2 leading-tight">
                  Build their story over time
                </h3>
                <p className="text-discovery-white-100 leading-relaxed">
                  Keep adding highlights as they grow. From small wins to big achievements, Kifolio helps you preserve it all in one place.
                </p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-discovery-yellow rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">4</span>
                </div>
                <h3 className="text-4xl lg:text-3xl font-medium text-discovery-yellow mb-2 leading-tight">
                  Request for endorsements
                </h3>
                <p className="text-discovery-white-100 leading-relaxed">
                  Invite instructors, teachers, coaches, or mentors to add a comment to a specific achievement—adding trusted recognition and context to your child's milestones.
                </p>
              </div>

              {/* Step 5 */}
              <div className="text-center">
                <div className="mx-auto mb-6 w-16 h-16 bg-discovery-yellow rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-discovery-primary">5</span>
                </div>
                <h3 className="text-4xl lg:text-3xl font-medium text-discovery-yellow mb-2 leading-tight">
                  Share it out
                </h3>
                <p className="text-discovery-white-100 leading-relaxed">
                  Export a polished record for transcripts, résumés, college and scholarship applications — or simply as a keepsake of their journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section
          id="why-kifolio"
          ref={benefitsSection.ref}
          className={`py-20 px-4 relative bg-discovery-blue-100 ${benefitsSection.className}`}
          aria-labelledby="benefits-heading"
        >
          <div className="text-5xl lg:text-5xl text-center relative z-10">
            <h2 id="benefits-heading" className="text-5xl lg:text-5xl sm:text-center lg:text-center font-medium text-discovery-black mb-12">
              Why parents choose Kifolio
            </h2>

            <div className="grid md:grid-cols-2 gap-8 md:gap-8">
              {/* Left Column - Child Photo */}
              <div className="flex items-center justify-center">
                <div className="w-[360px] h-[480px] overflow-hidden">
                  <Image
                    src="/marketing/child-photo-why.jpg"
                    alt="Smiling child with headphones — parents use Kifolio to build a digital portfolio of their child’s milestones and achievements"
                    width={360}
                    height={480}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Right Column - All Checked Items */}
              <div className="space-y-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Simple templates that grow with your child</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Organize achievements by date, category, or milestone</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Share with family and friends on any device</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Request for endorsements from verified teachers/instructors</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Privacy controls to keep portfolios secure</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Track progress over time with visual timelines</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Add photos, videos, and documents easily</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Export and print for physical keepsakes (coming soon)</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-discovery-yellow rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-discovery-black" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg text-discovery-grey leading-relaxed">Perfect for school applications and memories</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          id="testimonials"
          ref={testimonialsSection.ref}
          className={`py-20 px-4 bg-discovery-beige-200 ${testimonialsSection.className}`} 
          aria-labelledby="testimonials-heading"
        >
          <div className="max-w-6xl mx-auto">
            <h2 id="testimonials-heading" className="text-5xl lg:text-5xl sm:text-center lg:text-center font-medium text-discovery-black mb-12">
              What parents are saying
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 bg-discovery-orange rounded-full flex items-center justify-center mr-4"
                    role="img"
                    aria-label="Kelli W., parent of a 4-year-old, testimonial for Kifolio digital portfolios for kids"
                  >
                    <span className="text-2xl lg:text-2xl font-medium text-discovery-white-100" aria-hidden="true">
                      K
                    </span>
                  </div>
                  <div>
                    <h4 className="text-3xl lg:text-2xl font-medium text-discovery-orange">Kelli W.</h4>
                    <p className="text-discovery-gray-400 leading-relaxed">Parent of a 4-year-old</p>
                  </div>
                </div>
                <p className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  &ldquo;Kifolio has made it so easy to document Emma&apos;s artistic journey. Her grandparents love being able to see her progress, and it&apos;s become a beautiful digital keepsake.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 bg-discovery-orange rounded-full flex items-center justify-center mr-4"
                    role="img"
                    aria-label="Sarah M., parent of a 10-year-old, testimonial for Kifolio student portfolios"
                  >
                    <span className="text-2xl lg:text-2xl font-medium text-discovery-white-100" aria-hidden="true">
                      S
                    </span>
                  </div>
                  <div>
                    <h4 className="text-3xl lg:text-2xl font-medium text-discovery-orange">Sarah M.</h4>
                    <p className="text-discovery-gray-400 leading-relaxed">Parent of a 10-year-old</p>
                  </div>
                </div>
                <p className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  &ldquo;I used to keep boxes of my son's artwork and certificates, but it always felt messy and incomplete.
                  With Kifolio, we finally have one beautiful place to look back at everything he's accomplished. He loves scrolling through his own progress—it makes him so proud.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 bg-discovery-orange rounded-full flex items-center justify-center mr-4"
                    role="img"
                    aria-label="Robert K., parent of a 16-year-old, testimonial for Kifolio digital portfolios"
                  >
                    <span className="text-2xl lg:text-2xl font-medium text-discovery-white-100" aria-hidden="true">
                      R
                    </span>
                  </div>
                  <div>
                    <h4 className="text-3xl lg:text-2xl font-medium text-discovery-orange">Robert K.</h4>
                    <p className="text-discovery-gray-400 leading-relaxed">Parent of a 16-year-old</p>
                  </div>
                </div>
                <p className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  &ldquo;I started using Kifolio just to keep track of grades and awards, but it’s become so much more. Seeing my daughter’s journey laid out—her creativity,
                  her growth—it's something I'll cherish forever, and I know it will help her when she applies to college.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 bg-discovery-orange rounded-full flex items-center justify-center mr-4"
                    role="img"
                    aria-label="Steven K., parent of an 8-year-old, testimonial for Kifolio sports and student highlights"
                  >
                    <span className="text-2xl lg:text-2xl font-medium text-discovery-white-100" aria-hidden="true">
                      S
                    </span>
                  </div>
                  <div>
                    <h4 className="text-3xl lg:text-2xl font-medium text-discovery-orange">Steven K.</h4>
                    <p className="text-discovery-gray-400 leading-relaxed">Parent of an 8-year-old</p>
                  </div>
                </div>
                <p className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  &ldquo;My daughter plays club volleyball and it feels like there’s always another tryout or skills evaluation. Kifolio helped us capture her highlights, stats, and videos so we could easily share them with coaches. It gave her a confidence boost—and honestly made the whole process less stressful for us as parents.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 bg-discovery-orange rounded-full flex items-center justify-center mr-4"
                    role="img"
                    aria-label="Cassandra G., parent of a 13-year-old, testimonial for Kifolio milestone tracking"
                  >
                    <span className="text-2xl lg:text-2xl font-medium text-discovery-white-100" aria-hidden="true">
                      C
                    </span>
                  </div>
                  <div>
                    <h4 className="text-3xl lg:text-2xl font-medium text-discovery-orange">Cassandra G.</h4>
                    <p className="text-discovery-gray-400 leading-relaxed">Parent of a 13-year-old</p>
                  </div>
                </div>
                <p className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  &ldquo;My daughter is in martial arts, and keeping track of her belt progress was always scattered between photos on my phone and notes from her coaches. Kifolio has given us a clean timeline of every test, stripe, and achievement. Seeing her growth laid out like that has made her so proud—and honestly, more motivated than ever.&rdquo;
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 bg-discovery-orange rounded-full flex items-center justify-center mr-4"
                    role="img"
                    aria-label="Daniel R., parent of a 15-year-old, testimonial for Kifolio portfolios for applications"
                  >
                    <span className="text-2xl lg:text-2xl font-medium text-discovery-white-100" aria-hidden="true">
                      D
                    </span>
                  </div>
                  <div>
                    <h4 className="text-3xl lg:text-2xl font-medium text-discovery-orange">Daniel R.</h4>
                    <p className="text-discovery-gray-400 leading-relaxed">Parent of a 15-year-old</p>
                  </div>
                </div>
                <p className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  &ldquo;When my daughter started applying for summer programs, that was when we realized how valuable her Kifolio was.
                  We could easily share her projects, awards, and activities in a polished way. It showed more than grades—it told her story.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for Featured Snippets */}
        <section 
          id="faq"
          ref={faqSection.ref}
          className={`py-20 px-4 bg-discovery-yellow ${faqSection.className}`} 
          aria-labelledby="faq-heading"
        >
          <div className="max-w-4xl mx-auto">
            <h2 id="faq-heading" className="text-5xl lg:text-5xl sm:text-center lg:text-center font-medium text-discovery-black mb-12">
              Frequently asked questions
            </h2>
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  How much does Kifolio cost?
                </h3>
                <div className="text-lg text-discovery-grey leading-relaxed">
                  Kifolio is completely free! Parents have access to all features and can create unlimited portfolios and highlights for their children.
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  What can I include in my child&apos;s portfolio?
                </h3>
                <div className="text-lg text-discovery-grey leading-relaxed">
                  You can include artwork, school projects, sports achievements, academic milestones, creative writing, photos, videos, and any other accomplishments that showcase your child&apos;s growth and development.
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  Can I share the portfolio with family and friends?
                </h3>
                <div className="text-lg text-discovery-grey leading-relaxed">
                  Yes! Kifolio portfolios are fully responsive and can be shared with anyone. You can control privacy settings and choose whether to make portfolios public or password-protected.
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl lg:text-2xl font-medium text-discovery-black mb-2 leading-tight">
                  How do I get started?
                </h3>
                <div className="text-lg text-discovery-grey leading-relaxed">
                  Getting started is simple!{' '}
                  <Link href="/onboarding" className="text-discovery-primary hover:underline">
                    Start building your portfolio
                  </Link>
                  , then create a free account. You can choose a template, add your child&apos;s information, and start documenting their milestones and achievements in minutes.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-discovery-black text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Image
                src="/kifolio_logo.svg"
                alt="Kifolio — digital portfolio platform for children and students"
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
                <li><Link href="/onboarding" className="hover:text-discovery-white-80 transition-colors">Sign Up</Link></li>
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
            <p>&copy; 2026 Kifolio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
