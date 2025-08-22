'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TemplateFactory from '@/components/templates/TemplateFactory';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { Achievement } from '@/types/achievement';
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
  achievements?: Achievement[];
}

export default function PreviewPage() {
  const params = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError(null);
        const portfolioId = params.id as string;
        
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
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [params.id]);

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