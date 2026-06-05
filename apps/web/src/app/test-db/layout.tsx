import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Test DB',
  alternates: { canonical: `${SITE_ORIGIN}/test-db` },
  robots: { index: false, follow: false },
};

export default function TestDbLayout({ children }: { children: React.ReactNode }) {
  return children;
}
