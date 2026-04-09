import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    alternates: { canonical: `${SITE_ORIGIN}/portfolio/${id}/highlight` },
  };
}

export default function HighlightIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
