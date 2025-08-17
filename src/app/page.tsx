'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import PortfolioGrid from '@/components/PortfolioGrid';
import EditPortfolioModal from '@/components/EditPortfolioModal';
import DeletePortfolioModal from '@/components/DeletePortfolioModal';
import Toast from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePortfolios } from '@/hooks/usePortfolios';
import { LegacyPortfolioData } from '@/lib/adapters/portfolio';

export default function Dashboard() {
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-red-500">Error: {error}</div>
          </div>
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
          <PortfolioGrid
            portfolios={portfolios}
            onEdit={handleEditPortfolio}
            onRemove={handleRemovePortfolio}
          />
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
