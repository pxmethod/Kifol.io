'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';

interface PortfolioData {
  id: string;
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  createdAt: string;
}

export default function PortfolioPage() {
  const params = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const portfolioId = params.id as string;
    
    // Get portfolio data from local storage
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const foundPortfolio = portfolios.find((p: PortfolioData) => p.id === portfolioId);
    
    if (foundPortfolio) {
      setPortfolio(foundPortfolio);
    }
    
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kifolio-cta mx-auto"></div>
            <p className="mt-4 text-kifolio-text">Loading portfolio...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-kifolio-text mb-4">Portfolio Not Found</h1>
            <p className="text-kifolio-text">The portfolio you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Portfolio Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-6">
              {/* Child Photo */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-kifolio-cta to-kifolio-header flex items-center justify-center">
                {portfolio.photoUrl ? (
                  <img 
                    src={portfolio.photoUrl} 
                    alt={portfolio.childName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {portfolio.childName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Portfolio Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-kifolio-text mb-2">
                  {portfolio.childName}
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  {portfolio.portfolioTitle}
                </p>
                <p className="text-sm text-gray-500">
                  Template: {portfolio.template.charAt(0).toUpperCase() + portfolio.template.slice(1)}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(portfolio.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Portfolio URL */}
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Portfolio URL:</p>
                <p className="text-sm font-mono text-kifolio-cta">
                  my.kifol.io/{portfolio.id}
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio Content - Empty State */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-kifolio-text mb-4">
                Start Building {portfolio.childName}&apos;s Portfolio
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Add achievements, milestones, photos, and more to showcase {portfolio.childName}&apos;s growth and accomplishments.
              </p>
              
              <div className="space-y-4">
                <button className="w-full max-w-xs bg-kifolio-cta text-white py-3 px-6 rounded-lg font-semibold hover:bg-kifolio-cta/90">
                  Add First Achievement
                </button>
                <button className="w-full max-w-xs bg-gray-100 text-kifolio-text py-3 px-6 rounded-lg font-semibold hover:bg-gray-200">
                  Upload Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 