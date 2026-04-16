import type { PortfolioFormState } from '@/config/portfolio-form';

const STORAGE_KEY = 'kifolio_onboarding_portfolio_draft';

/** Max serialized size for photo data URL in sessionStorage (~2MB) */
export const ONBOARDING_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export type OnboardingPortfolioDraft = Pick<
  PortfolioFormState,
  'childName' | 'portfolioTitle' | 'template' | 'isPrivate' | 'password'
> & {
  /** Account holder display name — prefilled on /auth/signup */
  parentName?: string;
  /** data URL from FileReader, optional */
  photoDataUrl?: string;
};

export function saveOnboardingDraft(draft: OnboardingPortfolioDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('Failed to save onboarding draft', e);
  }
}

export function loadOnboardingDraft(): OnboardingPortfolioDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingPortfolioDraft;
    if (!parsed || typeof parsed.childName !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOnboardingDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
