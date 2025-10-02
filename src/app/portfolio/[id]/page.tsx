'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import DeletePortfolioModal from '@/components/DeletePortfolioModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
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
  short_id?: string;
  achievements?: Achievement[];
}

export default function PortfolioPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPrivateTooltip, setShowPrivateTooltip] = useState(false);

  // Check if portfolio was just created or highlight was added
  useEffect(() => {
    const wasCreated = searchParams.get('created') === 'true';
    const highlightAdded = searchParams.get('highlightAdded') === 'true';
    const highlightUpdated = searchParams.get('highlightUpdated') === 'true';
    
    if (wasCreated) {
      setToastMessage('Portfolio created successfully!');
      setShowToast(true);
      // Remove the query parameter from URL
      router.replace(`/portfolio/${params.id}`);
    } else if (highlightAdded) {
      setToastMessage('Highlight added successfully!');
      setShowToast(true);
      // Remove the query parameter from URL
      router.replace(`/portfolio/${params.id}`);
    } else if (highlightUpdated) {
      setToastMessage('Highlight updated successfully!');
      setShowToast(true);
      // Remove the query parameter from URL
      router.replace(`/portfolio/${params.id}`);
    }
  }, [searchParams, params.id, router]);


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
      <div className="min-h-screen bg-discovery-beige-200">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-5">
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



  if (loading) {
    return (
      <div className="min-h-screen bg-discovery-beige-200">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading portfolio..." />
          </div>
        </main>
      </div>
    );
  }

  if (!portfolio || error) {
    return (
      <div className="min-h-screen bg-discovery-beige-200">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-5">
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
    <div className="min-h-screen bg-discovery-beige-200">
      <Header />
      
      
      {/* Action Bar */}
      <div className="bg-discovery-white-100 border-b border-discovery-beige-100 px-9 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: All elements in single row */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-discovery-grey hover:text-discovery-black transition-colors"
              title="Back to dashboard"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-discovery-beige-300 text-discovery-black rounded-lg hover:bg-discovery-beige-100 transition-colors font-medium text-md"
              >
                Preview Portfolio
              </button>
            </div>
          </div>
          
          {/* Desktop: Original two-column layout */}
          <div className="hidden lg:flex items-center justify-between w-full">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-discovery-grey hover:text-discovery-black transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to dashboard
              </button>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handlePreview}
                className="px-4 py-2 border border-discovery-beige-300 text-discovery-black rounded-lg hover:bg-discovery-beige-100 transition-colors font-medium text-md"
              >
                Preview Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-5">
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden max-w-2xl mx-auto">
          {/* Portfolio Header Card */}
          <div className="bg-discovery-white-100 rounded-lg shadow-md overflow-hidden relative">
            {/* Edit Button */}
            <div className="absolute top-4 right-4 z-10">
              <Link 
                href={`/portfolio/${portfolio.id}/edit`}
                className="flex items-center justify-center w-12 h-12 bg-discovery-white-100 hover:bg-discovery-beige-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-discovery-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
            </div>

            <div className="px-6 py-8 text-center">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-discovery-beige-100 flex items-center justify-center">
                  {portfolio.photoUrl ? (
                    portfolio.photoUrl.startsWith('/placeholders/') ? (
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <Image 
                          src={portfolio.photoUrl} 
                          alt={portfolio.childName}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Image 
                        src={portfolio.photoUrl} 
                        alt={portfolio.childName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <span className="text-2xl font-semibold text-discovery-grey">
                      {portfolio.childName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Name and Title */}
              <h1 className="text-3xl font-medium text-discovery-black mb-2">
                {portfolio.childName}
              </h1>
              
              {/* Status Badge - Center aligned underneath the name */}
              <div className="flex justify-center mb-4 relative">
                {portfolio.isPrivate ? (
                  <div 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-yellow-800 cursor-help"
                    onMouseEnter={() => setShowPrivateTooltip(true)}
                    onMouseLeave={() => setShowPrivateTooltip(false)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Private
                    
                    {/* Custom Tooltip */}
                    {showPrivateTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-discovery-black text-discovery-white-100 text-xs rounded-lg whitespace-nowrap z-10">
                        This portfolio is private. Recipients will need the password to view it.
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-discovery-black"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 rounded-full border border-discovery-beige-100 text-sm font-medium bg-white text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Public
                  </div>
                )}
              </div>
              
              <p className="text-md text-discovery-grey leading-relaxed mb-2">
                {portfolio.portfolioTitle}
              </p>
              <p className="text-xs text-discovery-grey">
                Member since {formatMemberSince(portfolio.createdAt)}
              </p>

              {/* Portfolio URL - On its own row */}
              <div className="mt-6 p-4 bg-discovery-beige-200 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-discovery-black break-all flex-1 min-w-0">
                      {DOMAIN_CONFIG.PORTFOLIO_DOMAIN}/p/{portfolio.short_id || portfolio.id}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center w-10 h-10 bg-discovery-white-100 hover:bg-discovery-beige-200 rounded-full transition-colors flex-shrink-0"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4 text-discovery-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organizations Section */}
          <div className="bg-discovery-white-100 rounded-lg shadow-md overflow-hidden mt-8">
            <div className="px-6 py-4">
              <h2 className="text-2xl font-medium text-discovery-black">Organizations</h2>
            </div>

            <div className="px-6 pb-6">
              {/* Organizations Empty State */}
              <div className="text-center py-12">
                <div className="mx-auto mb-4">
                  <img 
                    src="/marketing/no-orgs.png" 
                    alt="No organizations yet" 
                    className="mx-auto"
                    style={{ width: '260px', height: '260px' }}
                  />
                </div>
                <h3 className="text-lg font-medium text-discovery-black mb-2">No orgs to show</h3>
                <p className="text-discovery-grey">Organizations that your child is a part of will display here.</p>
              </div>
            </div>
          </div>

          {/* Portfolio Content */}
          <div>
            <div className="py-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-medium text-discovery-black">Highlights</h2>
                <button
                  onClick={handleAddHighlight}
                  className="bg-discovery-orange text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-orange-light flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add highlight</span>
                </button>
              </div>
            </div>

            <div className="py-6">
              {/* Highlights Timeline */}
              <HighlightsTimeline
                highlights={portfolio.achievements || []}
                onEdit={handleEditHighlight}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout - Two Column */}
        <div className="hidden lg:flex gap-8">
          {/* Left Column - Fixed */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-8 space-y-8">
              {/* Portfolio Header Card */}
              <div className="bg-discovery-white-100 rounded-lg shadow-md overflow-hidden relative">
                {/* Edit Button */}
                <div className="absolute top-4 right-4 z-10">
                  <Link 
                    href={`/portfolio/${portfolio.id}/edit`}
                    className="flex items-center justify-center w-12 h-12 bg-discovery-white-100 hover:bg-discovery-beige-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-discovery-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>

                <div className="px-6 py-8 text-center">
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-discovery-beige-100 flex items-center justify-center">
                      {portfolio.photoUrl ? (
                        portfolio.photoUrl.startsWith('/placeholders/') ? (
                          <div className="w-full h-full rounded-full overflow-hidden">
                            <Image 
                              src={portfolio.photoUrl} 
                              alt={portfolio.childName}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <Image 
                            src={portfolio.photoUrl} 
                            alt={portfolio.childName}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <span className="text-2xl font-semibold text-discovery-grey">
                          {portfolio.childName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Name and Title */}
                  <h1 className="text-3xl font-medium text-discovery-black mb-2">
                    {portfolio.childName}
                  </h1>
                  
                  {/* Status Badge - Center aligned underneath the name */}
                  <div className="flex justify-center mb-4 relative">
                    {portfolio.isPrivate ? (
                      <div 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-yellow-800 cursor-help"
                        onMouseEnter={() => setShowPrivateTooltip(true)}
                        onMouseLeave={() => setShowPrivateTooltip(false)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Private
                        
                        {/* Custom Tooltip */}
                        {showPrivateTooltip && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-discovery-black text-discovery-white-100 text-xs rounded-lg whitespace-nowrap z-10">
                            This portfolio is private. Recipients will need the password to view it.
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-discovery-black"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-1 rounded-full border border-discovery-beige-100 text-sm font-medium bg-white text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Public
                      </div>
                    )}
                  </div>
                  
                  <p className="text-md text-discovery-grey leading-relaxed mb-2">
                    {portfolio.portfolioTitle}
                  </p>
                  <p className="text-xs text-discovery-grey">
                    Member since {formatMemberSince(portfolio.createdAt)}
                  </p>

                  {/* Portfolio URL - On its own row */}
                  <div className="mt-6 p-4 bg-discovery-beige-200 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-discovery-black break-all flex-1 min-w-0">
                          {DOMAIN_CONFIG.PORTFOLIO_DOMAIN}/p/{portfolio.short_id || portfolio.id}
                        </span>
                        <button
                          onClick={copyToClipboard}
                          className="flex items-center justify-center w-10 h-10 bg-discovery-white-100 hover:bg-discovery-beige-200 rounded-full transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          <svg className="w-4 h-4 text-discovery-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizations Section */}
              <div className="bg-discovery-white-100 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4">
                  <h2 className="text-2xl font-medium text-discovery-black">Organizations</h2>
                </div>

                <div className="px-6 pb-6">
                  {/* Organizations Empty State */}
                  <div className="text-center py-12">
                    <div className="mx-auto mb-4">
                      <img 
                        src="/marketing/no-orgs.png" 
                        alt="No organizations yet" 
                        className="mx-auto"
                        style={{ width: '260px', height: '260px' }}
                      />
                    </div>
                    <h3 className="text-lg font-medium text-discovery-black mb-2">No orgs to show</h3>
                    <p className="text-discovery-grey">Organizations that your child is a part of will display here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Scrollable */}
          <div className="flex-1">
            <div>
              <div className="py-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-medium text-discovery-black">Highlights</h2>
                  <button
                    onClick={handleAddHighlight}
                    className="bg-discovery-orange text-white px-8 py-4 rounded-pill text-lg font-semibold transition-colors shadow-lg hover:shadow-xl hover:bg-discovery-orange-light flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add highlight</span>
                  </button>
                </div>
              </div>

              <div className="py-6">
                {/* Highlights Timeline */}
                <HighlightsTimeline
                  highlights={portfolio.achievements || []}
                  onEdit={handleEditHighlight}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Copy Notification */}
      {showCopyNotification && (
        <div className="fixed bottom-4 right-4 bg-discovery-primary text-discovery-white-100 px-4 py-2 rounded-lg shadow-lg z-50">
          URL copied to clipboard!
        </div>
      )}




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