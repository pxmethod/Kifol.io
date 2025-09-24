export type HighlightType = 'achievement' | 'creative_work' | 'milestone' | 'activity' | 'reflection_note';

export interface Highlight {
  id: string;
  title: string;
  date: string; // ISO date string
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
  date: string;
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
    name: 'Creative Work',
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
    id: 'reflection_note',
    name: 'Reflection/Note',
    description: 'a parent\'s written reflection, or even a child\'s own words'
  }
];

// Legacy types for backward compatibility during migration
export interface Achievement extends Highlight {
  isMilestone: boolean;
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