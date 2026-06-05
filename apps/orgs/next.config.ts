import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/orgs",
  transpilePackages: [
    "@kifolio/database",
    "@kifolio/db-types",
    "@kifolio/supabase",
    "@kifolio/ui",
    "@kifolio/utils",
  ],
};

export default nextConfig;
