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

export function middleware(_request: NextRequest) {
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
