import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SECTORS, showSampleListings } from "@/lib/site";
import { equipmentVisibilityFilter } from "@/lib/equipment";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/equipment`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/request-equipment`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sell`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sell/single`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/sell/list`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...SECTORS.map((s) => ({
      url: `${base}/sectors/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  const items = await db.equipment.findMany({
    where: equipmentVisibilityFilter(),
    select: { slug: true, updatedAt: true },
  });

  return [
    ...staticRoutes,
    ...items.map((item) => ({
      url: `${base}/equipment/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
