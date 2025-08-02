'use client';

import { useRouter } from 'next/navigation';
import PortfolioCard from './PortfolioCard';
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

interface PortfolioGridProps {
  portfolios: PortfolioData[];
  onEdit: (portfolio: PortfolioData) => void;
  onRemove: (portfolio: PortfolioData) => void;
}

export default function PortfolioGrid({ portfolios, onEdit, onRemove }: PortfolioGridProps) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kifolio-text">
          My Portfolios
        </h1>
        <button
          onClick={() => router.push('/create')}
          className="bg-kifolio-cta text-white px-6 py-3 rounded-lg font-semibold hover:bg-kifolio-cta/90 transition-colors shadow-md"
        >
          Create New Portfolio
        </button>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
} 