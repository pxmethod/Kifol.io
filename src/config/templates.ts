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
      background: 'linear-gradient(135deg,rgb(47, 63, 134) 0%,rgb(56, 19, 91) 100%)',
      text: '#ffffff',
      textSecondary: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(198, 189, 215, 0.1)',
      dateHeaderBg: 'rgba(255, 255, 255, 0.05)', 
      tagBg: 'rgba(36, 16, 74, 0.9)' 
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
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: 'rgba(155, 89, 182, 0.15)',
      cardBg: 'rgba(246, 248, 249, 0.8)',
      dateHeaderBg: 'rgba(190, 203, 220, 0.1)',
      tagBg: 'rgba(172, 23, 232, 0.9)' 
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
      background: 'linear-gradient(60deg, #29323c 0%, #485563 100%)',
      text: '#ffffff',
      textSecondary: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      dateHeaderBg: 'rgba(0, 0, 0, 0.2)',
      tagBg: 'rgba(0, 0, 0, 0.4)' 
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
      background: 'linear-gradient(to top, #3f51b1 0%, #5a55ae 13%, #7b5fac 25%, #8f6aae 38%, #a86aa4 50%, #cc6b8e 62%, #f18271 75%, #f3a469 87%, #f7c978 100%)',
      text: '#ffffff',
      textSecondary: '#ffffff',
      border: 'rgba(255, 255, 255, 0.1)',
      cardBg: 'rgba(255, 255, 255, 0.1)',
      dateHeaderBg: 'rgba(255, 255, 255, 0.1)',
      tagBg: 'rgba(255, 255, 255, 0.1)'
    }
  }
];

export const getTemplateConfig = (templateId: string): TemplateConfig => {
  return templates.find(t => t.id === templateId) || templates[0];
};
