import { templates } from '@/config/templates';

/** Same order and data as `templates` — used for create / onboarding template pickers. */
export const PORTFOLIO_TEMPLATES = templates;

export type PortfolioFormState = {
  childName: string;
  portfolioTitle: string;
  photoUrl: string;
  template: string;
  isPrivate: boolean;
  password: string;
};

export function validatePortfolioForm(formData: PortfolioFormState): Record<string, string> {
  const newErrors: Record<string, string> = {};

  if (!formData.childName.trim()) {
    newErrors.childName = "Child or student's name is required";
  } else if (formData.childName.length > 100) {
    newErrors.childName = "Child or student's name must be 100 characters or less";
  }

  if (!formData.portfolioTitle.trim()) {
    newErrors.portfolioTitle = 'Portfolio title is required';
  } else if (formData.portfolioTitle.length > 100) {
    newErrors.portfolioTitle = 'Portfolio title must be 100 characters or less';
  }

  if (!formData.template) {
    newErrors.template = 'Please select a theme';
  }

  if (formData.isPrivate && !formData.password.trim()) {
    newErrors.password = 'Password is required when portfolio is private';
  }

  return newErrors;
}
