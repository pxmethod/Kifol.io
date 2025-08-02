'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import EditPortfolioModal from '@/components/EditPortfolioModal';
import AchievementModal from '@/components/AchievementModal';
import AchievementDetailModal from '@/components/AchievementDetailModal';
import AchievementsTimeline from '@/components/AchievementsTimeline';
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

export default function PortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showPublishNotification, setShowPublishNotification] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showAchievementDetailModal, setShowAchievementDetailModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

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

  const handleSaveAchievement = (achievement: Achievement) => {
    if (!portfolio) return;

    const updatedPortfolio = { ...portfolio };
    const existingAchievements = updatedPortfolio.achievements || [];
    
    if (editingAchievement) {
      // Update existing achievement
      const achievementIndex = existingAchievements.findIndex(a => a.id === achievement.id);
      if (achievementIndex !== -1) {
        existingAchievements[achievementIndex] = achievement;
      }
    } else {
      // Add new achievement
      existingAchievements.push(achievement);
    }
    
    updatedPortfolio.achievements = existingAchievements;
    updatedPortfolio.hasUnsavedChanges = true;
    
    handleSavePortfolio(updatedPortfolio);
    setEditingAchievement(null);
  };

  const handleDeleteAchievement = (achievementId: string) => {
    if (!portfolio) return;

    const updatedPortfolio = { ...portfolio };
    const existingAchievements = updatedPortfolio.achievements || [];
    
    // Remove the achievement
    const filteredAchievements = existingAchievements.filter(a => a.id !== achievementId);
    
    updatedPortfolio.achievements = filteredAchievements;
    updatedPortfolio.hasUnsavedChanges = true;
    
    handleSavePortfolio(updatedPortfolio);
    setEditingAchievement(null);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowAchievementModal(true);
  };

  const handleViewAchievement = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementDetailModal(true);
  };

  const handleAddAchievement = () => {
    setEditingAchievement(null);
    setShowAchievementModal(true);
  };

  const handlePreview = () => {
    if (portfolio) {
      window.open(`/preview/${portfolio.id}`, '_blank');
    }
  };

  const handlePublish = () => {
    if (portfolio) {
      // Mark portfolio as published (no unsaved changes)
      const updatedPortfolio = { ...portfolio, hasUnsavedChanges: false };
      handleSavePortfolio(updatedPortfolio);
      
      // Show success notification
      setShowPublishNotification(true);
      setTimeout(() => setShowPublishNotification(false), 3000);
    }
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
      
      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-kifolio-text transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreview}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Preview
            </button>
            <button
              onClick={handlePublish}
              disabled={!portfolio.hasUnsavedChanges}
              className="px-4 py-2 bg-kifolio-cta text-white rounded-lg hover:bg-kifolio-cta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

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

          {/* Portfolio Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-kifolio-text">Achievements</h2>
                <p className="text-gray-600 text-sm">
                  Track {portfolio.childName}&apos;s growth and accomplishments
                </p>
              </div>
              <button
                onClick={handleAddAchievement}
                className="bg-kifolio-cta text-white px-4 py-2 rounded-lg font-semibold hover:bg-kifolio-cta/90 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Achievement</span>
              </button>
            </div>

            {/* Achievements Timeline */}
            <AchievementsTimeline
              achievements={portfolio.achievements || []}
              onView={handleViewAchievement}
            />
          </div>
        </div>
      </main>

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          URL copied to clipboard!
        </div>
      )}

      {/* Publish Notification */}
      {showPublishNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Portfolio successfully published!
        </div>
      )}

      {/* Edit Portfolio Modal */}
      <EditPortfolioModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSavePortfolio}
        portfolio={portfolio}
      />

      {/* Achievement Modal */}
      <AchievementModal
        key={editingAchievement?.id || 'new-achievement'}
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false);
          setEditingAchievement(null);
        }}
        onSave={handleSaveAchievement}
        onDelete={handleDeleteAchievement}
        achievement={editingAchievement}
      />

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        isOpen={showAchievementDetailModal}
        onClose={() => {
          setShowAchievementDetailModal(false);
          setSelectedAchievement(null);
        }}
        onEdit={(achievement) => {
          setEditingAchievement(achievement);
          setShowAchievementDetailModal(false);
          setShowAchievementModal(true);
        }}
        achievement={selectedAchievement}
      />
    </div>
  );
} 