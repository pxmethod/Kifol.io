import { TemplateConfig } from '@/types/template';

export const templates: TemplateConfig[] = [
  {
    id: 'ren',
    name: 'Ren',
    description: 'Clean and modern design',
    fontFamily: '"Geist", sans-serif',
    colors: {
      primary: '#4a90e2',
      secondary: '#357abd',
      accent: '#5fa3e8',
      background: '#1a1f2e', // Deep navy
      text: '#ffffff',
      textSecondary: '#b0b8c8',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      dateHeaderBg: 'rgba(74, 144, 226, 0.15)',
      tagBg: 'rgba(74, 144, 226, 0.9)' // Blue tag
    }
  },
  {
    id: 'maeve',
    name: 'Maeve',
    description: 'Elegant and sophisticated',
    fontFamily: '"Oswald", sans-serif',
    colors: {
      primary: '#9b59b6',
      secondary: '#7d3c98',
      accent: '#af7ac5',
      background: '#2d1b3d', // Rich purple-black
      text: '#ffffff',
      textSecondary: '#c5a3d6',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      dateHeaderBg: 'rgba(155, 89, 182, 0.15)',
      tagBg: 'rgba(155, 89, 182, 0.9)' // Purple tag
    }
  },
  {
    id: 'jack',
    name: 'Jack',
    description: 'Bold and dynamic',
    fontFamily: '"Quicksand", sans-serif',
    colors: {
      primary: '#e74c3c',
      secondary: '#c0392b',
      accent: '#ec7063',
      background: '#2c2c2c', // Charcoal grey
      text: '#ffffff',
      textSecondary: '#b8b8b8',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      dateHeaderBg: '#1d1d1d',
      tagBg: 'rgba(231, 76, 60, 0.9)' // Red tag
    }
  },
  {
    id: 'adler',
    name: 'Adler',
    description: 'Classic and timeless',
    fontFamily: '"Lora", serif',
    colors: {
      primary: '#27ae60',
      secondary: '#1e8449',
      accent: '#52be80',
      background: '#1a2e1a', // Dark forest green
      text: '#ffffff',
      textSecondary: '#a8c5a8',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      dateHeaderBg: 'rgba(39, 174, 96, 0.15)',
      tagBg: 'rgba(39, 174, 96, 0.9)' // Green tag
    }
  }
];

export const getTemplateConfig = (templateId: string): TemplateConfig => {
  return templates.find(t => t.id === templateId) || templates[0];
};
