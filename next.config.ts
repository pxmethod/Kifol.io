import type { NextConfig } from "next";

// next.config.ts
const nextConfig = {
  images: {
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
