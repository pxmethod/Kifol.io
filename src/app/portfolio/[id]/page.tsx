'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import EditPortfolioModal from '@/components/EditPortfolioModal';
import DeletePortfolioModal from '@/components/DeletePortfolioModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { portfolioService, achievementService } from '@/lib/database';
import { createClient } from '@/lib/supabase/client';
import { DOMAIN_CONFIG } from '@/config/domains';
import { Achievement } from '@/types/achievement';
import Image from 'next/image';
import HighlightsTimeline from '@/components/HighlightsTimeline';

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
  short_id?: string;
  achievements?: Achievement[];
}

export default function PortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { subscription } = useSubscription();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showPublishNotification, setShowPublishNotification] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPrivateTooltip, setShowPrivateTooltip] = useState(false);
  const [isPortfolioLocked, setIsPortfolioLocked] = useState(false);

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

  const checkIfPortfolioIsLocked = async (portfolioId: string): Promise<boolean> => {
    try {
      if (!user?.id) return false;
      
      // Get all portfolios for this user, ordered by creation date
      const supabase = createClient();
      const { data: allPortfolios, error } = await supabase
        .from('portfolios')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching portfolios:', error);
        return false;
      }
      
      if (!allPortfolios || allPortfolios.length <= 1) {
        return false; // First portfolio is never locked
      }
      
      // Find the index of this portfolio in the ordered list
      const portfolioIndex = allPortfolios.findIndex((p: any) => p.id === portfolioId);
      
      // If this is not the first portfolio (index > 0), it's locked
      return portfolioIndex > 0;
    } catch (error) {
      console.error('Error checking portfolio lock status:', error);
      return false; // Default to unlocked if there's an error
    }
  };

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const portfolioId = params.id as string;
      
      // Get portfolio from database
      const dbPortfolio = await portfolioService.getPortfolio(portfolioId);
      
      if (dbPortfolio) {
        // Get highlights for this portfolio
        const highlights = await achievementService.getPortfolioHighlights(portfolioId);
        
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
          short_id: dbPortfolio.short_id,
          hasUnsavedChanges: false,
          achievements: highlights.map((highlight: any) => ({
            id: highlight.id,
            title: highlight.title,
            date: highlight.date_achieved,
            description: highlight.description || undefined,
            media: highlight.media_urls.map((url: string, index: number) => ({
              id: `media-${index}`,
              url,
              type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
              fileName: url.split('/').pop() || 'file',
              fileSize: 0
            })),
            type: highlight.type,
            isMilestone: highlight.type === 'milestone',
            createdAt: highlight.created_at,
            updatedAt: highlight.updated_at
          }))
        };
        
        setPortfolio(portfolioData);
        
        // Check if portfolio is locked for free users
        if (subscription?.plan === 'free') {
          const isLocked = await checkIfPortfolioIsLocked(portfolioId);
          setIsPortfolioLocked(isLocked);
          
          // If portfolio is locked, show a message but don't redirect
          // Users can still view the portfolio but with limited functionality
        }
      } else {
        setError('Portfolio not found');
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // Load portfolio data
  useEffect(() => {
    if (user && params.id) {
      loadPortfolio();
    }
  }, [user, params.id, loadPortfolio]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  // Redirect unauthenticated users to welcome page
  if (!user) {
    router.push('/welcome');
    return null;
  }

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const copyToClipboard = async () => {
    if (portfolio) {
              const url = `https://${DOMAIN_CONFIG.PORTFOLIO_DOMAIN}/p/${portfolio.short_id || portfolio.id}`;
      try {
        await navigator.clipboard.writeText(url);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 3000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleSavePortfolio = async (updatedPortfolio: PortfolioData) => {
    try {
      // Update portfolio in database using the database service
      await portfolioService.updatePortfolio(updatedPortfolio.id, {
        child_name: updatedPortfolio.childName,
        portfolio_title: updatedPortfolio.portfolioTitle,
        photo_url: updatedPortfolio.photoUrl || null,
        template: updatedPortfolio.template,
        is_private: updatedPortfolio.isPrivate || false,
        password: updatedPortfolio.password || null
      });
      
      // Update state
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error saving portfolio:', error);
      setToastMessage('Failed to save portfolio. Please try again.');
      setShowToast(true);
    }
  };



  const handleEditHighlight = (achievement: Achievement) => {
    router.push(`/portfolio/${portfolio?.id}/highlight/${achievement.id}`);
  };


  const handleAddHighlight = () => {
    router.push(`/portfolio/${portfolio?.id}/highlight`);
  };

  const handlePreview = () => {
    if (portfolio) {
      window.open(`/preview/${portfolio.id}`, '_blank');
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      // Delete portfolio from database
      await portfolioService.deletePortfolio(portfolioId);
      
      // Show success toast for portfolio removal
      setToastMessage('Portfolio removed successfully!');
      setShowToast(true);
      
      // Redirect to dashboard (My Portfolios page)
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      setToastMessage('Failed to delete portfolio. Please try again.');
      setShowToast(true);
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading portfolio..." />
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
          <ErrorDisplay
            title="Portfolio Not Found"
            message={error || "The portfolio you're looking for doesn't exist or you don't have permission to view it."}
            type="error"
            showRetry={true}
            showHome={true}
            onRetry={() => window.location.reload()}
            onHome={() => router.push('/dashboard')}
            className="min-h-[50vh]"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header />
      
      {/* Locked Portfolio Notice */}
      {isPortfolioLocked && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-orange-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h2 className="text-lg font-semibold text-orange-800">Portfolio Locked</h2>
                  <p className="text-orange-700">
                    This portfolio is locked on the free plan. Upgrade to Premium to unlock all features.
                  </p>
                </div>
              </div>
              <Link
                href="/profile/billing"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-bar__container">
          {/* Mobile: All elements in single row */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <button
              onClick={() => router.push('/dashboard')}
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
                disabled={isPortfolioLocked}
                className={`btn btn--secondary ${isPortfolioLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={!portfolio.hasUnsavedChanges || isPortfolioLocked}
                className={`btn btn--primary ${isPortfolioLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Publish
              </button>
            </div>
          </div>
          
          {/* Desktop: Original two-column layout */}
          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="action-bar__left">
              <button
                onClick={() => router.push('/dashboard')}
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
                disabled={isPortfolioLocked}
                className={`btn btn--secondary ${isPortfolioLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={!portfolio.hasUnsavedChanges || isPortfolioLocked}
                className={`btn btn--primary ${isPortfolioLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      <Image 
                        src={portfolio.photoUrl} 
                        alt={portfolio.childName}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Image 
                      src={portfolio.photoUrl} 
                      alt={portfolio.childName}
                      width={120}
                      height={120}
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
              
              {/* Status Badge - Center aligned underneath the name */}
              <div className="flex justify-center mb-4 relative">
                {portfolio.isPrivate ? (
                  <div 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 cursor-help"
                    onMouseEnter={() => setShowPrivateTooltip(true)}
                    onMouseLeave={() => setShowPrivateTooltip(false)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Private
                    
                    {/* Custom Tooltip */}
                    {showPrivateTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                        This portfolio is private. Recipients will need the password to view it.
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Public
                  </div>
                )}
              </div>
              
              <p className="card__subtitle">
                {portfolio.portfolioTitle}
              </p>
              <p className="text-sm text-gray-500">
                Member since {formatMemberSince(portfolio.createdAt)}
              </p>

              {/* Portfolio URL - On its own row */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Portfolio URL:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-kifolio-cta break-all flex-1 min-w-0">
                      {DOMAIN_CONFIG.PORTFOLIO_DOMAIN}/p/{portfolio.short_id || portfolio.id}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="btn btn--ghost btn--icon-only btn--sm flex-shrink-0"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Content */}
          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card__header">
              <h2 className="card__title">Highlights</h2>
              {isPortfolioLocked ? (
                <div className="flex items-center text-orange-600 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Locked - Upgrade to add highlights</span>
                </div>
              ) : (
                <button
                  onClick={handleAddHighlight}
                  className="btn btn--primary"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Highlight</span>
                </button>
              )}
            </div>

            <div className="card__body">
              {/* Highlights Timeline */}
              <HighlightsTimeline
                highlights={portfolio.achievements || []}
                onEdit={handleEditHighlight}
                isLocked={isPortfolioLocked}
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