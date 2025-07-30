export interface Achievement {
  id: string;
  title: string;
  date: string; // ISO date string
  description?: string;
  media: AchievementMedia[];
  isMilestone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementMedia {
  id: string;
  url: string;
  type: 'image' | 'pdf';
  fileName: string;
  fileSize: number;
}

export interface AchievementFormData {
  title: string;
  date: string;
  description: string;
  isMilestone: boolean;
  media: File[];
}

export interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
  onDelete?: (achievementId: string) => void;
  achievement?: Achievement | null; // null for new, Achievement for edit
} 