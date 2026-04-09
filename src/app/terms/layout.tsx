import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms of Use',
  alternates: { canonical: `${SITE_ORIGIN}/terms` },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
