'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Trophy,
  Palette,
  Flag,
  Dumbbell,
  HeartHandshake,
  StickyNote,
  Star,
} from 'lucide-react';
import type { HighlightType } from '@/types/achievement';

/** Single source of truth for Lucide icons per highlight type (Stats, forms, filters). */
export const HIGHLIGHT_TYPE_LUCIDE: Record<HighlightType, LucideIcon> = {
  achievement: Trophy,
  creative_work: Palette,
  milestone: Flag,
  activity: Dumbbell,
  volunteer_work: HeartHandshake,
  reflection_note: StickyNote,
  custom: Star,
};

export type HighlightTypeIconProps = {
  type: HighlightType;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

export function HighlightTypeIcon({
  type,
  className = 'w-5 h-5',
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
}: HighlightTypeIconProps) {
  const Icon = HIGHLIGHT_TYPE_LUCIDE[type];
  if (!Icon) return null;
  return (
    <Icon className={className} strokeWidth={strokeWidth} aria-hidden={ariaHidden} />
  );
}
