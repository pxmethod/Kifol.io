'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

  const highlightCount = portfolio.achievements?.length || 0;

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

  const handleMenuMouseLeave = () => {
    // Only close when leaving the button area, not the dropdown
    // The dropdown will handle its own mouse leave
  };

  const handleDropdownMouseLeave = () => {
    setShowMenu(false);
  };

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
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Portfolio Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center relative">
        {/* 3-Dot Menu - positioned absolutely over the image */}
        <div className="absolute top-3 right-3 z-10" ref={menuRef} onMouseLeave={handleMenuMouseLeave}>
          <button
            className="menu-button bg-white/90 hover:bg-white rounded-lg p-2 shadow-sm transition-colors"
            onClick={handleMenuToggle}
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div 
              className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-20"
              onMouseLeave={handleDropdownMouseLeave}
            >
              <button
                onClick={handleEdit}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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

        {/* Status Tag - positioned absolutely over the image */}
        <div className="absolute top-3 left-3">
          {portfolio.isPrivate ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-yellow-800">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-green-800">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Public
            </span>
          )}
        </div>

        {/* Portfolio Photo or Placeholder */}
        {portfolio.photoUrl ? (
          portfolio.photoUrl.startsWith('/placeholders/') ? (
            <Image
              src={portfolio.photoUrl}
              alt={portfolio.childName}
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={portfolio.photoUrl}
              alt={portfolio.childName}
              width={192}
              height={192}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="text-gray-400 text-center">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p>No Photo</p>
          </div>
        )}
      </div>

      {/* Portfolio Details */}
      <div className="p-6">
        {/* Child's Name */}
        <h3 className="text-3xl font-medium text-discovery-black mb-2">
          {portfolio.childName}
        </h3>

        {/* Portfolio Title */}
        <p className="text-discovery-grey text-sm mb-4 leading-relaxed">
          {portfolio.portfolioTitle}
        </p>


        {/* Highlights Count */}
        <div className="flex items-center text-sm font-medium text-discovery-grey">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          {highlightCount} Highlight{highlightCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
} 