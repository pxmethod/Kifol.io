'use client';

import { useEffect, useMemo, useState } from 'react';
import TemplateFactory from '@/components/templates/TemplateFactory';
import type { Achievement, HighlightMedia } from '@/types/achievement';
import { getRandomPlaceholder } from '@/utils/placeholders';

/** Swap these paths for real images under `public/` when you have assets. */
const PREVIEW_THUMB_URLS = {
  first: ['/placeholders/placeholder-1.svg', '/placeholders/placeholder-2.svg'],
  second: ['/placeholders/placeholder-3.svg', '/placeholders/placeholder-4.svg'],
} as const;

function previewImageMedia(urls: readonly string[], highlightId: string): HighlightMedia[] {
  return urls.map((url, i) => ({
    id: `${highlightId}-img-${i}`,
    url,
    type: 'image' as const,
    fileName: url.split('/').pop() ?? 'image',
    fileSize: 0,
  }));
}

/** Placeholder endorsements for onboarding preview — replace copy as needed. */
const PREVIEW_ENDORSEMENTS_HIGHLIGHT_1 = [
  {
    id: 'preview-1-e1',
    instructorName: 'Sammy George',
    instructorTitle: 'Head Instructor',
    organization: 'Kickya Karate',
    comment: 'Well deserved promotion. Keep up the good work!',
    submittedAt: '2024-01-16T12:00:00Z',
  },
  {
    id: 'preview-1-e2',
    instructorName: 'Steve Johnson',
    instructorTitle: null,
    organization: null,
    comment: 'Congrats! Looking forward to your next promotion.',
    submittedAt: '2024-01-17T12:00:00Z',
  },
];

const PREVIEW_ENDORSEMENTS_HIGHLIGHT_2 = [
  {
    id: 'preview-2-e1',
    instructorName: 'Franz Fisher',
    instructorTitle: 'Manager',
    organization: 'Atlanta Community Food Bank',
    comment: 'Thank you so much! You did a great job!',
    submittedAt: '2024-02-21T12:00:00Z',
  },
];

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Yellow belt promotion!',
    date: '2024-01-15',
    description: 'I earned my yellow belt in karate!',
    media: previewImageMedia(PREVIEW_THUMB_URLS.first, '1'),
    type: 'milestone',
    isMilestone: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    endorsements: PREVIEW_ENDORSEMENTS_HIGHLIGHT_1,
  },
  {
    id: '2',
    title: 'Voluneered at the local food bank - 2 hours',
    date: '2024-02-20',
    description: 'I helped pack food bags for families in need at our local food bank.',
    media: previewImageMedia(PREVIEW_THUMB_URLS.second, '2'),
    type: 'volunteer_work',
    isMilestone: false,
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
    endorsements: PREVIEW_ENDORSEMENTS_HIGHLIGHT_2,
  },
];

/** Matches BaseTemplate `mainShellClass` radius so the clip aligns with the portfolio card. */
const PREVIEW_RADIUS_CLASS = 'rounded-[1.75rem]';

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

  const displayName = childName.trim() || 'Maeve';
  const displayTitle = portfolioTitle.trim() || 'Maeve\'s Portfolio';
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
    <div className="flex flex-col items-center justify-center min-h-[420px] lg:min-h-[560px] lg:mt-[50px]">
      {/* Single clip: theme + portfolio; scroll inside; no outer frame or shadow */}
      <div
        className={`w-full max-w-[390px] lg:max-w-[560px] ${PREVIEW_RADIUS_CLASS} shadow-xl overflow-hidden min-h-0 transition-opacity duration-500 h-[min(69.6vh,624px)] ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          key={`${tpl}-${displayName}-${displayTitle}-${localPhotoUrl ? 'custom' : 'ph'}`}
          className="h-full w-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-auto animate-onboarding-preview-in [scrollbar-gutter:stable]"
        >
          {/* Scroll-only: block clicks on template content; wheel/touch scroll still hits this parent */}
          <div className="pointer-events-none min-h-full w-full">
            <TemplateFactory portfolio={portfolio} previewMode />
          </div>
        </div>
      </div>
    </div>
  );
}
