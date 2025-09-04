'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function EmptyState() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Empty State Image */}
      {user && (
        <div className="mb-8">
          <img 
            src="/marketing/no-portfolios.png" 
            alt="No portfolios yet" 
            className="mx-auto"
            style={{ width: '260px', height: '260px' }}
          />
        </div>
      )}
      
      {/* Empty State Message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-kifolio-text mb-4">
          {user ? "No portfolio's to show yet" : "Welcome to Kifolio"}
        </h1>
        <p className="text-kifolio-text text-base leading-relaxed max-w-md">
          {user 
            ? "Start showcasing your children's work, milestones and achievements by creating a portfolio for them."
            : "Create beautiful digital portfolios to showcase your children's achievements, work, and milestones."
          }
        </p>
      </div>

      {/* Call to Action Button */}
      {user ? (
        <button 
          onClick={() => router.push('/create')}
          className="bg-kifolio-cta text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-kifolio-cta/90 transition-colors shadow-md"
        >
          Create New Portfolio
        </button>
      ) : (
        <div className="flex space-x-4">
          <button 
            onClick={() => router.push('/auth/signup')}
            className="bg-kifolio-cta text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-kifolio-cta/90 transition-colors shadow-md"
          >
            Get Started
          </button>
          <button 
            onClick={() => router.push('/auth/login')}
            className="border-2 border-kifolio-cta text-kifolio-cta px-8 py-3 rounded-lg font-semibold text-lg hover:bg-kifolio-cta hover:text-white transition-colors"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
} 