import { db } from "@/lib/db";
import { showSampleListings } from "@/lib/site";
import type { Prisma } from "@prisma/client";

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

export async function searchEquipment(query: string, limit = 60) {
  const norm = normalizeSearch(query);
  if (!norm) {
    return db.equipment.findMany({
      where: equipmentVisibilityFilter(),
      orderBy: [{ sector: "asc" }, { manufacturer: "asc" }],
      take: limit,
    });
  }
  // Broad prefix/substring match on the normalized key.
  return db.equipment.findMany({
    where: { ...equipmentVisibilityFilter(), searchKey: { contains: norm } },
    orderBy: [{ sector: "asc" }, { manufacturer: "asc" }],
    take: limit,
  });
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
