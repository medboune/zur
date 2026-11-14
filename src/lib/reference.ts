// Public reference numbers for listings and customer requests.
//
// The database id stays the internal key; the reference is what customers
// see. References carry no sequence information, so nobody can infer how
// many listings or requests exist:
//
//   Listing:            ZX-7K4M9Q          random body + check character
//   Sourcing request:   ZQ-261113-7K4MQ    Pacific-time date + random + check
//   Surplus offer:      ZS-261113-P2W8C
//
// Alphabet: Crockford-style base32 without I, L, O, U, so references read
// unambiguously over the phone. The last character is a Luhn mod-32 check,
// which catches every single mistyped character and most swapped pairs.
// Randomness comes from crypto.getRandomValues; the column's unique index
// plus a retry loop at insert time guarantee uniqueness.

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const N = ALPHABET.length; // 32

export type ReferenceKind = "LISTING" | "SOURCING" | "SURPLUS";

const PREFIX: Record<ReferenceKind, string> = {
  LISTING: "ZX",
  SOURCING: "ZQ",
  SURPLUS: "ZS",
};

function randomChars(count: number): string {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  // 256 is a multiple of 32, so the modulo introduces no bias.
  return Array.from(bytes, (b) => ALPHABET[b % N]).join("");
}

/** Luhn mod-N check character for a string over ALPHABET. */
export function checkChar(payload: string): string {
  let factor = 2;
  let sum = 0;
  for (let i = payload.length - 1; i >= 0; i--) {
    const code = ALPHABET.indexOf(payload[i]);
    if (code < 0) throw new Error(`Invalid reference character: ${payload[i]}`);
    let addend = factor * code;
    factor = factor === 2 ? 1 : 2;
    addend = Math.floor(addend / N) + (addend % N);
    sum += addend;
  }
  return ALPHABET[(N - (sum % N)) % N];
}

function checkOk(payloadWithCheck: string): boolean {
  if (payloadWithCheck.length < 2) return false;
  const body = payloadWithCheck.slice(0, -1);
  if ([...payloadWithCheck].some((c) => !ALPHABET.includes(c))) return false;
  return checkChar(body) === payloadWithCheck.slice(-1);
}

/** YYMMDD in Pacific time (the business runs on Pacific time). */
export function pacificDateStamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}`;
}

export function listingReference(): string {
  const body = randomChars(5);
  return `${PREFIX.LISTING}-${body}${checkChar(body)}`;
}

export function requestReference(type: string, date = new Date()): string {
  const prefix = type === "SOURCING" ? PREFIX.SOURCING : PREFIX.SURPLUS;
  const stamp = pacificDateStamp(date);
  const rand = randomChars(4);
  return `${prefix}-${stamp}-${rand}${checkChar(stamp + rand)}`;
}

const LISTING_RE = /^ZX-[0-9A-Z]{6}$/;
const REQUEST_RE = /^Z[QS]-\d{6}-[0-9A-Z]{5}$/;
const LEGACY_RE = /^(EQ|REQ|SUR)-0*(\d{1,7})$/;

/**
 * Clean up what a person typed: case, spaces, look-alike letters
 * (O→0, I/L→1) and missing hyphens. Unknown shapes are returned
 * upper-cased and trimmed so legacy references still match.
 */
export function normalizeReference(input: string): string {
  const raw = input.trim().toUpperCase();
  const compact = raw
    .replace(/[^0-9A-Z]/g, "")
    .replace(/^([A-Z]{2})(.*)$/, (_m, p: string, rest: string) => p + rest.replace(/O/g, "0").replace(/[IL]/g, "1"));
  if (/^ZX[0-9A-Z]{6}$/.test(compact)) return `ZX-${compact.slice(2)}`;
  if (/^Z[QS]\d{6}[0-9A-Z]{5}$/.test(compact)) {
    return `${compact.slice(0, 2)}-${compact.slice(2, 8)}-${compact.slice(8)}`;
  }
  return raw;
}

export type ReferenceCheck = "valid" | "mistyped" | "legacy" | "unknown";

export function checkReference(ref: string): ReferenceCheck {
  if (LISTING_RE.test(ref)) return checkOk(ref.slice(3)) ? "valid" : "mistyped";
  if (REQUEST_RE.test(ref)) return checkOk(ref.slice(3, 9) + ref.slice(10)) ? "valid" : "mistyped";
  if (LEGACY_RE.test(ref)) return "legacy";
  return "unknown";
}

/** Old sequential references (EQ-0007, REQ-0012, SUR-0003) → database id. */
export function legacyReferenceId(input: string): number | null {
  const m = input.trim().toUpperCase().match(LEGACY_RE);
  return m ? Number(m[2]) : null;
}

export function isLegacyReference(ref: string): boolean {
  return LEGACY_RE.test(ref.trim().toUpperCase());
}
