import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "znx_admin";
const SESSION_HOURS = 12;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "zuronix-dev-secret-change-me";
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "zuronix-admin";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(): { token: string; maxAgeSeconds: number } {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = `admin.${expires}`;
  return { token: `${payload}.${sign(payload)}`, maxAgeSeconds: SESSION_HOURS * 3600 };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expires, sig] = parts;
  if (role !== "admin") return false;
  const expected = sign(`${role}.${expires}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(expires) > Date.now();
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  const { token, maxAgeSeconds } = createSessionToken();
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
