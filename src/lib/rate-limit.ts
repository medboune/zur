import { db } from "@/lib/db";

/**
 * Fixed-window rate limiter backed by D1 (SQLite locally).
 *
 * Design notes:
 * - One row per (bucket, identifier, window). Cheap: a single indexed read,
 *   then either an upsert (new window) or an increment.
 * - FAILS OPEN: if the limiter itself errors (missing table, D1 hiccup),
 *   the request is allowed. Availability of the intake forms matters more
 *   than perfect enforcement — layers 1-3 are validation, honeypot, and
 *   idempotency tokens.
 * - Rows are pruned opportunistically (1 in ~20 calls) — the table stays
 *   in the low hundreds of rows.
 */

const PRUNE_PROBABILITY = 0.05;
const MAX_AGE_SECONDS = 24 * 3600;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  const key = `${bucket}:${identifier}`;

  try {
    if (Math.random() < PRUNE_PROBABILITY) {
      await db.rateLimit
        .deleteMany({ where: { windowStart: { lt: now - MAX_AGE_SECONDS } } })
        .catch(() => undefined);
    }

    const row = await db.rateLimit.findUnique({ where: { key } });

    if (!row || row.windowStart < windowStart) {
      // New window (or first hit): (re)set the counter.
      await db.rateLimit.upsert({
        where: { key },
        create: { key, windowStart, count: 1 },
        update: { windowStart, count: 1 },
      });
      return { allowed: true, remaining: limit - 1 };
    }

    if (row.count >= limit) {
      return { allowed: false, remaining: 0 };
    }

    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return { allowed: true, remaining: Math.max(0, limit - row.count - 1) };
  } catch (err) {
    // Fail open — see design notes.
    console.warn("[rate-limit] failing open:", err instanceof Error ? err.message : err);
    return { allowed: true, remaining: limit };
  }
}

/** Client IP as seen by Cloudflare (or a generic fallback in dev). */
export function clientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
