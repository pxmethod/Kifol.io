'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  animateLogo?: boolean;
}

export default function Header({ animateLogo = false }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoAnimated, setIsLogoAnimated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trigger logo animation on page load (only when animateLogo is true)
  useEffect(() => {
    if (animateLogo) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsLogoAnimated(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [animateLogo]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-kifolio-header text-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <Link 
          href="/" 
          className={`flex items-center hover:opacity-80 transition-opacity ${
            animateLogo && isLogoAnimated ? 'animate-logo-enter' : animateLogo ? 'animate-logo-initial' : ''
          }`}
        >
          <img 
            src="/kifolio_logo.svg" 
            alt="Kifolio Logo" 
            className="h-8 w-auto"
          />
        </Link>

        {/* User Profile Section */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="profile-menu__trigger"
            >
              {/* Avatar */}
              <div className="profile-menu__avatar">
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>

              {/* Email */}
              <span className="profile-menu__email hidden sm:block">
                {user.email}
              </span>

              {/* Dropdown Arrow */}
              <svg 
                className={`profile-menu__chevron ${isDropdownOpen ? 'profile-menu__chevron--open' : ''}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="profile-menu__dropdown">
                <Link 
                  href="/profile"
                  className="profile-menu__item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="profile-menu__item text-left w-full"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login"
              className="text-white hover:text-gray-200 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/signup"
              className="bg-white text-kifolio-header px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
} 