import { Achievement } from './achievement';

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

export interface PortfolioTemplateProps {
  portfolio: {
    id: string;
    childName: string;
    portfolioTitle: string;
    photoUrl: string;
    template: string;
    createdAt: string;
    isPrivate?: boolean;
    password?: string;
    achievements?: Achievement[];
  };
} 