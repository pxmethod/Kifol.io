import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/MarketingNav';
import { getAllPostsSorted, getCanonicalBlogUrl } from '@/content/blog';

const siteUrl = 'https://kifol.io';

const blogPageDescription =
  'Ideas and guides for building digital portfolios, documenting childhood milestones, and sharing progress with teachers and coaches.';

export const metadata: Metadata = {
  title: 'Blog | Kifolio — Tips and best practices for using Kifolio',
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
            Ideas for documenting milestones, building portfolios, and sharing your child&apos;s story with
            confidence.
          </p>
        </header>

        <ul className="space-y-10 list-none p-0 m-0">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="bg-discovery-white-100 rounded-2xl shadow-md overflow-hidden border border-discovery-beige-100 flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-56 md:w-64 shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[200px] bg-discovery-beige-100">
                  {post.thumbnail.endsWith('.svg') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail}
                      alt={post.thumbnailAlt}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={post.thumbnail}
                      alt={post.thumbnailAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 256px"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1 p-6 sm:p-8">
                  <time
                    dateTime={post.publishedAt}
                    className="text-sm text-discovery-grey mb-2"
                  >
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <h2 className="text-2xl font-semibold text-discovery-black mb-3 leading-tight">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-discovery-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-discovery-grey leading-relaxed mb-4 flex-1">{post.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-discovery-beige-200 text-discovery-black/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-discovery-orange font-semibold hover:text-discovery-orange-light transition-colors"
                    >
                      Read more
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
