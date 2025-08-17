'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TemplateFactory from '@/components/templates/TemplateFactory';
import LoadingSpinner from '@/components/LoadingSpinner';
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kifolio-text mb-4">Portfolio Not Found</h1>
          <p className="text-kifolio-text">
            {error || "The portfolio you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return <TemplateFactory portfolio={portfolio} />;
} 