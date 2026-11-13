"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { REQUEST_STATUSES } from "@/lib/site";
import { buildSearchKey } from "@/lib/equipment";

export type ActionResult = { ok: boolean; error?: string };

async function requireAdmin(): Promise<string | null> {
  if (!(await isAdminAuthenticated())) {
    return "Your session expired — sign in again.";
  }
  return null;
}

/* ── Leads ─────────────────────────────────────────────────────────────── */

export async function updateLead(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const authError = await requireAdmin();
  if (authError) return { ok: false, error: authError };

  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "");

  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Invalid request id." };
  if (!REQUEST_STATUSES.includes(status)) return { ok: false, error: "Invalid status." };

  const existing = await db.lead.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Request not found." };

  await db.lead.update({
    where: { id },
    data: {
      status,
      adminNotes: adminNotes.slice(0, 5000) || null,
    },
  });

  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteLead(formData: FormData): Promise<void> {
  const authError = await requireAdmin();
  if (authError) redirect("/admin/login");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await db.lead.delete({ where: { id } });
  revalidatePath("/admin");
  redirect("/admin");
}

/* ── Equipment ─────────────────────────────────────────────────────────── */

const SECTOR_KEYS = ["SEMICONDUCTOR", "DATACENTER", "INDUSTRIAL"] as const;
const CONDITION_KEYS = [
  "NEW",
  "USED_TESTED",
  "USED_UNTESTED",
  "REFURBISHED",
  "AS_IS",
  "FOR_PARTS",
] as const;
const PRICE_TYPES = ["QUOTE", "UNIT", "LOT"] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Parse "Label: value" lines from the admin textarea into specs JSON. */
function parseSpecsInput(raw: string): string {
  const specs = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      if (i === -1) return { label: line.slice(0, 60), value: "" };
      return { label: line.slice(0, i).trim().slice(0, 60), value: line.slice(i + 1).trim().slice(0, 300) };
    })
    .filter((s) => s.label);
  return JSON.stringify(specs);
}

const str = (fd: FormData, key: string): string => String(fd.get(key) ?? "").trim();
const optStr = (fd: FormData, key: string, max: number): string | null => {
  const v = str(fd, key).slice(0, max);
  return v || null;
};

export async function saveEquipment(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return { ok: false, error: authError };

  const idRaw = str(formData, "id");
  const id = idRaw ? Number(idRaw) : null;
  if (id !== null && (!Number.isInteger(id) || id <= 0)) {
    return { ok: false, error: "Invalid listing id." };
  }

  // ── Required fields ──
  const manufacturer = str(formData, "manufacturer").slice(0, 160);
  const model = str(formData, "model").slice(0, 160);
  const description = str(formData, "description").slice(0, 4000);
  const location = str(formData, "location").slice(0, 200);
  if (manufacturer.length < 2) return { ok: false, error: "Enter the manufacturer." };
  if (model.length < 1) return { ok: false, error: "Enter the model." };
  if (description.length < 20) return { ok: false, error: "Write a short description (at least 20 characters)." };
  if (location.length < 2) return { ok: false, error: "Enter the equipment location." };

  // ── Selects ──
  const sector = str(formData, "sector");
  if (!SECTOR_KEYS.includes(sector as (typeof SECTOR_KEYS)[number])) {
    return { ok: false, error: "Choose a sector." };
  }
  const conditionKey = str(formData, "conditionKey");
  if (!CONDITION_KEYS.includes(conditionKey as (typeof CONDITION_KEYS)[number])) {
    return { ok: false, error: "Choose the condition." };
  }
  const priceType = str(formData, "priceType");
  if (!PRICE_TYPES.includes(priceType as (typeof PRICE_TYPES)[number])) {
    return { ok: false, error: "Choose the price type." };
  }

  // ── Optional fields ──
  const quantityRaw = str(formData, "quantity");
  const quantity = quantityRaw ? Number(quantityRaw) : 1;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
    return { ok: false, error: "Quantity must be a whole number of at least 1." };
  }

  let price: string | null = null;
  const priceRaw = str(formData, "price").replace(/[,\s$]/g, "");
  if (priceType !== "QUOTE" && priceRaw) {
    const n = Number(priceRaw);
    if (!Number.isFinite(n) || n < 0 || n > 100_000_000) {
      return { ok: false, error: "Price must be a plain number, e.g. 4850." };
    }
    price = String(n);
  }

  const verifiedRaw = str(formData, "lastVerifiedAt");
  let lastVerifiedAt: Date | null = null;
  if (verifiedRaw) {
    const d = new Date(verifiedRaw);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "Verified date is not a valid date." };
    lastVerifiedAt = d;
  }

  const image = optStr(formData, "image", 300);
  if (image && !/^\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(image)) {
    return { ok: false, error: "Image must be a site path like /images/sample-vmc.jpg." };
  }

  const data = {
    manufacturer,
    model,
    partNumber: optStr(formData, "partNumber", 160),
    sector,
    category: optStr(formData, "category", 120) ?? "General",
    description,
    conditionKey,
    conditionNote: optStr(formData, "conditionNote", 500),
    quantity,
    location,
    lastVerifiedAt,
    priceType,
    price,
    currency: optStr(formData, "currency", 8) ?? "USD",
    includesShipping: formData.get("includesShipping") === "on",
    testSummary: optStr(formData, "testSummary", 2000),
    specs: parseSpecsInput(str(formData, "specs")),
    image,
    imageCaption: optStr(formData, "imageCaption", 300),
    isPublished: formData.get("isPublished") === "on",
    isSample: formData.get("isSample") === "on",
    searchKey: buildSearchKey(manufacturer, model, optStr(formData, "partNumber", 160), sector),
    updatedAt: new Date(),
  };

  // ── Slug: stable, unique ──
  const baseSlug = slugify(`${manufacturer} ${model}`) || `listing-${Date.now()}`;
  const existingBySlug = await db.equipment.findFirst({ where: { slug: baseSlug } });
  const slug = existingBySlug && existingBySlug.id !== id ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

  // ── Reference: EQ-#### sequence ──
  let reference = str(formData, "reference");
  if (!reference) {
    const last = await db.equipment.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
    reference = `EQ-${String((last?.id ?? 0) + 1).padStart(4, "0")}`;
  }
  const refClash = await db.equipment.findFirst({ where: { reference } });
  if (refClash && refClash.id !== id) {
    return { ok: false, error: `Reference ${reference} is already used by another listing.` };
  }

  try {
    if (id) {
      await db.equipment.update({ where: { id }, data: { ...data, reference, slug } });
    } else {
      await db.equipment.create({ data: { ...data, reference, slug } });
    }
  } catch (err) {
    console.error("[saveEquipment]", err);
    return { ok: false, error: "Could not save the listing — check the values and try again." };
  }

  revalidatePath("/admin/equipment");
  revalidatePath("/equipment");
  revalidatePath("/");
  redirect("/admin/equipment?saved=1");
}

export async function toggleEquipmentPublished(formData: FormData): Promise<void> {
  const authError = await requireAdmin();
  if (authError) redirect("/admin/login");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const item = await db.equipment.findUnique({ where: { id } });
  if (!item) return;

  await db.equipment.update({
    where: { id },
    data: { isPublished: !item.isPublished, updatedAt: new Date() },
  });
  revalidatePath("/admin/equipment");
  revalidatePath("/equipment");
  revalidatePath("/");
}

export async function deleteEquipment(formData: FormData): Promise<void> {
  const authError = await requireAdmin();
  if (authError) redirect("/admin/login");

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await db.equipment.delete({ where: { id } });
  revalidatePath("/admin/equipment");
  revalidatePath("/equipment");
  revalidatePath("/");
}
