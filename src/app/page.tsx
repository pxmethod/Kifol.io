'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import PortfolioCard from '@/components/PortfolioCard';
import EditPortfolioModal from '@/components/EditPortfolioModal';
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
    savePortfolio, 
    deletePortfolio: removePortfolio 
  } = usePortfolios();
  
  const [editingPortfolio, setEditingPortfolio] = useState<LegacyPortfolioData | null>(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState<LegacyPortfolioData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set());

  // Redirect unauthenticated users to welcome page
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/welcome');
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
    return null; // Will redirect to /welcome
  }

  const handleEditPortfolio = (portfolio: LegacyPortfolioData) => {
    setEditingPortfolio(portfolio);
    setShowEditModal(true);
  };

  const handleRemovePortfolio = (portfolio: LegacyPortfolioData) => {
    setDeletingPortfolio(portfolio);
    setShowDeleteModal(true);
  };

  const handleSavePortfolio = async (updatedPortfolio: LegacyPortfolioData) => {
    try {
      await savePortfolio(updatedPortfolio);
      setShowEditModal(false);
      setEditingPortfolio(null);
      setToastMessage('Portfolio updated successfully!');
      setShowToast(true);
    } catch (err) {
      setToastMessage('Failed to update portfolio');
      setShowToast(true);
    }
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

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingPortfolio(null);
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header animateLogo={true} />
        <main className="container mx-auto px-4 py-8">
          <ErrorDisplay
            title="Unable to Load Portfolios"
            message={`We're having trouble loading your portfolios. ${error}`}
            type="error"
            showRetry={true}
            onRetry={() => window.location.reload()}
            className="min-h-[50vh]"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header animateLogo={true} />
      <main className="container mx-auto px-4 py-8 main-content">
        {portfolios.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8 portfolio-grid-container">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-kifolio-text">
                  My Portfolios
                </h1>
                <p className="text-md text-gray-600">
                  Support and manage your child&apos;s portfolio
                </p>
              </div>
              {user && (
                <button
                  onClick={() => router.push('/create')}
                  className="btn btn--primary"
                >
                  Create New Portfolio
                </button>
              )}
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onEdit={handleEditPortfolio}
                  onRemove={handleRemovePortfolio}
                  isAnimated={animatedCards.has(portfolio.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Portfolio Modal */}
      {editingPortfolio && (
        <EditPortfolioModal
          portfolio={editingPortfolio}
          isOpen={showEditModal}
          onSave={handleSavePortfolio}
          onClose={() => {
            setShowEditModal(false);
            setEditingPortfolio(null);
          }}
        />
      )}

      {/* Delete Portfolio Modal */}
      <DeletePortfolioModal
        isOpen={showDeleteModal}
        portfolio={deletingPortfolio}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        variant="success"
        isVisible={showToast}
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
}
