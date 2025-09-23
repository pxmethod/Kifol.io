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
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set());

  // Redirect unauthenticated users to marketing site
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);


  // Trigger animations when portfolios change
  useEffect(() => {
    if (portfolios.length > 0) {
      // Reset animations first
      setAnimatedCards(new Set());
      
      // Animate each card with a staggered delay
      portfolios.forEach((portfolio, index) => {
        setTimeout(() => {
          setAnimatedCards(prev => new Set(prev).add(portfolio.id));
        }, index * 100); // 100ms delay between each card
      });
    }
  }, [portfolios]);

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
    <div className="min-h-screen bg-kifolio-bg">
      <Header animateLogo={true} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8 portfolio-grid-container">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-kifolio-text">
                My Portfolios
              </h1>
            </div>
            {user && (
              <button
                onClick={() => router.push('/create')}
                className="btn btn--primary"
              >
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
                  isAnimated={animatedCards.has(portfolio.id)}
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
