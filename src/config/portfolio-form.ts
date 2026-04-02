export const PORTFOLIO_TEMPLATES = [
  { id: 'ren', name: 'Ren', description: 'Clean and modern design' },
  { id: 'maeve', name: 'Maeve', description: 'Elegant and sophisticated' },
  { id: 'jack', name: 'Jack', description: 'Bold and dynamic' },
  { id: 'adler', name: 'Adler', description: 'Classic and timeless' },
] as const;

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
    newErrors.template = 'Please select a template';
  }

  if (formData.isPrivate && !formData.password.trim()) {
    newErrors.password = 'Password is required when portfolio is private';
  }

  return newErrors;
}
