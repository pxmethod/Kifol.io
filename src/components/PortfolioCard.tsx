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
  isAnimated?: boolean;
}

export default function PortfolioCard({ portfolio, onEdit, onRemove, isAnimated = false }: PortfolioCardProps) {
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
      className={`card card--portfolio card--interactive ${isAnimated ? 'animate-card-enter' : 'animate-card-initial'}`}
      onClick={handleCardClick}
    >
      {/* 3-Dot Menu */}
      <div className="card__actions" ref={menuRef} onMouseLeave={handleMenuMouseLeave}>
        <button
          className="menu-button btn btn--ghost btn--icon-only"
          onClick={handleMenuToggle}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div 
            className="profile-menu__dropdown" 
            style={{ right: 0, top: '2.5rem' }}
            onMouseLeave={handleDropdownMouseLeave}
          >
            <button
              onClick={handleEdit}
              className="profile-menu__item"
            >
              Edit
            </button>
            <button
              onClick={handleRemove}
              className="profile-menu__item profile-menu__item--danger"
              style={{ color: 'var(--color-danger)' }}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="card__body">
        {/* Avatar */}
        <div className="card__avatar card__avatar--xl">
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
            <span className="card__avatar--placeholder text-2xl">
              {portfolio.childName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Child's Name */}
        <h3 className="card__title">
          {portfolio.childName}
        </h3>

        {/* Portfolio Title */}
        <p className="card__subtitle">
          {portfolio.portfolioTitle}
        </p>

        {/* Achievement Count */}
        <div className="card__meta">
          <span className="card__meta-item">
            {achievementCount} Achievement{achievementCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
} 