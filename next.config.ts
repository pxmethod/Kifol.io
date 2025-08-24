import type { NextConfig } from "next";

// next.config.ts
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:portfolioId',
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
    return [
      {
        source: '/',
        destination: 'https://kifol.io',
        has: [
          {
            type: 'host',
            value: 'my.kifol.io',
          },
        ],
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
