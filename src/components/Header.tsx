'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="bg-kifolio-header text-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img 
            src="/kifolio_logo.svg" 
            alt="Kifolio Logo" 
            className="h-8 w-auto"
          />
        </Link>

        {/* User Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
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
            <span className="text-sm hidden sm:block text-white">
              email@domain.com
            </span>

            {/* Dropdown Arrow */}
            <svg 
              className="w-4 h-4 text-white transition-transform duration-200"
              fill="currentColor" 
              viewBox="0 0 20 20"
              style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link 
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile
              </Link>
              <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 