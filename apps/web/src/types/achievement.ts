export type HighlightType =
  | 'achievement'
  | 'creative_work'
  | 'milestone'
  | 'activity'
  | 'volunteer_work'
  | 'reflection_note'
  | 'custom';

export interface Highlight {
  id: string;
  title: string;
  date: string; // Start date (ISO date string, from date_achieved)
  /** End date when not ongoing (ISO YYYY-MM-DD or full ISO) */
  dateEnd?: string | null;
  /** When true, display "present" instead of an end date */
  ongoing?: boolean;
  /** Label when type is custom */
  customTypeLabel?: string | null;
  description?: string;
  media: HighlightMedia[];
  type: HighlightType;
  createdAt: string;
  updatedAt: string;
}

export interface HighlightMedia {
  id: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'audio';
  fileName: string;
  fileSize: number;
}

export interface HighlightFormData {
  title: string;
  /** Start date YYYY-MM-DD */
  date: string;
  /** End date YYYY-MM-DD (ignored when ongoing) */
  dateEnd: string;
  ongoing: boolean;
  customTypeLabel: string;
  description: string;
  type: HighlightType;
  media: File[];
}

export interface HighlightTypeOption {
  id: HighlightType;
  name: string;
  description: string;
}

export const HIGHLIGHT_TYPES: HighlightTypeOption[] = [
  {
    id: 'achievement',
    name: 'Achievement',
    description: 'awards, recognitions, promotions'
  },
  {
    id: 'creative_work',
    name: 'Creative work',
    description: 'artwork, music, writing, projects'
  },
  {
    id: 'milestone',
    name: 'Milestone',
    description: 'first day of school, learning to ride a bike, graduation'
  },
  {
    id: 'activity',
    name: 'Activity',
    description: 'sports games, performances, trips, hobbies'
  },
  {
    id: 'volunteer_work',
    name: 'Volunteer work',
    description: 'Serving at foodbank, cleaning parks, walking shelter dogs'
  },
  {
    id: 'reflection_note',
    name: 'Reflection/Note',
    description: 'a parent\'s written reflection, or even a child\'s own words'
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'name your own category'
  }
];

export function getHighlightTypeDisplayName(h: {
  type: HighlightType;
  customTypeLabel?: string | null;
}): string {
  if (h.type === 'custom' && h.customTypeLabel?.trim()) {
    return h.customTypeLabel.trim();
  }
  return HIGHLIGHT_TYPES.find((t) => t.id === h.type)?.name ?? 'Highlight';
}

// Legacy types for backward compatibility during migration
export interface Achievement extends Highlight {
  isMilestone: boolean;
  /** Submitted endorsements for this achievement (when loaded) */
  endorsements?: { id: string; instructorName: string; instructorTitle: string | null; organization: string | null; comment: string; submittedAt: string | null }[];
}

// Legacy interface for backward compatibility
export type AchievementMedia = HighlightMedia;

export interface AchievementFormData extends HighlightFormData {
  isMilestone: boolean;
}

export interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
  onDelete?: (achievementId: string) => void;
  achievement?: Achievement | null; // null for new, Achievement for edit
} 