'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TemplateFactory from '@/components/templates/TemplateFactory';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import PortfolioPasswordPrompt from '@/components/PortfolioPasswordPrompt';
import { deriveTypeAndCustomLabelFromHighlightRow } from '@/lib/highlightDbRow';
import { Achievement } from '@/types/achievement';
import { portfolioService, achievementService } from '@/lib/database';
import { portfolioAccessService } from '@/lib/services/portfolio-access';

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

export default function ShortPortfolioPageClient() {
  const params = useParams();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    const loadPortfolioByShortId = async () => {
      try {
        setLoading(true);
        setError(null);
        const shortId = params.shortId as string;

        // Get portfolio by short ID
        const dbPortfolio = await portfolioService.getPortfolioByShortId(shortId);

        if (!dbPortfolio) {
          setError('Portfolio not found');
          return;
        }

        // Check if portfolio is private
        const accessInfo = await portfolioService.getPortfolioAccessInfo(dbPortfolio.id);

        if (accessInfo?.isPrivate) {
          // Check if user has password access
          const access = await portfolioAccessService.checkAccess(dbPortfolio.id);

          if (!access.hasAccess) {
            // Show password prompt for private portfolio
            setShowPasswordPrompt(true);
            setLoading(false);
            return;
          }
        }

        // Portfolio is public or user has access, load the portfolio
        setPortfolio(dbPortfolio as any);
        await loadPortfolioData(dbPortfolio.id, dbPortfolio);
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioByShortId();
  }, [params.shortId]);

  const loadPortfolioData = async (portfolioId: string, dbPortfolio: any) => {
    try {
      // Get achievements for this portfolio
      const highlights = await achievementService.getPortfolioHighlights(portfolioId);

      // Fetch endorsements for all highlights
      let endorsementsByAchievement: Record<
        string,
        Array<{
          id: string;
          instructorName: string;
          instructorTitle: string | null;
          organization: string | null;
          comment: string;
          submittedAt: string | null;
        }>
      > = {};
      try {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${base}/api/endorsements/portfolio/${portfolioId}`);
        if (res.ok) {
          const { endorsements } = await res.json();
          endorsementsByAchievement = endorsements || {};
        }
      } catch {
        // Non-fatal: portfolio loads without endorsements
      }

      // Transform to legacy format
      const portfolioData: PortfolioData = {
        id: portfolioId,
        childName: dbPortfolio.child_name,
        portfolioTitle: dbPortfolio.portfolio_title,
        photoUrl: dbPortfolio.photo_url || '',
        template: dbPortfolio.template,
        createdAt: dbPortfolio.created_at,
        isPrivate: dbPortfolio.is_private,
        password: dbPortfolio.password || undefined,
        achievements: highlights.map((highlight: any) => {
          const { type, customTypeLabel } = deriveTypeAndCustomLabelFromHighlightRow(highlight);
          return {
          id: highlight.id,
          title: highlight.title,
          date: highlight.date_achieved,
          dateEnd: highlight.date_end ?? null,
          ongoing: highlight.ongoing ?? (highlight.date_end ? false : true),
          customTypeLabel,
          description: highlight.description || undefined,
          media: (highlight.media_urls || []).map((url: string, index: number) => ({
            id: `media-${index}`,
            url,
            type: url.toLowerCase().includes('.pdf') ? 'pdf' : 'image',
            fileName: url.split('/').pop() || 'file',
            fileSize: 0,
          })),
          type,
          isMilestone: type === 'milestone',
          createdAt: highlight.created_at,
          updatedAt: highlight.updated_at,
          endorsements: endorsementsByAchievement[highlight.id] || [],
        };
        }),
      };

      setPortfolio(portfolioData);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError('Failed to load portfolio');
    }
  };

  const handlePasswordVerified = async () => {
    // Password was verified, now load the portfolio
    if (portfolio) {
      await loadPortfolioData(portfolio.id, portfolio);
    }
    setShowPasswordPrompt(false);
  };

  const handlePasswordCancel = () => {
    // User cancelled password entry, redirect to main site
    router.push('/');
  };

  // Show password prompt for private portfolio
  if (showPasswordPrompt) {
    return (
      <PortfolioPasswordPrompt
        portfolioId={portfolio?.id || ''}
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
