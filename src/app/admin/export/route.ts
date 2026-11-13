import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // RFC 4180: quote cells containing commas, quotes or newlines.
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * CSV export of all requests for the team — auth-gated like every admin page.
 * GET /admin/export
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });

  const header = [
    "Reference", "Type", "Status", "Company", "Contact", "Email", "Phone",
    "Equipment", "Manufacturer", "Model", "Quantity", "Needed by", "Budget",
    "Delivery location", "Condition", "Item location", "Year", "Asking price",
    "List summary", "Attachment", "Related ref", "Admin notes", "Created at",
  ];
  const rows = leads.map((l) =>
    [
      l.reference, l.type, l.status, l.company, l.contactName, l.email, l.phone,
      l.equipment, l.manufacturer, l.model, l.quantity, l.neededBy, l.budget,
      l.deliveryLocation, l.condition, l.itemLocation, l.year, l.askingPrice,
      l.listSummary, l.attachmentName, l.relatedRef,
      (l.adminNotes ?? "").replace(/\r?\n/g, " | "),
      l.createdAt.toISOString(),
    ].map(csvCell).join(",")
  );

  const csv = "\uFEFF" + [header.map(csvCell).join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zuronix-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
