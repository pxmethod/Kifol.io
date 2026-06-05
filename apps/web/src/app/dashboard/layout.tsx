import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Dashboard',
  alternates: { canonical: `${SITE_ORIGIN}/dashboard` },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
