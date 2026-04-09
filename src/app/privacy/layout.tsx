import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: `${SITE_ORIGIN}/privacy` },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
