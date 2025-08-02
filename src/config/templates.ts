import { TemplateConfig } from '@/types/template';

export const templates: TemplateConfig[] = [
  {
    id: 'ren',
    name: 'Ren',
    description: 'Clean and modern design',
    fontFamily: '"Funnel Sans", sans-serif',
    colors: {
      primary: '#2563eb', // Blue
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb'
    }
  },
  {
    id: 'maeve',
    name: 'Maeve',
    description: 'Elegant and sophisticated',
    fontFamily: '"Outfit", sans-serif',
    colors: {
      primary: '#7c3aed', // Purple
      secondary: '#5b21b6',
      accent: '#8b5cf6',
      background: '#fafafa',
      text: '#374151',
      textSecondary: '#9ca3af',
      border: '#d1d5db'
    }
  },
  {
    id: 'jack',
    name: 'Jack',
    description: 'Bold and dynamic',
    fontFamily: '"Newsreader", serif',
    colors: {
      primary: '#dc2626', // Red
      secondary: '#b91c1c',
      accent: '#ef4444',
      background: '#fef2f2',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#fecaca'
    }
  },
  {
    id: 'adler',
    name: 'Adler',
    description: 'Classic and timeless',
    fontFamily: '"Tinos", serif',
    colors: {
      primary: '#059669', // Green
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#bbf7d0'
    }
  }
];

export const getTemplateConfig = (templateId: string): TemplateConfig => {
  return templates.find(t => t.id === templateId) || templates[0];
}; 