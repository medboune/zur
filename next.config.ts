import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Our images are pre-optimized assets; skip Next's image optimizer so the
  // site runs on Cloudflare Workers with zero extra configuration or cost.
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
