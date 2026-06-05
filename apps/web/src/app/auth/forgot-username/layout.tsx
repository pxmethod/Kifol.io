import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Forgot username',
  alternates: { canonical: `${SITE_ORIGIN}/auth/forgot-username` },
};

export default function AuthForgotUsernameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
