'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  if (!isOpen) return null;

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
      price: isAnnual ? '$81.00' : '$8.99',
      period: isAnnual ? 'annually' : 'per month',
      originalPrice: isAnnual ? '$108.00' : null,
      description: 'For families with multiple children',
      features: [
        'Unlimited children',
        'Unlimited highlights',
        'Extra storage (videos, PDFs, audio)',
        'Advanced organization (tags, categories, filters)',
        'Export/share features (PDF generation)',
        'Priority support',
        '14-day free trial',
        'Cancel anytime'
      ],
      cta: 'Start free 14-day trial'
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
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

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pricing.free.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{pricing.free.price}</span>
                  <span className="text-gray-600 ml-2">/{pricing.free.period}</span>
                </div>
                <p className="text-gray-600">{pricing.free.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {pricing.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Limitations:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {pricing.free.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Current Plan
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6 relative">
              <div className="absolute top-4 right-4">
                <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pricing.premium.name}</h3>
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{pricing.premium.price}</span>
                    <span className="text-gray-600 ml-2">/{pricing.premium.period}</span>
                  </div>
                  {pricing.premium.originalPrice && (
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="line-through">{pricing.premium.originalPrice}</span>
                      <span className="ml-2 text-green-600 font-semibold">Save 25%</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{pricing.premium.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {pricing.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <Link
                  href="/auth/signup?plan=premium"
                  className="w-full bg-kifolio-primary text-white hover:bg-orange-600 px-6 py-3 rounded-lg text-lg font-semibold transition-colors text-center block"
                >
                  {pricing.premium.cta}
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  No credit-card required to start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
