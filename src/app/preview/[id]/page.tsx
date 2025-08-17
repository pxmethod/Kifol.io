'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TemplateFactory from '@/components/templates/TemplateFactory';
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
  achievements?: Achievement[];
}

export default function PreviewPage() {
  const params = useParams();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kifolio-cta mx-auto"></div>
          <p className="mt-4 text-kifolio-text">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-kifolio-text mb-4">Portfolio Not Found</h1>
          <p className="text-kifolio-text">The portfolio you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return <TemplateFactory portfolio={portfolio} />;
} 