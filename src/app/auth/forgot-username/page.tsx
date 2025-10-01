'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotUsernamePage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      // For now, we'll show a helpful message since username recovery
      // would require additional backend functionality
      setMessage('Your username is typically the part before @ in your email address. If you\'re still having trouble, please contact support.');
      setEmail('');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      {/* Header */}
      <header className="bg-discovery-beige-200 text-white px-9 py-4 top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link href="/auth/login" className="flex items-center">
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
        </div>
      </header>

      {/* Main Content */}
      <div className="flex justify-center min-h-screen pt-24 pb-10">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl lg:text-5xl font-medium text-discovery-black mb-6">
              Forgot Username
            </h1>
            <p className="text-lg text-discovery-grey leading-relaxed">
              Enter your email address and we'll help you recover your username.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-discovery-white-100 rounded-lg p-8 shadow-sm">
            {message && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-md font-medium text-discovery-black mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-discovery-beige-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="bg-discovery-primary text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-primary-light text-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Looking up...' : 'Find Username'}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-discovery-beige-300 text-center">
              <Link 
                href="/auth/login" 
                className="text-discovery-orange hover:text-discovery-orange-light font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
