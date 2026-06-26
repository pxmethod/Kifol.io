import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When Vercel deploys from the monorepo root (not apps/web), emit .next at repo root.
  ...(process.env.VERCEL_MONOREPO_ROOT ? { distDir: "../../.next" } : {}),
  transpilePackages: [
    "@kifolio/database",
    "@kifolio/db-types",
    "@kifolio/emails",
    "@kifolio/supabase",
    "@kifolio/ui",
    "@kifolio/utils",
  ],
  images: {
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  async rewrites() {
    return [
      {
        source: '/p/:shortId',
        destination: '/p/:shortId',
        has: [
          {
            type: 'host',
            value: 'my.kifol.io',
          },
        ],
      },
      {
        source: '/preview/:portfolioId',
        destination: '/preview/:portfolioId',
        has: [
          {
            type: 'host',
            value: 'my.kifol.io',
          },
        ],
      },
    ];
  },
  
  async redirects() {
    return [];
  },
};

export default nextConfig;
