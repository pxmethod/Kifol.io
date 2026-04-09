import type { Metadata } from 'next';
import MarketingNav from '@/components/MarketingNav';
import BlogPostCard from '@/components/BlogPostCard';
import {
  BLOG_INTRO_COPY,
  getAllPostsSorted,
  getCanonicalBlogUrl,
} from '@/content/blog';
import { SITE_ORIGIN } from '@/lib/seo';

const siteUrl = SITE_ORIGIN;

const blogPageDescription =
  'Ideas and guides for building digital portfolios, documenting childhood milestones, and sharing progress with teachers and coaches.';

export const metadata: Metadata = {
  title: {
    absolute: 'Blog | Kifolio — Tips and best practices for using Kifolio',
  },
  description: blogPageDescription,
  keywords: [
    'children portfolio',
    'digital portfolio',
    'family milestones',
    'student portfolio',
    'Kifolio blog',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${siteUrl}/blog`,
    siteName: 'Kifolio',
    title: 'Kifolio Blog',
    description: blogPageDescription,
    images: [{ url: `${siteUrl}/kifolio_logo_dark.svg`, width: 144, height: 38, alt: 'Kifolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kifolio Blog',
    description: blogPageDescription,
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
};

export default function BlogPage() {
  const posts = getAllPostsSorted();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Kifolio Blog',
    description: blogPageDescription,
    url: getCanonicalBlogUrl(),
    publisher: {
      '@type': 'Organization',
      name: 'Kifolio',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/kifolio_logo_dark.svg` },
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      author: { '@type': 'Organization', name: p.author },
      url: `${siteUrl}/blog/${p.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        <header className="mb-12 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-medium text-discovery-black mb-4">Blog</h1>
          <p className="text-lg text-discovery-grey max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            {BLOG_INTRO_COPY}
          </p>
        </header>

        <ul className="space-y-10 list-none p-0 m-0">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogPostCard post={post} variant="list" />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
