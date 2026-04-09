import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import MarketingNav from '@/components/MarketingNav';
import { blogPosts, getPostBySlug, getCanonicalPostUrl, type BlogPost } from '@/content/blog';
import { SITE_ORIGIN } from '@/lib/seo';

const siteUrl = SITE_ORIGIN;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: { absolute: 'Article | Kifolio' } };
  }

  const url = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.thumbnail.startsWith('http') ? post.thumbnail : `${siteUrl}${post.thumbnail}`;

  return {
    title: { absolute: `${post.title} | Kifolio Blog` },
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      siteName: 'Kifolio',
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [{ url: ogImage, alt: post.thumbnailAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}

function ArticleBody({ post }: { post: BlogPost }) {
  return (
    <div className="prose prose-lg max-w-none">
      {post.sections.map((section, i) =>
        section.type === 'h2' ? (
          <h2
            key={i}
            className="text-2xl font-semibold text-discovery-black mt-10 mb-4 first:mt-0"
          >
            {section.text}
          </h2>
        ) : (
          <p key={i} className="text-lg text-discovery-grey leading-relaxed mb-6">
            {section.text}
          </p>
        )
      )}
    </div>
  );
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = getCanonicalPostUrl(post.slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kifolio',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/kifolio_logo_dark.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: post.thumbnail.startsWith('http') ? post.thumbnail : `${siteUrl}${post.thumbnail}`,
    url,
    keywords: post.tags.join(', '),
  };

  return (
    <div className="min-h-screen bg-discovery-beige-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        <nav className="text-sm text-discovery-grey mb-8" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 list-none p-0 m-0">
            <li>
              <Link href="/" className="hover:text-discovery-primary transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/blog" className="hover:text-discovery-primary transition-colors">
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-discovery-black font-medium truncate max-w-[min(100%,12rem)] sm:max-w-none">
              {post.title}
            </li>
          </ol>
        </nav>

        <header className="mb-10">
          <div className="relative w-full aspect-[2/1] max-h-80 rounded-2xl overflow-hidden bg-discovery-beige-100 mb-8">
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
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            )}
          </div>
          <time
            dateTime={post.publishedAt}
            className="text-sm text-discovery-grey block mb-3"
          >
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <h1 className="text-4xl lg:text-5xl font-medium text-discovery-black mb-6 leading-tight">
            {post.title}
          </h1>
          <p className="text-xl text-discovery-grey leading-relaxed">{post.description}</p>
          <div className="flex flex-wrap gap-2 mt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-discovery-beige-200 text-discovery-black/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <ArticleBody post={post} />

        <footer className="mt-14 pt-10 border-t border-discovery-beige-300">
          <Link
            href="/blog"
            className="inline-flex items-center text-discovery-orange font-semibold hover:text-discovery-orange-light transition-colors"
          >
            <svg className="w-4 h-4 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Back to blog
          </Link>
        </footer>
      </article>
    </div>
  );
}
