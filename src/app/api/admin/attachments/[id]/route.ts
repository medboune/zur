import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAttachment } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead?.attachmentPath || !lead.attachmentName) {
    return NextResponse.json({ error: "No attachment on this request" }, { status: 404 });
  }

  try {
    // Storage key (R2 in production, uploads-private locally). Legacy rows
    // stored absolute filesystem paths — getAttachment handles both.
    const bytes = await getAttachment(lead.attachmentPath);
    if (!bytes) {
      return NextResponse.json({ error: "File missing in storage" }, { status: 410 });
    }
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": lead.attachmentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${lead.attachmentName.replace(/["\\]/g, "_")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing in storage" }, { status: 410 });
  }
}
