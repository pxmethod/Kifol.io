import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Forgot password',
  alternates: { canonical: `${SITE_ORIGIN}/auth/forgot-password` },
};

export default function AuthForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
