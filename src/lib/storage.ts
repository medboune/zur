import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Attachment storage, one API for two runtimes:
//
// - Cloudflare Workers (production): the R2 bucket bound as "BUCKET" in
//   wrangler.jsonc. Attachments never live in /public; the only way to read
//   one is the authenticated admin route.
// - Local development / sandbox: the uploads-private/ directory on disk.
//
// Keys are storage-relative, e.g. "attachments/1731400000-ab12cd34-list.csv".
// Rows written before this abstraction stored absolute filesystem paths;
// those are still honoured by the local branch for backwards compatibility.

export const UPLOAD_DIR = path.join(process.cwd(), "uploads-private");

interface R2Like {
  put(
    key: string,
    data: Uint8Array,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<{
    arrayBuffer(): Promise<ArrayBuffer>;
    httpMetadata?: { contentType?: string };
    httpEtag?: string;
  } | null>;
}

function getBucket(): R2Like | null {
  try {
    // Throws outside the Workers/OpenNext runtime → local disk mode.
    const { env } = getCloudflareContext();
    const bucket = (env as unknown as { BUCKET?: R2Like }).BUCKET;
    return bucket ?? null;
  } catch {
    return null;
  }
}

export async function putAttachment(
  key: string,
  data: Uint8Array,
  contentType?: string
): Promise<void> {
  const bucket = getBucket();
  if (bucket) {
    await bucket.put(key, data, contentType ? { httpMetadata: { contentType } } : undefined);
    return;
  }
  const full = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
}

export async function getAttachment(key: string): Promise<Uint8Array | null> {
  const bucket = getBucket();
  if (bucket) {
    const object = await bucket.get(key);
    if (!object) return null;
    return new Uint8Array(await object.arrayBuffer());
  }
  try {
    // Legacy rows stored absolute paths; new rows store relative keys.
    const full = key.startsWith(path.sep) ? key : path.join(UPLOAD_DIR, key);
    return new Uint8Array(await readFile(full));
  } catch {
    return null;
  }
}

/* ── Public media (listing photos) ────────────────────────────────────────
 * Same bucket, separate "media/" prefix. Only keys under media/ are ever
 * served publicly (src/app/media/[...key]/route.ts); attachments/ stays
 * private behind the admin route above.
 */

export const MEDIA_PREFIX = "media/";

export async function putMedia(key: string, data: Uint8Array, contentType: string): Promise<void> {
  if (!key.startsWith(MEDIA_PREFIX)) throw new Error("media keys must start with media/");
  const bucket = getBucket();
  if (bucket) {
    await bucket.put(key, data, {
      // Keys are unique per upload, so the object never changes.
      httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
    });
    return;
  }
  const full = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
}

export async function getMedia(
  key: string
): Promise<{ bytes: Uint8Array; contentType?: string; etag?: string } | null> {
  if (!key.startsWith(MEDIA_PREFIX)) return null;
  const bucket = getBucket();
  if (bucket) {
    const object = await bucket.get(key);
    if (!object) return null;
    return {
      bytes: new Uint8Array(await object.arrayBuffer()),
      contentType: object.httpMetadata?.contentType,
      etag: object.httpEtag,
    };
  }
  try {
    return { bytes: new Uint8Array(await readFile(path.join(UPLOAD_DIR, key))) };
  } catch {
    return null;
  }
}
