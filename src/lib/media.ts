import { putMedia, MEDIA_PREFIX } from "@/lib/storage";

// Listing photos: validation, storage in R2 under media/, and importing from
// a URL or a Wikimedia Commons file page (with licence check + attribution).

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const USER_AGENT = "ZuronixMediaImport/1.0 (https://zuronix.com; listing photo import)";

export type ImageKind = { ext: "jpg" | "png" | "webp"; contentType: string };

/** Identify JPEG / PNG / WebP by magic bytes — never trust names or headers. */
export function sniffImage(b: Uint8Array): ImageKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (
    b.length >= 8 &&
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 // WEBP
  ) {
    return { ext: "webp", contentType: "image/webp" };
  }
  return null;
}

/** Site image paths an admin may set on a listing. */
export function isAllowedImagePath(p: string): boolean {
  if (p.includes("..") || p.includes("//")) return false;
  return (
    /^\/images\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(p) ||
    /^\/media\/[a-z0-9][a-z0-9/_.-]*\.(jpg|jpeg|png|webp)$/i.test(p)
  );
}

function keyBase(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "photo"
  );
}

/** Validate bytes and store them; returns the public path (/media/…). */
export async function saveListingImage(bytes: Uint8Array, nameHint: string): Promise<string> {
  if (bytes.length === 0) throw new Error("The image file is empty.");
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Images must be 8 MB or smaller.");
  const kind = sniffImage(bytes);
  if (!kind) throw new Error("Only JPEG, PNG or WebP images are accepted.");
  const rand = Math.random().toString(36).slice(2, 8);
  const key = `${MEDIA_PREFIX}equipment/${keyBase(nameHint)}-${Date.now().toString(36)}${rand}.${kind.ext}`;
  await putMedia(key, bytes, kind.contentType);
  return `/${key}`;
}

/** Download an image over HTTPS with size and type limits. */
export async function fetchRemoteImage(url: string): Promise<Uint8Array> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Image URL is not a valid URL.");
  }
  if (parsed.protocol !== "https:") throw new Error("Image URL must start with https://");

  const res = await fetch(parsed.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "image/jpeg,image/png,image/webp,image/*;q=0.8" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Image download failed (HTTP ${res.status}).`);
  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared > MAX_IMAGE_BYTES) throw new Error("Remote image is larger than 8 MB.");
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("Remote image is larger than 8 MB.");
  if (!sniffImage(bytes)) throw new Error("The URL did not return a JPEG, PNG or WebP image.");
  return bytes;
}

/* ── Wikimedia Commons ─────────────────────────────────────────────────── */

export interface CommonsFile {
  title: string;
  imageUrl: string;
  pageUrl: string;
  artist: string;
  license: string;
  licenseUrl: string | null;
}

/** "File:X.jpg", "X.jpg" or a commons.wikimedia.org/wiki/File:… URL → "File:X.jpg". */
export function commonsTitleFrom(input: string): string | null {
  let s = input.trim();
  const m = s.match(/^https?:\/\/commons(?:\.m)?\.wikimedia\.org\/wiki\/(File:[^?#]+)/i);
  if (m) {
    try {
      s = decodeURIComponent(m[1]);
    } catch {
      s = m[1];
    }
  }
  s = s.replace(/_/g, " ");
  if (!/^file:/i.test(s)) {
    if (/^https?:/i.test(s)) return null;
    s = `File:${s}`;
  }
  s = "File:" + s.slice(5).trim();
  return /\.(jpe?g|png|webp)$/i.test(s) ? s : null;
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Free licences we accept for public listing photos (no NC / ND / GFDL-only). */
export function isFreeLicense(shortName: string): boolean {
  const s = shortName.trim();
  if (/\b(nc|nd)\b/i.test(s) || /non-?commercial|no-?deriv/i.test(s)) return false;
  return (
    /^cc0\b/i.test(s) ||
    /^public domain\b/i.test(s) ||
    /^pd\b/i.test(s) ||
    /^cc[ -]by(-sa)?[ -]\d(\.\d)?\b/i.test(s)
  );
}

type CommonsApi = {
  query?: {
    pages?: Array<{
      title?: string;
      missing?: boolean;
      imageinfo?: Array<{
        thumburl?: string;
        url?: string;
        descriptionurl?: string;
        extmetadata?: Record<string, { value?: string } | undefined>;
      }>;
    }>;
  };
};

/** Parse a Commons imageinfo API response (exported for tests). */
export function parseCommonsResponse(json: CommonsApi, title: string): CommonsFile {
  const page = json.query?.pages?.[0];
  if (!page || page.missing) throw new Error(`Commons file not found: ${title}`);
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`Commons returned no image info for ${title}`);
  const meta = info.extmetadata ?? {};
  const license = plainText(meta.LicenseShortName?.value ?? "");
  if (!license || !isFreeLicense(license)) {
    throw new Error(`Licence "${license || "unknown"}" is not a free licence we can use (${title}).`);
  }
  if ((meta.NonFree?.value ?? "").toLowerCase() === "true") {
    throw new Error(`Commons marks ${title} as non-free.`);
  }
  const artist = plainText(meta.Artist?.value ?? "").slice(0, 80) || "Unknown author";
  const imageUrl = info.thumburl || info.url;
  if (!imageUrl) throw new Error(`No image URL for ${title}`);
  return {
    title: page.title ?? title,
    imageUrl,
    pageUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
    artist,
    license,
    licenseUrl: meta.LicenseUrl?.value ?? null,
  };
}

export async function resolveCommonsFile(input: string, width = 1280): Promise<CommonsFile> {
  const title = commonsTitleFrom(input);
  if (!title) throw new Error("Not a Commons JPEG/PNG/WebP file name or link.");
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|NonFree",
    iiurlwidth: String(width),
    titles: title,
  }).toString();
  const res = await fetch(api.toString(), {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Commons API error (HTTP ${res.status}).`);
  return parseCommonsResponse((await res.json()) as CommonsApi, title);
}

export function commonsCaption(file: CommonsFile, note?: string | null): string {
  const lead = (note?.trim() || "Representative photo — similar unit, not the actual asset.").replace(/\s+$/, "");
  const credit = `Photo: ${file.artist}, ${file.license}, via Wikimedia Commons.`;
  return `${lead} ${credit}`.slice(0, 300);
}

/** Fetch a Commons file (trying smaller standard widths if needed) and store it. */
export async function importCommonsImage(
  input: string,
  nameHint: string
): Promise<{ path: string; file: CommonsFile }> {
  let lastError: unknown = null;
  for (const width of [1280, 960]) {
    try {
      const file = await resolveCommonsFile(input, width);
      const bytes = await fetchRemoteImage(file.imageUrl);
      const path = await saveListingImage(bytes, nameHint);
      return { path, file };
    } catch (err) {
      lastError = err;
      // Licence / not-found problems will not change with a smaller width.
      if (err instanceof Error && /licence|not found|non-free|Not a Commons/i.test(err.message)) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Commons import failed.");
}
