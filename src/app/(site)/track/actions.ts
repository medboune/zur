"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkReference, normalizeReference } from "@/lib/reference";

export type TrackResult =
  | { ok: false; error: string }
  | {
      ok: true;
      reference: string;
      kind: "sourcing" | "surplus";
      status: string;
      summary: string;
      submittedAt: string;
      updatedAt: string;
    };

const NOT_FOUND =
  "We couldn't find a request with that reference number and email. Check both, or contact us and we'll look it up.";

// Customers look up their own request with the reference number plus the
// email they submitted with. Both must match; the response never says which
// one was wrong, and lookups are rate-limited per IP.
export async function lookupRequest(_prev: TrackResult | null, formData: FormData): Promise<TrackResult> {
  const ip = clientIp(await headers());
  const limiter = await rateLimit("track", ip, 12, 15 * 60);
  if (!limiter.allowed) {
    return { ok: false, error: "Too many lookups from this connection. Try again in 15 minutes." };
  }

  const reference = normalizeReference(String(formData.get("reference") ?? "").slice(0, 40));
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  if (!reference || !email) return { ok: false, error: "Enter your reference number and email." };

  const check = checkReference(reference);
  if (check === "mistyped") {
    return {
      ok: false,
      error: "That reference number has a mistyped character. It looks like ZQ-261113-7K4MQ — copy it from your confirmation.",
    };
  }
  if (reference.startsWith("ZX-")) {
    return {
      ok: false,
      error: "That is a listing number. Search it in the equipment catalog, or enter the reference you received after submitting a request.",
    };
  }

  const lead = await db.lead.findUnique({ where: { reference } }).catch(() => null);
  if (!lead || lead.email.trim().toLowerCase() !== email) return { ok: false, error: NOT_FOUND };

  const summary =
    lead.type === "SOURCING"
      ? [lead.manufacturer, lead.model].filter(Boolean).join(" ") || lead.equipment || "Equipment request"
      : lead.type === "SURPLUS_LIST"
        ? lead.listSummary || "Equipment list"
        : [lead.manufacturer, lead.model].filter(Boolean).join(" ") || lead.equipment || "Equipment offer";

  return {
    ok: true,
    reference: lead.reference,
    kind: lead.type === "SOURCING" ? "sourcing" : "surplus",
    status: lead.status,
    summary: summary.slice(0, 140),
    submittedAt: new Date(lead.createdAt).toISOString(),
    updatedAt: new Date(lead.updatedAt).toISOString(),
  };
}
