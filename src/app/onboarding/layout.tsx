import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Get started',
  alternates: { canonical: `${SITE_ORIGIN}/onboarding` },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
