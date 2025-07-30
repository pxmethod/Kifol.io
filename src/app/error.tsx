'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-kifolio-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-kifolio-text mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-kifolio-cta text-white py-3 px-6 rounded-lg font-semibold hover:bg-kifolio-cta/90"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-kifolio-text py-3 px-6 rounded-lg font-semibold hover:bg-gray-200"
          >
            Go to homepage
          </button>
        </div>
      </div>
    </div>
  );
} 