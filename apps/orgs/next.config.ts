import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/orgs",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/orgs",
        permanent: false,
        basePath: false,
      },
      {
        source: "/dashboard/members/parents",
        destination: "/dashboard/members",
        permanent: true,
      },
      {
        source: "/dashboard/members/instructors",
        destination: "/dashboard/instructors",
        permanent: true,
      },
    ];
  },
  transpilePackages: [
    "@kifolio/database",
    "@kifolio/db-types",
    "@kifolio/emails",
    "@kifolio/supabase",
    "@kifolio/ui",
    "@kifolio/utils",
  ],
};

export default nextConfig;
