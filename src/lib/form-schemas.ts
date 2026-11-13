import { z } from "zod";

// Shared vocabulary
const conditionValues = [
  "NEW",
  "USED_TESTED",
  "USED_UNTESTED",
  "REFURBISHED",
  "AS_IS",
  "FOR_PARTS",
] as const;

const email = z
  .string()
  .trim()
  .min(3, "Enter your work email.")
  .max(200, "Email is too long.")
  .email("Enter a valid email address.");

const phone = z
  .string()
  .trim()
  .max(40, "Phone number is too long.")
  .optional()
  .or(z.literal(""));

const company = z
  .string()
  .trim()
  .min(2, "Enter your company name.")
  .max(160, "Company name is too long.");

const contactName = z
  .string()
  .trim()
  .min(2, "Enter your name.")
  .max(120, "Name is too long.");

const text = (label: string, max = 4000) =>
  z.string().trim().max(max, `${label} is too long.`).optional().or(z.literal(""));

const qty = z.coerce
  .number({ message: "Enter a quantity." })
  .int("Quantity must be a whole number.")
  .min(1, "Quantity must be at least 1.")
  .max(100000, "Quantity is too large.");

// ---------- Sourcing request (buyer) ----------
export const sourcingSchema = z.object({
  equipment: z
    .string()
    .trim()
    .min(5, "Describe the equipment you need, or enter a model or part number.")
    .max(4000, "Description is too long."),
  manufacturer: text("Manufacturer", 160),
  model: text("Model / part number", 160),
  quantity: qty,
  configuration: text("Configuration"),
  deliveryLocation: text("Delivery location", 200),
  neededBy: text("Needed by", 60),
  budget: text("Budget", 120),
  notes: text("Notes"),
  company,
  contactName,
  email,
  phone,
});
export type SourcingInput = z.infer<typeof sourcingSchema>;

// ---------- Surplus — single item ----------
export const surplusSingleSchema = z.object({
  manufacturer: z
    .string()
    .trim()
    .min(1, "Enter the manufacturer.")
    .max(160, "Manufacturer is too long."),
  model: z
    .string()
    .trim()
    .min(1, "Enter the model.")
    .max(160, "Model is too long."),
  quantity: qty,
  condition: z.enum(conditionValues, { message: "Select the equipment condition." }),
  itemLocation: z
    .string()
    .trim()
    .min(2, "Enter where the equipment is located.")
    .max(200, "Location is too long."),
  year: text("Year", 20),
  configuration: text("Configuration"),
  askingPrice: text("Asking price", 120),
  notes: text("Notes"),
  company,
  contactName,
  email,
  phone,
});
export type SurplusSingleInput = z.infer<typeof surplusSingleSchema>;

// ---------- Surplus — list upload ----------
export const surplusListBaseSchema = z.object({
  listSummary: text("List summary", 500),
  pastedList: text("Pasted list", 20000),
  itemLocation: text("Equipment location", 200),
  notes: text("Notes"),
  company,
  contactName,
  email,
  phone,
});

// A list submission is valid with EITHER an uploaded file OR pasted rows.
// The strict schema enforces pasted rows; the API uses the base schema
// when a file is attached, and the strict one otherwise.
export const surplusListSchema = surplusListBaseSchema.refine(
  (v) => (v.pastedList ?? "").trim().length >= 20,
  { message: "Attach a CSV/Excel file, or paste at least a few rows of your list." }
);
export type SurplusListInput = z.infer<typeof surplusListSchema>;

// ---------- Attachment policy ----------
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  // Sourcing: spec sheets, drawings, RFQs
  SOURCING: ["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt", "png", "jpg", "jpeg", "webp"],
  // Single item: photos + inspection report
  SURPLUS_SINGLE: ["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx", "txt"],
  // List: inventory files
  SURPLUS_LIST: ["csv", "xlsx", "xls", "pdf", "txt"],
};

export function fileExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Flatten a ZodError into { field: message } for inline display.
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
