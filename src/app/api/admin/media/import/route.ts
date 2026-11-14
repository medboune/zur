import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { commonsCaption, fetchRemoteImage, importCommonsImage, saveListingImage } from "@/lib/media";

// Admin-only bulk photo import. Body:
//   { "items": [ { "reference": "EQ-0002", "commons": "File:X.jpg", "note": "…" },
//                { "slug": "…", "url": "https://…/photo.jpg", "caption": "…" } ],
//     "dryRun": false }
// "commons" items are licence-checked against the Commons API and get an
// attribution caption automatically. Each item is processed independently.
export const dynamic = "force-dynamic";

type Item = {
  reference?: string;
  slug?: string;
  commons?: string;
  url?: string;
  caption?: string;
  note?: string;
};

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // CSRF: same-origin JSON only.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ error: "Cross-origin request refused" }, { status: 403 });
  }
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) {
    return NextResponse.json({ error: "Send JSON" }, { status: 415 });
  }

  let body: { items?: Item[]; dryRun?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const items = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
  if (items.length === 0) return NextResponse.json({ error: "No items" }, { status: 400 });

  const results: Array<Record<string, unknown>> = [];
  for (const item of items) {
    const label = item.reference || item.slug || "?";
    try {
      const listing = await db.equipment.findFirst({
        where: item.reference ? { reference: String(item.reference) } : { slug: String(item.slug ?? "") },
        select: { id: true, slug: true, reference: true },
      });
      if (!listing) throw new Error("Listing not found");

      let path: string;
      let caption: string | null = item.caption?.trim() || null;
      let source: string;
      if (item.commons) {
        if (body.dryRun) {
          results.push({ ref: label, ok: true, dryRun: true });
          continue;
        }
        const out = await importCommonsImage(item.commons, listing.slug);
        path = out.path;
        caption = caption ?? commonsCaption(out.file, item.note);
        source = out.file.pageUrl;
      } else if (item.url) {
        if (body.dryRun) {
          results.push({ ref: label, ok: true, dryRun: true });
          continue;
        }
        path = await saveListingImage(await fetchRemoteImage(item.url), listing.slug);
        source = item.url;
      } else {
        throw new Error("Give either commons or url");
      }

      await db.equipment.update({
        where: { id: listing.id },
        data: {
          image: path,
          ...(caption ? { imageCaption: caption.slice(0, 300) } : {}),
          updatedAt: new Date(),
        },
      });
      results.push({ ref: listing.reference, ok: true, image: path, caption, source });
    } catch (err) {
      results.push({ ref: label, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  revalidatePath("/admin/equipment");
  revalidatePath("/equipment");
  revalidatePath("/");
  return NextResponse.json({ results });
}
