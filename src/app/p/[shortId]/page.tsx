import type { Metadata } from 'next';
import ShortPortfolioPageClient from './ShortPortfolioPageClient';
import { getPortfolioShortLinkUrl } from '@/config/domains';
import {
  getPortfolioShareMetadata,
  resolveOgImage,
} from '@/lib/portfolio/share-metadata';

const SITE_TAGLINE = 'Digital portfolios for children and students';

const defaultDescription =
  'Create beautiful digital portfolios for your children. Showcase achievements, creativity, and milestones from first drawing to graduation.';

type Props = { params: Promise<{ shortId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shortId } = await params;
  const pageUrl = getPortfolioShortLinkUrl(shortId);
  const meta = await getPortfolioShareMetadata(shortId);
  const ogImage = resolveOgImage(meta);

  if (!meta) {
    return {
      title: { absolute: `Portfolio | Kifolio` },
      description: defaultDescription,
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: pageUrl,
        siteName: 'Kifolio',
        title: 'Kifolio',
        description: defaultDescription,
        images: [{ url: ogImage, width: 144, height: 38, alt: 'Kifolio' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Kifolio',
        description: defaultDescription,
        images: [ogImage],
      },
      alternates: { canonical: pageUrl },
    };
  }

  const titleAbsolute = meta.is_private
    ? `Kifolio — ${SITE_TAGLINE}`
    : `${meta.child_name}'s Kifolio — ${SITE_TAGLINE}`;

  const description = meta.is_private
    ? 'A private portfolio on Kifolio. Enter the password to view.'
    : `${meta.child_name}'s portfolio “${meta.portfolio_title}”. View milestones and achievements on Kifolio.`;

  const ogTitle = titleAbsolute;

  return {
    title: { absolute: titleAbsolute },
    description,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: 'Kifolio',
      title: ogTitle,
      description,
      images: [
        {
          url: ogImage,
          alt: meta.is_private ? 'Kifolio' : `${meta.child_name}'s portfolio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage],
    },
    alternates: { canonical: pageUrl },
    robots: meta.is_private ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default function ShortPortfolioPage() {
  return <ShortPortfolioPageClient />;
}
