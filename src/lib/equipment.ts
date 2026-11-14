import { db } from "@/lib/db";
import { showSampleListings } from "@/lib/site";
import type { Prisma } from "@prisma/client";
import { normalizeReference } from "@/lib/reference";

// Normalization makes search tolerant to spaces, dashes, casing and
// punctuation: "dfd 6361", "DFD-6361" and "DFD6361" all match.
export function normalizeSearch(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function buildSearchKey(...parts: (string | null | undefined)[]): string {
  return normalizeSearch(parts.filter(Boolean).join(" "));
}

export function equipmentVisibilityFilter(): Prisma.EquipmentWhereInput {
  const base: Prisma.EquipmentWhereInput = { isPublished: true };
  if (!showSampleListings()) base.isSample = false;
  return base;
}

/**
 * Paginated catalog query (server-side): returns one page of listings plus
 * the total matching count so the UI can render exact page numbers.
 */
export async function listEquipmentPaged(opts: {
  query?: string;
  /** Category filter: one term or several joined by "|" (any may match). */
  category?: string;
  skip: number;
  take: number;
}) {
  const and: Prisma.EquipmentWhereInput[] = [];
  if (opts.query) {
    // A pasted reference number (e.g. ZX-7K4M9Q from an email) finds its listing.
    and.push({
      OR: [
        { searchKey: { contains: normalizeSearch(opts.query) } },
        { category: { contains: opts.query.slice(0, 60) } },
        { reference: normalizeReference(opts.query) },
      ],
    });
  }
  const terms = (opts.category ?? "")
    .split("|")
    .map((t) => t.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 4);
  if (terms.length) and.push({ OR: terms.map((t) => ({ category: { contains: t } })) });
  const where: Prisma.EquipmentWhereInput = { ...equipmentVisibilityFilter(), ...(and.length ? { AND: and } : {}) };
  const [items, total] = await Promise.all([
    db.equipment.findMany({
      where,
      orderBy: [{ sector: "asc" }, { manufacturer: "asc" }],
      skip: opts.skip,
      take: opts.take,
    }),
    db.equipment.count({ where }),
  ]);
  return { items, total };
}

export async function listEquipment(limit = 60) {
  return db.equipment.findMany({
    where: equipmentVisibilityFilter(),
    orderBy: [{ sector: "asc" }, { manufacturer: "asc" }],
    take: limit,
  });
}

export async function getEquipmentBySlug(slug: string) {
  const item = await db.equipment.findUnique({ where: { slug } });
  if (!item || !item.isPublished) return null;
  if (item.isSample && !showSampleListings()) return null;
  return item;
}

export async function featuredEquipment(limit = 3) {
  return db.equipment.findMany({
    where: equipmentVisibilityFilter(),
    orderBy: { lastVerifiedAt: "desc" },
    take: limit,
  });
}

export type EquipmentSpec = { label: string; value: string };

export function parseSpecs(json: string): EquipmentSpec[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
