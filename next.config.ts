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
  // preview origin pattern fixes it. The production domains are listed as a
  // belt-and-suspenders safety net (on Cloudflare the origin matches the
  // host anyway, so they are normally no-ops).
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.space-z.ai",
        "zuronix.com",
        "www.zuronix.com",
        "staging.zuronix.com",
      ],
    },
  },
  // Canonical host: 301 www.zuronix.com → zuronix.com (path + query kept).
  // Runs inside the app, so no extra Cloudflare dashboard rule is needed.
  // Host-scoped: never fires on localhost, the preview, or staging.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.zuronix.com" }],
        destination: "https://zuronix.com/:path*",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
