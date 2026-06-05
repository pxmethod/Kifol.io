import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sign up',
  alternates: { canonical: `${SITE_ORIGIN}/auth/signup` },
};

export default function AuthSignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
