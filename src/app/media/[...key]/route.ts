import { NextRequest, NextResponse } from "next/server";
import { getMedia, MEDIA_PREFIX } from "@/lib/storage";
import { sniffImage } from "@/lib/media";

// Public listing photos stored in R2 under media/. Only that prefix is
// reachable here; request attachments (attachments/) are never served.
export const dynamic = "force-dynamic";

const SEGMENT = /^[a-z0-9][a-z0-9._-]{0,120}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  if (!Array.isArray(key) || key.length === 0 || key.length > 4 || !key.every((s) => SEGMENT.test(s) && !s.includes(".."))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const object = await getMedia(MEDIA_PREFIX + key.join("/"));
  if (!object) return new NextResponse("Not found", { status: 404 });

  // Serve only real images, with the type derived from the bytes.
  const kind = sniffImage(object.bytes);
  if (!kind) return new NextResponse("Not found", { status: 404 });

  if (object.etag && req.headers.get("if-none-match") === object.etag) {
    return new NextResponse(null, { status: 304 });
  }
  return new NextResponse(object.bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": kind.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
      ...(object.etag ? { ETag: object.etag } : {}),
    },
  });
}
