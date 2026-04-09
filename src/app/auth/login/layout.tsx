import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Log in',
  alternates: { canonical: `${SITE_ORIGIN}/auth/login` },
};

export default function AuthLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
