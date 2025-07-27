'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import EditPortfolioModal from '@/components/EditPortfolioModal';

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
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const copyToClipboard = async () => {
    if (portfolio) {
      const url = `my.kifol.io/${portfolio.id}`;
      try {
        await navigator.clipboard.writeText(url);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 3000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleSavePortfolio = (updatedPortfolio: PortfolioData) => {
    // Update local storage
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const updatedPortfolios = portfolios.map((p: PortfolioData) => 
      p.id === updatedPortfolio.id ? updatedPortfolio : p
    );
    localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
    
    // Update state
    setPortfolio(updatedPortfolio);
  };

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
        <div className="max-w-2xl mx-auto">
          {/* Portfolio Header Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 relative">
            {/* Edit Button */}
            <button 
              onClick={() => setShowEditModal(true)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-kifolio-cta transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Centered Content */}
            <div className="text-center space-y-6">
              {/* Avatar */}
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-kifolio-cta to-kifolio-header flex items-center justify-center">
                {portfolio.photoUrl ? (
                  <img 
                    src={portfolio.photoUrl} 
                    alt={portfolio.childName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {portfolio.childName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Name and Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-kifolio-text">
                  {portfolio.childName}
                </h1>
                <p className="text-xl text-gray-600">
                  {portfolio.portfolioTitle}
                </p>
              </div>

              {/* Portfolio URL with Copy Button */}
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-gray-500">Portfolio URL:</span>
                <span className="text-sm font-mono text-kifolio-cta">
                  my.kifol.io/{portfolio.id}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-gray-400 hover:text-kifolio-cta transition-colors"
                  title="Copy URL"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
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

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          URL copied to clipboard!
        </div>
      )}

      {/* Edit Portfolio Modal */}
      <EditPortfolioModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSavePortfolio}
        portfolio={portfolio}
      />
    </div>
  );
} 