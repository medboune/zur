import { db } from "@/lib/db";
import { fileExtension, ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/form-schemas";
import { putAttachment } from "@/lib/storage";
import { randomUUID } from "crypto";
import type { Lead, Prisma } from "@prisma/client";

// Attachments are stored through the storage abstraction (R2 in production,
// uploads-private/ locally) and are served ONLY through the authenticated
// admin route /api/admin/attachments/[id]. See src/lib/storage.ts.

export type LeadType = "SOURCING" | "SURPLUS_SINGLE" | "SURPLUS_LIST";

export class SubmissionError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status = 400, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

function referencePrefix(type: LeadType): string {
  return type === "SOURCING" ? "REQ" : "SUR";
}

export async function saveAttachment(
  file: File,
  type: LeadType
): Promise<{ name: string; storedPath: string; size: number; contentType: string }> {
  const allowed = ALLOWED_EXTENSIONS[type];
  const ext = fileExtension(file.name);
  if (!allowed.includes(ext)) {
    throw new SubmissionError(
      `File type ".${ext || "?"}" is not accepted here. Allowed: ${allowed.join(", ")}.`
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new SubmissionError("File is larger than 10 MB. Split the file or contact us by email.");
  }
  const safeBase = file.name
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(-120);
  const key = `attachments/${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}`;
  const contentType = file.type || "application/octet-stream";
  await putAttachment(key, new Uint8Array(await file.arrayBuffer()), contentType);
  // `storedPath` holds the storage key (R2 in production, uploads-private locally).
  return { name: file.name, storedPath: key, size: file.size, contentType };
}

// Idempotent lead creation: the client generates one token per form session,
// so double-clicks and retries after a dropped connection never create
// two requests.
export async function createLeadWithReference(
  token: string,
  type: LeadType,
  data: Prisma.LeadUncheckedCreateInput
): Promise<{ reference: string; duplicate: boolean; lead: Lead }> {
  if (!token || token.length < 8 || token.length > 64) {
    throw new SubmissionError("Invalid submission token. Reload the page and try again.");
  }

  const existing = await db.lead.findUnique({ where: { submissionToken: token } });
  if (existing) return { reference: existing.reference, duplicate: true, lead: existing };

  const created = await db.lead.create({
    data: {
      ...data,
      type,
      submissionToken: token,
      reference: `TMP-${randomUUID().slice(0, 12)}`,
    },
  });

  const reference = `${referencePrefix(type)}-${String(created.id).padStart(4, "0")}`;
  try {
    const updated = await db.lead.update({ where: { id: created.id }, data: { reference } });
    return { reference, duplicate: false, lead: updated };
  } catch {
    // Extremely unlikely; the row still exists and is recoverable by token.
    return { reference: created.reference, duplicate: false, lead: created };
  }
}
