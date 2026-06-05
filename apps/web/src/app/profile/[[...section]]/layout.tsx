import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ section?: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const path =
    section && section.length > 0 ? `/profile/${section.join('/')}` : '/profile';
  return {
    alternates: { canonical: `${SITE_ORIGIN}${path}` },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
