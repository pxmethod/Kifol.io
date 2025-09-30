'use client';

import { useState } from 'react';
import { portfolioAccessService } from '@/lib/services/portfolio-access';

interface PortfolioPasswordPromptProps {
  portfolioId: string;
  portfolioTitle: string;
  onPasswordVerified: () => void;
  onCancel: () => void;
}

export default function PortfolioPasswordPrompt({
  portfolioId,
  portfolioTitle,
  onPasswordVerified,
  onCancel
}: PortfolioPasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await portfolioAccessService.verifyPassword(portfolioId, password);
      
      if (isValid) {
        onPasswordVerified();
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (error) {
      setError('Failed to verify password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-discovery-beige-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-discovery-white-100 rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-discovery-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-medium text-discovery-black mb-2">Private Portfolio</h1>
          <p className="text-lg text-discovery-grey leading-relaxed">
            This portfolio is password protected
          </p>
          <p className="text-sm text-discovery-grey mt-2">
            {portfolioTitle}
          </p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-md font-medium text-discovery-black mb-2">
              Enter Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-discovery-beige-300 rounded-lg focus:ring-2 focus:ring-discovery-primary focus:border-transparent transition-colors text-discovery-black"
              placeholder="Enter portfolio password"
              autoComplete="current-password"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-discovery-beige-300 text-discovery-black rounded-lg hover:bg-discovery-beige-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="flex-1 px-8 py-4 bg-discovery-primary text-white rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Access Portfolio'
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-discovery-grey">
            Contact the portfolio owner if you need the password
          </p>
        </div>
      </div>
    </div>
  );
}
