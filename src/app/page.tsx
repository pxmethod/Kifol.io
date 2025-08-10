'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import PortfolioGrid from '@/components/PortfolioGrid';
import EditPortfolioModal from '@/components/EditPortfolioModal';
import DeletePortfolioModal from '@/components/DeletePortfolioModal';
import Toast from '@/components/Toast';
import { Achievement } from '@/types/achievement';

interface PortfolioData {
  id: string;
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  createdAt: string;
  isPrivate?: boolean;
  password?: string;
  hasUnsavedChanges?: boolean;
  achievements?: Achievement[];
}

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioData | null>(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState<PortfolioData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Load portfolios from local storage
    const storedPortfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    setPortfolios(storedPortfolios);
    setLoading(false);
  }, []);

  const handleEditPortfolio = (portfolio: PortfolioData) => {
    setEditingPortfolio(portfolio);
    setShowEditModal(true);
  };

  const handleRemovePortfolio = (portfolio: PortfolioData) => {
    setDeletingPortfolio(portfolio);
    setShowDeleteModal(true);
  };

  const handleSavePortfolio = (updatedPortfolio: PortfolioData) => {
    // Update local storage
    const updatedPortfolios = portfolios.map(p => 
      p.id === updatedPortfolio.id ? updatedPortfolio : p
    );
    localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
    
    // Update state
    setPortfolios(updatedPortfolios);
    setShowEditModal(false);
    setEditingPortfolio(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingPortfolio) return;

    // Remove from local storage
    const updatedPortfolios = portfolios.filter(p => p.id !== deletingPortfolio.id);
    localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
    
    // Update state
    setPortfolios(updatedPortfolios);
    setShowDeleteModal(false);
    setDeletingPortfolio(null);
    
    // Show success toast for portfolio removal
    setToastMessage('Portfolio removed successfully!');
    setShowToast(true);
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
            <div className="text-kifolio-text">Loading...</div>
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
