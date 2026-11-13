import { PrismaClient } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";

// Two runtimes, one exported client:
//
// - Cloudflare Workers (production): PrismaClient driven by the D1 database
//   binding via the OpenNext context. The Workers build generates the client
//   with `prisma generate --no-engine` (see the `cf:build` script), so no
//   native engine binaries ship with the Worker.
// - Local development / sandbox preview: classic PrismaClient over the
//   SQLite file configured in DATABASE_URL (.env), exactly as before.
//
// IMPORTANT: client creation is deferred to the first query through a Proxy,
// because `getCloudflareContext()` is only valid inside a request — never at
// module scope, and never during `next build`. Importing this module must
// stay side-effect free.

let cached: PrismaClient | undefined;

function createDb(): PrismaClient {
  try {
    // Throws outside the Workers/OpenNext runtime (local dev, build) —
    // the catch falls back to the local SQLite client below.
    const { env } = getCloudflareContext();
    const d1 = (env as unknown as { DB?: unknown }).DB;
    if (d1) {
      return new PrismaClient({ adapter: new PrismaD1(d1 as Parameters<typeof PrismaD1>[0]) });
    }
    console.warn("[db] Cloudflare context present but no DB binding. env keys:", env ? Object.keys(env).join(",") : "none");
  } catch (err) {
    console.warn("[db] getCloudflareContext failed:", err instanceof Error ? err.message : String(err));
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

function getDb(): PrismaClient {
  if (!cached) cached = createDb();
  return cached;
}

// Lazy forwarder: every property access resolves against the real client,
// created on first use inside a request context.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getDb();
    const value = Reflect.get(client, prop, client) as unknown;
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
}) as PrismaClient;

// For type-only consumers (seed scripts, etc.).
export type DbClient = PrismaClient;
