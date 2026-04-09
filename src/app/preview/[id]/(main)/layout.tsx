import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    alternates: { canonical: `${SITE_ORIGIN}/preview/${id}` },
  };
}

export default function PreviewMainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
