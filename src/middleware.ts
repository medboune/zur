import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers for every dynamic response (pages + API).
 * Static assets get their own headers via public/_headers (Workers
 * static assets natively supports that file).
 *
 * Deliberately NOT set here:
 * - Content-Security-Policy: Next.js inline bootstrap scripts would break
 *   without a nonce infrastructure; the other headers below provide the
 *   meaningful protection for this site's threat model.
 * - Strict-Transport-Security is kept to 180 days without includeSubDomains
 *   until the domain setup is final, then it can be raised.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=15552000",
};

/** Scheme the visitor actually used, as reported by Cloudflare's edge. */
function visitorScheme(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim().toLowerCase();
  const visitor = request.headers.get("cf-visitor");
  if (visitor) {
    try {
      return String(JSON.parse(visitor).scheme || "").toLowerCase() || null;
    } catch {
      return null;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  // Plain-HTTP visits to the production domain go to HTTPS. Only the public
  // hostnames are matched, so local development and internal requests are
  // unaffected.
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (visitorScheme(request) === "http" && (host === "zuronix.com" || host.endsWith(".zuronix.com"))) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = host;
    url.port = "";
    const status = request.method === "GET" || request.method === "HEAD" ? 301 : 308;
    return NextResponse.redirect(url, status);
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  // Skip the immutable build assets and public images — the asset layer
  // serves them without the Worker, and public/_headers covers them.
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico).*)"],
};
