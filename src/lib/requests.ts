import { db } from "@/lib/db";
import { fileExtension, ALLOWED_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/form-schemas";
import { putAttachment } from "@/lib/storage";
import { randomUUID } from "crypto";
import { requestReference } from "@/lib/reference";
import type { Lead, Prisma } from "@prisma/client";

// Attachments are stored through the storage abstraction (R2 in production,
// uploads-private/ locally) and are served ONLY through the authenticated
// admin route /api/admin/attachments/[id]. See src/lib/storage.ts.

export type LeadType = "SOURCING" | "SURPLUS_SINGLE" | "SURPLUS_LIST";

/**
 * Content sniffing: the file's magic bytes must match its extension.
 * Blocks renamed executables/scripts (e.g. an .exe renamed to .pdf).
 */
const MAGIC_SIGNATURES: Record<string, (b: Uint8Array) => boolean> = {
  pdf: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46, // %PDF
  png: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50, // WEBP
  // OOXML containers (docx, xlsx) are ZIP archives
  docx: (b) => b[0] === 0x50 && b[1] === 0x4b,
  xlsx: (b) => b[0] === 0x50 && b[1] === 0x4b,
  // Legacy OLE2 compound files (doc, xls)
  doc: (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
  xls: (b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
};

// Declared content types we never accept, whatever the extension.
const BLOCKED_MIME = /^(text\/html|application\/xhtml\+xml|application\/javascript|text\/javascript|application\/ecmascript)/i;

function sniffOk(ext: string, bytes: Uint8Array): boolean {
  const check = MAGIC_SIGNATURES[ext];
  // csv / txt have no signature — anything readable as text is accepted.
  if (!check) return true;
  return check(bytes);
}

export class SubmissionError extends Error {
  status: number;
  field?: string;
  constructor(message: string, status = 400, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
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
  const declaredType = file.type || "application/octet-stream";
  if (BLOCKED_MIME.test(declaredType)) {
    throw new SubmissionError("This file type is not accepted. Upload a document, spreadsheet or image.");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!sniffOk(ext, bytes)) {
    // The content does not match the extension — treat as a bad upload, not an attack.
    throw new SubmissionError(
      `This file's content does not look like a real .${ext} file. Re-save or export it and upload again.`
    );
  }
  const safeBase = file.name
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(-120);
  const key = `attachments/${Date.now()}-${randomUUID().slice(0, 8)}-${safeBase}`;
  await putAttachment(key, bytes, declaredType);
  // `storedPath` holds the storage key (R2 in production, uploads-private locally).
  return { name: file.name, storedPath: key, size: file.size, contentType: declaredType };
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

  // The public reference is random (see lib/reference.ts), so it is chosen
  // before the insert; the unique index catches the rare collision.
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = requestReference(type);
    try {
      const lead = await db.lead.create({
        data: { ...data, type, submissionToken: token, reference },
      });
      return { reference, duplicate: false, lead };
    } catch (err) {
      lastError = err;
      // A concurrent retry with the same token won the race → idempotent replay.
      const raced = await db.lead.findUnique({ where: { submissionToken: token } });
      if (raced) return { reference: raced.reference, duplicate: true, lead: raced };
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not allocate a reference number.");
}

