import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string; highlightId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, highlightId } = await params;
  return {
    alternates: {
      canonical: `${SITE_ORIGIN}/portfolio/${id}/highlight/${highlightId}`,
    },
  };
}

export default function HighlightEditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
