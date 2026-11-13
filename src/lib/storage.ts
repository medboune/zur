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
  put(key: string, data: Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
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
