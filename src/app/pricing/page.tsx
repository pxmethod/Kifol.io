'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFadeUp } from '@/hooks/useScrollAnimation';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Animation hooks
  const heroSection = useFadeUp({ threshold: 0.1 });
  const pricingSection = useFadeUp({ threshold: 0.2 });
  const featuresSection = useFadeUp({ threshold: 0.3 });
  const ctaSection = useFadeUp({ threshold: 0.4 });

  const pricing = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '1 child portfolio',
        'Up to 10 highlights',
        'Basic templates',
        'Photo storage (up to 50MB per photo)',
        'Public portfolio sharing',
        'Email support'
      ],
      limitations: [
        'Limited to 1 child',
        '10 highlights maximum',
        'Basic organization only'
      ]
    },
    premium: {
      name: 'Premium',
      price: isAnnual ? '$8.99' : '$9.99',
      period: isAnnual ? 'per month' : 'per month',
      originalPrice: isAnnual ? '$11.99' : null,
      description: 'For families with multiple children',
      features: [
        'Unlimited children',
        'Unlimited highlights',
        'All premium templates',
        'Extra storage (videos, PDFs, audio)',
        'Advanced organization (tags, categories, filters)',
        'Export/share features (PDF generation)',
        'Priority support',
        '7-day free trial'
      ],
      cta: 'Start free trial',
      popular: true
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Global Header */}
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

      {/* Hero Section */}
      <div className="bg-kifolio-header">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center text-white">
            <h1 
              ref={heroSection.ref as any}
              className={`text-4xl md:text-6xl font-bold mb-6 ${heroSection.className}`}
            >
              Simple, transparent pricing
            </h1>
            <p 
              className={`text-xl md:text-2xl mb-8 opacity-90 ${heroSection.className}`}
            >
              Choose the plan that works best for your family
            </p>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual (25% discount)
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section 
        ref={pricingSection.ref as any}
        className={`py-20 px-4 ${pricingSection.className}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-kifolio-text mb-2">
                  {pricing.free.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-kifolio-text">
                    {pricing.free.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {pricing.free.period}
                  </span>
                </div>
                <p className="text-gray-600">
                  {pricing.free.description}
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {pricing.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth/signup"
                className="w-full bg-kifolio-primary text-white hover:bg-orange-600 px-6 py-3 rounded-lg text-lg font-semibold transition-colors text-center block"
              >
                Get started free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-500 relative">
              {pricing.premium.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-kifolio-text mb-2">
                  {pricing.premium.name}
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-4xl font-bold text-kifolio-text">
                      {pricing.premium.price}
                    </span>
                    {pricing.premium.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {pricing.premium.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-600 ml-2">
                    {pricing.premium.period}
                  </span>
                </div>
                <p className="text-gray-600">
                  {pricing.premium.description}
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {pricing.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/auth/signup?plan=premium"
                className="w-full bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 rounded-lg text-lg font-semibold transition-colors text-center block"
              >
                {pricing.premium.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
        <section 
          ref={featuresSection.ref as any}
          className={`py-20 px-4 bg-gray-50 ${featuresSection.className}`}
        >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-kifolio-text mb-4">
              Compare plans
            </h2>
            <p className="text-xl text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Features
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Free
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-orange-600">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Number of children
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      1
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Unlimited
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Highlights per child
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Up to 10
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Templates
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Basic
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      All premium
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Storage
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Photos only (50MB each)
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Photos, videos, PDFs, audio
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Organization
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Basic timeline
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Tags, categories, filters
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Export/Share
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Public sharing only
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      PDF generation, advanced sharing
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      Support
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Email support
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Priority support
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
        <section 
          ref={ctaSection.ref as any}
          className={`py-20 px-4 bg-kifolio-bg ${ctaSection.className}`}
        >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-kifolio-text mb-4">
              Frequently asked questions
            </h2>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-kifolio-text mb-3">
                Can I switch between plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-kifolio-text mb-3">
                What happens to my data if I cancel?
              </h3>
              <p className="text-gray-600">
                Your data is always yours. If you cancel, you can export your portfolios and continue using the free plan with limited features.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-kifolio-text mb-3">
                Is there a free trial for Premium?
              </h3>
              <p className="text-gray-600">
                Yes! Premium comes with a 7-day free trial. No credit card required to start, and you can cancel anytime during the trial.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-kifolio-text mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners.
              </p>
            </div>
          </div>
        </div>
      </section>

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
