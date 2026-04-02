'use client';

import { useEffect, useMemo, useState } from 'react';
import TemplateFactory from '@/components/templates/TemplateFactory';
import { HighlightType } from '@/types/achievement';
import { getRandomPlaceholder } from '@/utils/placeholders';

const SAMPLE_ACHIEVEMENTS = [
  {
    id: '1',
    title: 'First Steps',
    date: '2024-01-15',
    description: 'Took my first steps independently',
    media: [],
    type: 'milestone' as HighlightType,
    isMilestone: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'First Words',
    date: '2024-02-20',
    description: 'Said my first words clearly',
    media: [],
    type: 'milestone' as HighlightType,
    isMilestone: false,
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
  },
];

export interface OnboardingPortfolioPreviewProps {
  childName: string;
  portfolioTitle: string;
  template: string;
  /** Object URL or data URL for selected photo; empty uses placeholder */
  localPhotoUrl: string | null;
}

export default function OnboardingPortfolioPreview({
  childName,
  portfolioTitle,
  template,
  localPhotoUrl,
}: OnboardingPortfolioPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = childName.trim() || 'Your child';
  const displayTitle = portfolioTitle.trim() || 'Your portfolio';
  const tpl = template || 'adler';

  const photoUrl = useMemo(() => {
    if (localPhotoUrl) return localPhotoUrl;
    return getRandomPlaceholder(displayName);
  }, [localPhotoUrl, displayName]);

  const portfolio = useMemo(
    () => ({
      id: 'onboarding-preview',
      childName: displayName,
      portfolioTitle: displayTitle,
      photoUrl,
      template: tpl,
      createdAt: new Date().toISOString(),
      achievements: SAMPLE_ACHIEVEMENTS,
    }),
    [displayName, displayTitle, photoUrl, tpl]
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[420px] lg:min-h-[560px]">
      {/* Decorative background */}
      <div
        className="absolute inset-0 -z-10 rounded-[2.5rem] opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 70% 20%, rgba(255, 183, 77, 0.25), transparent 50%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(46, 125, 120, 0.12), transparent 45%)',
        }}
      />

      {/* Glass preview frame (no phone chrome) */}
      <div
        className={`relative lg:mt-[50px] w-[min(100%,384px)] transition-transform duration-500 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div
          className="
            rounded-[1.75rem] overflow-hidden
            bg-gradient-to-br from-white/45 via-white/25 to-white/10
            backdrop-blur-2xl
            border border-white/55
            shadow-[0_28px_64px_-12px_rgba(27,27,27,0.28),0_12px_32px_-8px_rgba(0,100,78,0.12),inset_0_1px_0_0_rgba(255,255,255,0.65)]
            ring-1 ring-white/35
          "
        >
          <div
            className="bg-white/90 backdrop-blur-sm overflow-hidden relative rounded-[1.5rem] m-1.5"
            style={{ height: 'min(69.6vh, 624px)' }}
          >
            <div
              key={`${tpl}-${displayName}-${displayTitle}-${localPhotoUrl ? 'custom' : 'ph'}`}
              className="h-full overflow-y-auto overflow-x-hidden animate-onboarding-preview-in"
            >
              <div className="origin-top scale-[0.92] sm:scale-95 w-[108%] -ml-[4%]">
                <TemplateFactory portfolio={portfolio} previewMode />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
