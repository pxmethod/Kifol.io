'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import PortfolioCard from '@/components/PortfolioCard';
import DeletePortfolioModal from '@/components/DeletePortfolioModal';
import Toast from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { usePortfolios } from '@/hooks/usePortfolios';
import { useAuth } from '@/contexts/AuthContext';
import { LegacyPortfolioData } from '@/lib/adapters/portfolio';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    portfolios, 
    loading, 
    error, 
    deletePortfolio: removePortfolio 
  } = usePortfolios();
  
  const [deletingPortfolio, setDeletingPortfolio] = useState<LegacyPortfolioData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // Redirect unauthenticated users to marketing site
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  // Show welcome page for unauthenticated users
  if (!user) {
    return null; // Will redirect to marketing site
  }

  // Show loading while portfolios are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading portfolios..." />
          </div>
        </main>
      </div>
    );
  }

  const handleEditPortfolio = (portfolio: LegacyPortfolioData) => {
    router.push(`/portfolio/${portfolio.id}`);
  };

  const handleRemovePortfolio = (portfolio: LegacyPortfolioData) => {
    setDeletingPortfolio(portfolio);
    setShowDeleteModal(true);
  };


  const handleConfirmDelete = async () => {
    if (!deletingPortfolio) return;
    
    try {
      await removePortfolio(deletingPortfolio.id);
      setShowDeleteModal(false);
      setDeletingPortfolio(null);
      setToastMessage('Portfolio removed successfully!');
      setShowToast(true);
    } catch (err) {
      setToastMessage('Failed to remove portfolio');
      setShowToast(true);
    }
  };

  const handleDismissToast = () => {
    setShowToast(false);
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
                  <ErrorDisplay 
          title="Unable to Load Portfolios"
          message={error} 
          showRetry={true}
          onRetry={() => window.location.reload()} 
        />
        </main>
      </div>
    );
  }

  // Show empty state if no portfolios
  if (!loading && portfolios.length === 0) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <EmptyState />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <Header animateLogo={true} />
      
      <main className="max-w-7xl mx-auto px-9 py-12">
        <div className="space-y-8 portfolio-grid-container">
          {/* Header with Create Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in">
            <div>
              <h1 className="text-4xl lg:text-4xl font-medium text-discovery-black mb-2">
                My Portfolios
              </h1>
            </div>
            {user && (
              <button
                onClick={() => router.push('/create')}
                className="bg-discovery-orange text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-orange-light whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create new portfolio
              </button>
            )}
          </div>

          
          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => {
              return (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onEdit={handleEditPortfolio}
                  onRemove={handleRemovePortfolio}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Delete Portfolio Modal */}
      {showDeleteModal && deletingPortfolio && (
        <DeletePortfolioModal
          portfolio={deletingPortfolio}
          isOpen={showDeleteModal}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletingPortfolio(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          variant="success"
          isVisible={showToast}
          onDismiss={handleDismissToast}
        />
      )}
    </div>
  );
}
