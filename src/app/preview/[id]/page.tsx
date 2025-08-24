'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TemplateFactory from '@/components/templates/TemplateFactory';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import PortfolioPasswordPrompt from '@/components/PortfolioPasswordPrompt';
import { Achievement } from '@/types/achievement';
import { portfolioService, achievementService } from '@/lib/database';
import { portfolioAccessService, PortfolioAccess } from '@/lib/services/portfolio-access';

interface PortfolioData {
  id: string;
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  createdAt: string;
  isPrivate?: boolean;
  password?: string;
  achievements?: Achievement[];
}

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessStatus, setAccessStatus] = useState<PortfolioAccess | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    const checkAccessAndLoadPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        const portfolioId = params.id as string;
        
        // First, check access to the portfolio
        const access = await portfolioAccessService.checkAccess(portfolioId);
        setAccessStatus(access);

        if (!access.hasAccess) {
          // Check if portfolio exists and is private
          const accessInfo = await portfolioService.getPortfolioAccessInfo(portfolioId);
          
          if (!accessInfo) {
            setError('Portfolio not found');
            return;
          }

          if (accessInfo.isPrivate) {
            // Show password prompt for private portfolio
            setShowPasswordPrompt(true);
            setLoading(false);
            return;
          } else {
            setError('Access denied');
            return;
          }
        }

        // User has access, load the portfolio
        await loadPortfolio(portfolioId);
      } catch (err) {
        console.error('Error checking access:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndLoadPortfolio();
  }, [params.id]);

  const loadPortfolio = async (portfolioId: string) => {
    try {
      // Get portfolio from database
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
        setError('Portfolio not found');
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError('Failed to load portfolio');
    }
  };

  const handlePasswordVerified = async () => {
    // Password was verified, now load the portfolio
    const portfolioId = params.id as string;
    await loadPortfolio(portfolioId);
    setShowPasswordPrompt(false);
  };

  const handlePasswordCancel = () => {
    // User cancelled password entry, redirect to main site
    router.push('/');
  };

  // Show password prompt for private portfolio
  if (showPasswordPrompt) {
    const portfolioId = params.id as string;
    return (
      <PortfolioPasswordPrompt
        portfolioId={portfolioId}
        portfolioTitle="Private Portfolio"
        onPasswordVerified={handlePasswordVerified}
        onCancel={handlePasswordCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading portfolio..." />
      </div>
    );
  }

  if (!portfolio || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorDisplay
          title="Portfolio Not Found"
          message={error || "This portfolio is either private, doesn't exist, or has been removed."}
          type="error"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return <TemplateFactory portfolio={portfolio} />;
} 