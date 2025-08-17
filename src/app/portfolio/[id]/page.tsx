'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import EditPortfolioModal from '@/components/EditPortfolioModal';
import AchievementModal from '@/components/AchievementModal';
import AchievementDetailModal from '@/components/AchievementDetailModal';
import AchievementsTimeline from '@/components/AchievementsTimeline';
import Toast from '@/components/Toast';
import { Achievement } from '@/types/achievement';
import { useAuth } from '@/contexts/AuthContext';
import { portfolioService, achievementService } from '@/lib/database';

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
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showPublishNotification, setShowPublishNotification] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showAchievementDetailModal, setShowAchievementDetailModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        const portfolioId = params.id as string;
        
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          // Fall back to localStorage if Supabase is not configured
          const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
          const foundPortfolio = portfolios.find((p: PortfolioData) => p.id === portfolioId);
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
          } else {
            setError('Portfolio not found');
          }
          setLoading(false);
          return;
        }

        // Try to get portfolio from database first
        const dbPortfolio = await portfolioService.getPortfolio(portfolioId);
        
        if (dbPortfolio) {
          // Get achievements for this portfolio
          const achievements = await achievementService.getPortfolioAchievements(portfolioId);
          
          // Transform to legacy format
          const portfolioData: PortfolioData = {
            id: dbPortfolio.id,
            childName: dbPortfolio.child_name,
            portfolioTitle: dbPortfolio.portfolio_title,
            photoUrl: dbPortfolio.photo_url || '',
            template: dbPortfolio.template,
            createdAt: dbPortfolio.created_at,
            isPrivate: dbPortfolio.is_private,
            password: dbPortfolio.password || undefined,
            hasUnsavedChanges: false,
            achievements: achievements.map(achievement => ({
              id: achievement.id,
              title: achievement.title,
              date: achievement.date_achieved,
              description: achievement.description || undefined,
              media: achievement.media_urls.map((url, index) => ({
                id: `media-${index}`,
                url,
                type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
                fileName: url.split('/').pop() || 'file',
                fileSize: 0
              })),
              isMilestone: achievement.category === 'milestone',
              createdAt: achievement.created_at,
              updatedAt: achievement.updated_at
            }))
          };
          
          setPortfolio(portfolioData);
        } else {
          // Fall back to localStorage
          const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
          const foundPortfolio = portfolios.find((p: PortfolioData) => p.id === portfolioId);
          
          if (foundPortfolio) {
            setPortfolio(foundPortfolio);
          } else {
            setError('Portfolio not found');
          }
        }
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [params.id]);

  // Check if portfolio was just created
  useEffect(() => {
    const wasCreated = searchParams.get('created') === 'true';
    if (wasCreated) {
      setToastMessage('Portfolio created successfully!');
      setShowToast(true);
      // Remove the query parameter from URL
      router.replace(`/portfolio/${params.id}`);
    }
  }, [searchParams, params.id, router]);

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

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
      // Show success toast for new achievement
      setToastMessage('Achievement added successfully!');
      setShowToast(true);
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
    
    // Show success toast for achievement removal
    setToastMessage('Achievement removed successfully!');
    setShowToast(true);
    
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

  const handleDeletePortfolio = (portfolioId: string) => {
    // Remove from local storage
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const updatedPortfolios = portfolios.filter((p: PortfolioData) => p.id !== portfolioId);
    localStorage.setItem('portfolios', JSON.stringify(updatedPortfolios));
    
    // Show success toast for portfolio removal
    setToastMessage('Portfolio removed successfully!');
    setShowToast(true);
    
    // Redirect to dashboard
    router.push('/');
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

  if (!portfolio || error) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-kifolio-text mb-4">Portfolio Not Found</h1>
            <p className="text-kifolio-text">
              {error || "The portfolio you're looking for doesn't exist."}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 btn btn--primary"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header />
      
      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar__container">
          {/* Mobile: All elements in single row */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <button
              onClick={() => router.push('/')}
              className="btn btn--ghost btn--icon-only"
              title="Back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreview}
                className="btn btn--secondary"
              >
                Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={!portfolio.hasUnsavedChanges}
                className="btn btn--primary"
              >
                Publish
              </button>
            </div>
          </div>
          
          {/* Desktop: Original two-column layout */}
          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="action-bar__left">
              <button
                onClick={() => router.push('/')}
                className="btn--back"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to dashboard
              </button>
            </div>
            
            <div className="action-bar__right">
              <button
                onClick={handlePreview}
                className="btn btn--secondary"
              >
                Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={!portfolio.hasUnsavedChanges}
                className="btn btn--primary"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Portfolio Header Card */}
          <div className="card card--profile">
            {/* Edit Button */}
            <div className="card__actions">
              <button 
                onClick={() => setShowEditModal(true)}
                className="btn btn--ghost"
                style={{ width: '2.75rem', height: '2.75rem', padding: '0.5rem' }}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <div className="card__body">
              {/* Avatar */}
              <div className="card__avatar">
                {portfolio.photoUrl ? (
                  portfolio.photoUrl.startsWith('/placeholders/') ? (
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img 
                        src={portfolio.photoUrl} 
                        alt={portfolio.childName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <img 
                      src={portfolio.photoUrl} 
                      alt={portfolio.childName}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <span className="card__avatar--placeholder">
                    {portfolio.childName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Name and Title */}
              <h1 className="card__title">
                {portfolio.childName}
              </h1>
              <p className="card__subtitle">
                {portfolio.portfolioTitle}
              </p>
              <p className="text-sm text-gray-500">
                Member since {formatMemberSince(portfolio.createdAt)}
              </p>

              {/* Portfolio URL with Copy Button */}
              <div className="card__meta">
                <span className="text-sm text-gray-500">Portfolio URL:</span>
                <span className="text-sm font-mono text-kifolio-cta">
                  my.kifol.io/{portfolio.id}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="btn btn--ghost btn--icon-only btn--sm"
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
          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card__header">
              <h2 className="card__title">Achievements</h2>
              <button
                onClick={handleAddAchievement}
                className="btn btn--primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add</span>
              </button>
            </div>

            <div className="card__body">
              {/* Achievements Timeline */}
              <AchievementsTimeline
                achievements={portfolio.achievements || []}
                onView={handleViewAchievement}
              />
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
        onDelete={handleDeletePortfolio}
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
        showEditButton={true}
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