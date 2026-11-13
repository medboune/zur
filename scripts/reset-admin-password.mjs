// Dev/ops helper: reset the local admin password hash directly.
// The Account Settings form enforces the password policy (8+ chars, letter +
// number); this script bypasses validation for environment recovery only.
//   node scripts/reset-admin-password.mjs <username> <new-password>
import { PrismaClient } from "@prisma/client";

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error("usage: node scripts/reset-admin-password.mjs <username> <new-password>");
  process.exit(1);
}

const iterations = 100_000;
const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
const keyMaterial = await globalThis.crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  { name: "PBKDF2" },
  false,
  ["deriveBits"]
);
const bits = await globalThis.crypto.subtle.deriveBits(
  { name: "PBKDF2", hash: "SHA-256", salt, iterations },
  keyMaterial,
  256
);
const hash = Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, "0")).join("");
const passwordHash = `pbkdf2$${iterations}$${saltHex}$${hash}`;

const prisma = new PrismaClient();
const user = await prisma.adminUser.update({
  where: { username: username.toLowerCase() },
  data: { passwordHash, updatedAt: new Date() },
});
console.log(`password reset for ${user.username} (${user.email})`);
await prisma.$disconnect();
