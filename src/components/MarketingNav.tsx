'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Why Kifolio', href: '#why-kifolio' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full pt-6 pb-4 px-4 lg:px-6 transition-colors duration-300 ${
        isScrolled ? 'bg-transparent' : 'bg-discovery-beige-200'
      }`}
    >
      <div
        className={`mx-auto max-w-[80rem] h-16 flex items-center justify-between pl-6 pr-4 py-2 rounded-full bg-[#ffffff]/75 backdrop-blur-[16px] transition-all duration-300 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/kifolio_logo_dark.svg"
              alt="Kifolio"
              width={130}
              height={34}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-discovery-black/80 hover:text-discovery-primary text-[15px] font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-discovery-black/80 hover:text-discovery-primary text-[15px] font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/onboarding"
              className="bg-discovery-primary text-white px-6 py-3 rounded-full text-[15px] font-semibold hover:bg-discovery-primary-dark transition-all shadow-sm hover:shadow-md"
            >
              Get started for free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-discovery-black hover:bg-white/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
      </div>

      {/* Mobile menu - outside pill */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mx-auto max-w-[1200px] mt-3 px-4 py-4 rounded-2xl bg-[#f5faf8]/75 backdrop-blur-[16px] border border-discovery-beige-300/50">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-4 text-discovery-black font-medium rounded-lg hover:bg-discovery-beige-100 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-discovery-beige-300">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-4 text-center text-discovery-black font-medium rounded-lg hover:bg-discovery-beige-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-4 text-center bg-discovery-primary text-white font-semibold rounded-full hover:bg-discovery-primary-dark transition-colors"
                >
                  Get started for free
                </Link>
              </div>
            </nav>
        </div>
      )}
    </header>
  );
}
