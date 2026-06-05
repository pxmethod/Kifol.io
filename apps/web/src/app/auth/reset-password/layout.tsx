import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Reset password',
  alternates: { canonical: `${SITE_ORIGIN}/auth/reset-password` },
};

export default function AuthResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
