// Password hashing for admin accounts.
//
// PBKDF2-SHA256 via the Web Crypto API — the same code path runs on
// Node.js (local dev / sandbox preview) and Cloudflare Workers
// (production), with no native modules and no extra dependencies.
//
// Stored format: pbkdf2$<iterations>$<saltHex>$<hashHex>

const ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTES = 16;

const encoder = new TextEncoder();

function subtle(): SubtleCrypto {
  const c = globalThis.crypto;
  if (!c?.subtle) {
    throw new Error("Web Crypto is unavailable in this runtime");
  }
  return c.subtle;
}

function randomSalt(): string {
  const bytes = new Uint8Array(SALT_BYTES);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function derive(password: string, saltHex: string, iterations: number): Promise<string> {
  const keyMaterial = await subtle().importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const bits = await subtle().deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    KEY_LENGTH_BITS
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomSalt();
  const hash = await derive(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

/**
 * Constant-time verification: compare hex digests without an early exit on
 * the first mismatching byte.
 */
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!password || !stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = parts[2];
  const expected = parts[3];
  if (!Number.isInteger(iterations) || iterations < 1000 || !/^[0-9a-f]{32}$/.test(salt)) {
    return false;
  }
  const actual = await derive(password, salt, iterations);
  return safeEqualHex(actual, expected);
}

/** Password policy: 8+ characters, at least one letter and one digit. */
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("Use at least 8 characters.");
  if (!/[a-zA-Z]/.test(password)) issues.push("Include at least one letter.");
  if (!/[0-9]/.test(password)) issues.push("Include at least one number.");
  return issues;
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(username);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}
