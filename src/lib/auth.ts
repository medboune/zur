import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const COOKIE_NAME = "znx_admin";
const SESSION_HOURS = 12;

// Per-isolate fallback secret (production only, when ADMIN_SESSION_SECRET is
// unset): generated once per module instance so tokens verify within the
// isolate's lifetime. Setting ADMIN_SESSION_SECRET is still strongly
// recommended so sessions survive isolate restarts.
let cachedFallbackSecret: string | null = null;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    if (!cachedFallbackSecret) {
      cachedFallbackSecret = createHmac("sha256", "isolate-key")
        .update(`${process.pid}:${Date.now()}:${Math.random()}`)
        .digest("hex");
    }
    return cachedFallbackSecret;
  }
  return "zuronix-dev-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Version stamp of a stored password hash — changes when the password does. */
export function passwordVersion(passwordHash: string): string {
  return createHmac("sha256", "pw-version").update(passwordHash).digest("hex").slice(0, 12);
}

export interface AdminSessionUser {
  id: number;
  username: string;
  email: string;
}

/**
 * Session token: `${userId}.${pwVersion}.${expires}.${signature}`.
 * - userId ties the token to one admin account.
 * - pwVersion is derived from the stored password hash, so changing the
 *   password ends every session issued before the change.
 */
export function createSessionToken(
  userId: number,
  passwordHash: string
): { token: string; maxAgeSeconds: number } {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = `${userId}.${passwordVersion(passwordHash)}.${expires}`;
  return { token: `${payload}.${sign(payload)}`, maxAgeSeconds: SESSION_HOURS * 3600 };
}

export function verifySessionToken(token: string | undefined | null): {
  userId: number;
  pwVersion: string;
} | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userIdRaw, pwVersion, expires, sig] = parts;
  const userId = Number(userIdRaw);
  if (!Number.isInteger(userId) || userId <= 0) return null;
  if (!/^[0-9a-f]{12}$/.test(pwVersion)) return null;
  const expected = sign(`${userIdRaw}.${pwVersion}.${expires}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const expiresMs = Number(expires);
  if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) return null;
  return { userId, pwVersion };
}

async function resolveSession(): Promise<AdminSessionUser | null> {
  const store = await cookies();
  const session = verifySessionToken(store.get(COOKIE_NAME)?.value);
  if (!session) return null;
  const row = await db.adminUser.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, email: true, passwordHash: true },
  });
  if (!row) return null;
  if (passwordVersion(row.passwordHash) !== session.pwVersion) return null;
  return { id: row.id, username: row.username, email: row.email };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await resolveSession()) !== null;
}

/** The signed-in admin account, or null. */
export async function getAdminSession(): Promise<AdminSessionUser | null> {
  return resolveSession();
}

export async function setAdminCookie(userId: number, passwordHash: string): Promise<void> {
  const store = await cookies();
  const { token, maxAgeSeconds } = createSessionToken(userId, passwordHash);
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
