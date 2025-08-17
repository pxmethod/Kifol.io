'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PortfolioCard from './PortfolioCard';
import { Achievement } from '@/types/achievement';
import { useAuth } from '@/contexts/AuthContext';

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

interface PortfolioGridProps {
  portfolios: PortfolioData[];
  onEdit: (portfolio: PortfolioData) => void;
  onRemove: (portfolio: PortfolioData) => void;
}

export default function PortfolioGrid({ portfolios, onEdit, onRemove }: PortfolioGridProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [animatedCards, setAnimatedCards] = useState<Set<string>>(new Set());

  // Trigger animations when portfolios change
  useEffect(() => {
    if (portfolios.length > 0) {
      // Reset animations first
      setAnimatedCards(new Set());
      
      // Animate each card with a staggered delay
      portfolios.forEach((portfolio, index) => {
        setTimeout(() => {
          setAnimatedCards(prev => new Set(prev).add(portfolio.id));
        }, index * 100); // 100ms delay between each card
      });
    }
  }, [portfolios]);

  return (
    <div className="space-y-8 portfolio-grid-container">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center animate-fade-in">
        <h1 className="text-2xl font-bold text-kifolio-text">
          My Portfolios
        </h1>
        {user && (
          <button
            onClick={() => router.push('/create')}
            className="btn btn--primary"
          >
            Create New Portfolio
          </button>
        )}
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            onEdit={onEdit}
            onRemove={onRemove}
            isAnimated={animatedCards.has(portfolio.id)}
          />
        ))}
      </div>
    </div>
  );
} 