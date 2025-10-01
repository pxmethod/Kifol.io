'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid password reset session
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Password updated successfully! You can now log in with your new password.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidSession && !error) {
    return (
      <div className="min-h-screen bg-discovery-beige-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discovery-primary mx-auto mb-4"></div>
          <p className="text-discovery-grey">Verifying reset link...</p>
        </div>
      </div>
    );
  }

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
              Reset Password
            </h1>
            <p className="text-lg text-discovery-grey leading-relaxed">
              Enter your new password below.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-discovery-white-100 rounded-lg p-8 shadow-sm">
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="password" className="block text-md font-medium text-discovery-black mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-discovery-beige-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black"
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-md font-medium text-discovery-black mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-discovery-beige-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black"
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !password.trim() || !confirmPassword.trim()}
                className="bg-discovery-primary text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-primary-light text-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-discovery-beige-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discovery-primary mx-auto mb-4"></div>
          <p className="text-discovery-grey">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
