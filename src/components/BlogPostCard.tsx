'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/content/blog';

type BlogPostCardProps = {
  post: BlogPost;
  /** `list` matches the blog index (image beside text on sm+). `grid` stacks for narrow columns. */
  variant?: 'list' | 'grid';
};

export default function BlogPostCard({ post, variant = 'list' }: BlogPostCardProps) {
  const isGrid = variant === 'grid';

  return (
    <article
      className={
        isGrid
          ? 'bg-discovery-white-100 rounded-2xl shadow-md overflow-hidden border border-discovery-beige-100 flex flex-col h-full'
          : 'bg-discovery-white-100 rounded-2xl shadow-md overflow-hidden border border-discovery-beige-100 flex flex-col sm:flex-row'
      }
    >
      <div
        className={
          isGrid
            ? 'relative w-full aspect-[16/10] shrink-0 bg-discovery-beige-100'
            : 'relative w-full sm:w-56 md:w-64 shrink-0 aspect-[16/10] sm:aspect-auto sm:min-h-[200px] bg-discovery-beige-100'
        }
      >
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
            loading="lazy"
            sizes={
              isGrid
                ? '(max-width: 1024px) 100vw, 33vw'
                : '(max-width: 640px) 100vw, 256px'
            }
            quality={80}
          />
        )}
      </div>
      <div className="flex flex-col flex-1 p-6 sm:p-8">
        <time dateTime={post.publishedAt} className="text-sm text-discovery-grey mb-2">
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
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-discovery-beige-100 text-discovery-black/80"
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
  );
}
