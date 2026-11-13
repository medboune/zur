import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

// Admin account management. The AdminUser table is seeded lazily: the first
// sign-in attempt (or the settings page) creates the initial account from
// the environment when the table is empty, so an existing deployment with
// only ADMIN_PASSWORD set keeps working unchanged.

export interface AdminUserRow {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

function seedUsername(): string {
  return (process.env.ADMIN_USERNAME || "admin").toLowerCase();
}

function seedEmail(): string {
  return (process.env.ADMIN_EMAIL || "admin@zuronix.com").toLowerCase();
}

function seedPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw) return pw;
  // The historical dev fallback is only allowed outside production so a
  // misconfigured production deploy cannot be signed into with a known
  // default credential.
  if (process.env.NODE_ENV === "production") return null;
  return "zuronix-admin";
}

/**
 * Create the initial admin account if none exists. Returns the seeded row,
 * or null when the table is empty and seeding is not possible (production
 * without ADMIN_PASSWORD).
 */
export async function ensureAdminUser(): Promise<AdminUserRow | null> {
  const existing = await db.adminUser.count();
  if (existing > 0) {
    return db.adminUser.findFirst({ orderBy: { id: "asc" } }) as Promise<AdminUserRow>;
  }
  const password = seedPassword();
  if (!password) {
    console.error(
      "[admin-users] No admin account exists and ADMIN_PASSWORD is not set. " +
        "Set it (e.g. `wrangler secret put ADMIN_PASSWORD`) to create the first account."
    );
    return null;
  }
  const passwordHash = await hashPassword(password);
  return db.adminUser.create({
    data: { username: seedUsername(), email: seedEmail(), passwordHash },
  }) as Promise<AdminUserRow>;
}

export async function findAdminByUsername(username: string): Promise<AdminUserRow | null> {
  const row = await db.adminUser.findUnique({ where: { username: username.toLowerCase() } });
  return (row as AdminUserRow) ?? null;
}

export async function findAdminByEmail(email: string): Promise<AdminUserRow | null> {
  const row = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  return (row as AdminUserRow) ?? null;
}

export async function usernameTaken(username: string, exceptId?: number): Promise<boolean> {
  const row = await db.adminUser.findUnique({ where: { username: username.toLowerCase() } });
  return !!row && row.id !== exceptId;
}

export async function emailTaken(email: string, exceptId?: number): Promise<boolean> {
  const row = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  return !!row && row.id !== exceptId;
}
