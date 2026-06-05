import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Feedback',
  alternates: { canonical: `${SITE_ORIGIN}/give-feedback` },
};

export default function GiveFeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
