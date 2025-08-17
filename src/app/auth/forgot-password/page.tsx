'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-kifolio-bg">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center">
          <Image 
            src="/kifolio_logo.svg" 
            alt="Kifolio Logo" 
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kifolio-text mb-4">Forgot Password</h1>
          <p className="text-gray-600 mb-6">Password reset functionality coming soon...</p>
          <div className="space-y-4">
            <Link 
              href="/auth/signup" 
              className="text-primary hover:underline font-medium block"
            >
              Back to Sign Up
            </Link>
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-800 font-medium block"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
