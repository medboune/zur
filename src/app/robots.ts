import type { MetadataRoute } from "next";

// Always render on request: the per-environment APP_URL and ALLOW_INDEXING
// values (Workers vars) must be read at runtime, not baked in at build time.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL || "http://localhost:3000";
  const indexable = process.env.ALLOW_INDEXING !== "false";

  if (!indexable) {
    // Staging and any other non-production environment opts out of indexing
    // entirely (robots.txt + a noindex meta tag in the root layout).
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
