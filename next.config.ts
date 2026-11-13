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
  // Behind the z.ai preview gateway, the browser's `origin` is the public
  // preview host (…space-z.ai) while the gateway rewrites `x-forwarded-host`
  // to an internal hostname. Next.js CSRF protection aborts every Server
  // Action POST on that mismatch ("Invalid Server Actions request", E80),
  // which broke all admin form submissions in the preview. Allowlisting the
  // preview origin pattern fixes it; on Cloudflare the origin matches the
  // host as usual, so this entry is a no-op in production.
  experimental: {
    serverActions: {
      allowedOrigins: ["*.space-z.ai"],
    },
  },
};

export default nextConfig;
