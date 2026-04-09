import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EndorseForm from './EndorseForm';
import { SITE_ORIGIN } from '@/lib/seo';

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  return {
    title: { absolute: 'Endorse a milestone | Kifolio' },
    alternates: { canonical: `${SITE_ORIGIN}/endorse/${token}` },
    robots: { index: false, follow: false },
  };
}

export default async function EndorsePage({
  params,
}: PageProps) {
  const { token } = await params;

  if (!token || token.length < 10) {
    notFound();
  }

  return <EndorseForm token={token} />;
}
