import { Achievement } from './achievement';

/** Public portfolio theme: page backdrop + body font only; shell/cards stay neutral. */
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  /** CSS background for the page (gradient). */
  pageBackground: string;
  /** Shown in template pickers (matches `getTemplateNextFont`). */
  fontLabel: string;
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
  /** Onboarding (and similar) embedded previews: hide highlight filter, avoid min-h-screen scroll gap */
  previewMode?: boolean;
}
