import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Verify email',
  alternates: { canonical: `${SITE_ORIGIN}/auth/verify` },
};

export default function AuthVerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
