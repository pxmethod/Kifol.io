'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  animateLogo?: boolean;
}

export default function Header({ animateLogo = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoAnimated, setIsLogoAnimated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);


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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      // Redirect to marketing home page after logout
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close dropdown if mobile menu is opening
    if (!isMobileMenuOpen) {
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="bg-discovery-primary text-white px-9 py-4 shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link 
          href={user ? "/dashboard" : "/"} 
          className={`flex items-center ${animateLogo ? 'animate-fade-in' : ''}`}
        >
          <Image 
            src="/kifolio_logo.svg" 
            alt="Kifolio Logo" 
            width={150}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Navigation Menu */}
        {user && (
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="flex items-center text-discovery-white-100 hover:text-discovery-white-80 transition-colors font-medium relative"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Portfolios
              {pathname === '/dashboard' && (
                <Image
                  src="/marketing/doodle-1.svg"
                  alt="Active page indicator"
                  width={40}
                  height={24}
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                />
              )}
            </Link>
            <Link 
              href="/give-feedback" 
              className="flex items-center text-discovery-white-100 hover:text-discovery-white-80 transition-colors font-medium relative"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Give Feedback
              {pathname === '/give-feedback' && (
                <Image
                  src="/marketing/doodle-2.svg"
                  alt="Active page indicator"
                  width={40}
                  height={24}
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                />
              )}
            </Link>
          </nav>
        )}

        {/* User Profile Section */}
        {user ? (
          <>
            {/* Mobile Hamburger Menu Button */}
          <button
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Open mobile menu"
            >
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>

            {/* Desktop Profile Dropdown */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="profile-menu__trigger"
              >
                {/* Avatar */}
                <div className="profile-menu__avatar">
                  <img 
                    src="/account-avatar.svg" 
                    alt="Account" 
                    className="w-full h-full object-cover rounded-full"
                  />
            </div>

                {/* Email */}
                <div className="hidden sm:block text-left">
                  <div className="profile-menu__email">
                    {user.email}
                  </div>
                </div>

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
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login"
              className="text-discovery-white-100 hover:text-discovery-white-80 transition-colors font-medium"
            >
              Login
            </Link>
            <Link 
              href="/auth/signup"
              className="bg-discovery-yellow text-discovery-black px-8 py-4 rounded-pill hover:bg-discovery-yellow-dark transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden mobile-menu-overlay"
        >
          <div className="fixed inset-y-0 right-0 w-80 bg-discovery-white-100 shadow-xl transform transition-transform duration-300 ease-in-out mobile-menu-slide mobile-menu-z">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-discovery-beige-300">
              <h2 className="text-xl font-medium text-discovery-black">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-discovery-beige-100 transition-colors mobile-menu-close"
                aria-label="Close mobile menu"
              >
                <svg 
                  className="w-6 h-6 text-discovery-grey" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Items */}
            <nav className="p-6 space-y-4">
              <Link
                href="/dashboard"
                className={`flex items-center px-4 py-3 rounded-lg text-lg font-medium transition-colors mobile-menu-item ${
                  pathname === '/dashboard' 
                    ? 'active' 
                    : 'text-discovery-grey hover:bg-discovery-beige-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                My Portfolios
              </Link>


              <Link
                href="/give-feedback"
                className={`flex items-center px-4 py-3 rounded-lg text-lg font-medium transition-colors mobile-menu-item ${
                  pathname === '/give-feedback' 
                    ? 'active' 
                    : 'text-discovery-grey hover:bg-discovery-beige-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Give Feedback
              </Link>

              <Link
                href="/profile"
                className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-discovery-grey hover:bg-discovery-beige-100 transition-colors mobile-menu-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-lg text-lg font-medium text-discovery-grey hover:bg-discovery-beige-100 transition-colors text-left mobile-menu-item"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </nav>

            {/* User Info */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-kifolio-primary rounded-full flex items-center justify-center mr-3 overflow-hidden">
                  <img 
                    src="/account-avatar.svg" 
                    alt="Account" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 