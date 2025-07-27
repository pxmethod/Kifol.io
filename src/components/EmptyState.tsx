'use client';

import { useRouter } from 'next/navigation';

export default function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Empty State Message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-kifolio-text mb-4">
          No portfolio&apos;s to show yet
        </h1>
        <p className="text-kifolio-text text-base leading-relaxed max-w-md">
          Start showcasing your children&apos;s work, milestones and achievements by creating a portfolio for them.
        </p>
      </div>

      {/* Call to Action Button */}
      <button 
        onClick={() => router.push('/create')}
        className="bg-kifolio-cta text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-kifolio-cta/90 transition-colors shadow-md"
      >
        Create New Portfolio
      </button>
    </div>
  );
} 