import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Create portfolio',
  alternates: { canonical: `${SITE_ORIGIN}/create` },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
