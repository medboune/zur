import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie, clearAdminCookie } from "@/lib/auth";
import { ensureAdminUser, findAdminByUsername } from "@/lib/admin-users";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Brute-force resistance, two buckets:
// - per IP:           10 attempts / 15 minutes
// - per username:      5 attempts / 15 minutes (slower, targeted guessing)
// plus a small constant delay on every failure so timing cannot be used
// as an oracle.
const LOGIN_LIMIT_IP = 10;
const LOGIN_LIMIT_USER = 5;
const LOGIN_WINDOW_SECONDS = 15 * 60;

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const ipLimiter = await rateLimit("login", ip, LOGIN_LIMIT_IP, LOGIN_WINDOW_SECONDS);
  if (!ipLimiter.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts — wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(LOGIN_WINDOW_SECONDS) } }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  let username = "";
  let password = "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    username = String(body?.username ?? "");
    password = String(body?.password ?? "");
  } else {
    const form = await req.formData().catch(() => null);
    username = String(form?.get("username") ?? "");
    password = String(form?.get("password") ?? "");
  }
  username = username.trim().toLowerCase();

  // Same generic error for every failure path — never reveal which field
  // was wrong, and never reveal whether the username exists.
  const deny = async () => {
    await new Promise((r) => setTimeout(r, 350 + Math.floor(Math.random() * 250)));
    return NextResponse.json(
      { ok: false, error: "Incorrect username or password." },
      { status: 401 }
    );
  };

  if (!username || !password) return deny();

  const userLimiter = await rateLimit("loginu", username, LOGIN_LIMIT_USER, LOGIN_WINDOW_SECONDS);
  if (!userLimiter.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts — wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(LOGIN_WINDOW_SECONDS) } }
    );
  }

  // Seed the initial account from the environment on an empty table.
  await ensureAdminUser().catch(() => null);

  const user = await findAdminByUsername(username);
  if (!user) return deny();

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return deny();

  await setAdminCookie(user.id, user.passwordHash);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
