'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

interface PortfolioCardProps {
  portfolio: PortfolioData;
  onEdit: (portfolio: PortfolioData) => void;
  onRemove: (portfolio: PortfolioData) => void;
}

export default function PortfolioCard({ portfolio, onEdit, onRemove }: PortfolioCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const achievementCount = portfolio.achievements?.length || 0;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the menu button
    if ((e.target as HTMLElement).closest('.menu-button')) {
      return;
    }
    router.push(`/portfolio/${portfolio.id}`);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(portfolio);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onRemove(portfolio);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 relative group"
      onClick={handleCardClick}
    >
      {/* 3-Dot Menu */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          className="menu-button p-2 text-gray-400 hover:text-kifolio-cta transition-colors rounded-full hover:bg-gray-100"
          onClick={handleMenuToggle}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[120px] z-10">
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleRemove}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="text-center space-y-4">
        {/* Avatar */}
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-kifolio-cta to-kifolio-header flex items-center justify-center">
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
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        {/* Child's Name */}
        <h3 className="text-2xl font-bold text-kifolio-text truncate">
          {portfolio.childName}
        </h3>

        {/* Portfolio Title */}
        <p className="text-gray-600 font-medium">
          {portfolio.portfolioTitle}
        </p>

        {/* Achievement Count */}
        <p className="text-sm text-gray-500">
          {achievementCount} Achievement{achievementCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
} 