import type { MetadataRoute } from 'next';
import { blogPosts } from '@/content/blog';
import { SITE_ORIGIN } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_ORIGIN, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_ORIGIN}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_ORIGIN}/onboarding`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_ORIGIN}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_ORIGIN}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_ORIGIN}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_ORIGIN}/auth/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const posts: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_ORIGIN}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...posts];
}
