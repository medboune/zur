import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie, clearAdminCookie, verifyAdminPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Brute-force resistance: 10 attempts per IP per 15 minutes, plus a small
// constant delay on every failure so timing cannot be used as an oracle.
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_SECONDS = 15 * 60;

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limiter = await rateLimit("login", ip, LOGIN_LIMIT, LOGIN_WINDOW_SECONDS);
  if (!limiter.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts — wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(LOGIN_WINDOW_SECONDS) } }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  let password = "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    password = String(body?.password ?? "");
  } else {
    const form = await req.formData().catch(() => null);
    password = String(form?.get("password") ?? "");
  }

  if (!password || !verifyAdminPassword(password)) {
    // Equalize the response time of the failure path.
    await new Promise((r) => setTimeout(r, 350 + Math.floor(Math.random() * 250)));
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
