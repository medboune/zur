import { SITE, conditionLabel } from "@/lib/site";

// Central SEO helpers: metadata builders and Schema.org JSON-LD.
//
// Everything renders server-side — no JavaScript is required to read the
// facts on a page, which is what classic crawlers AND answer engines
// (ChatGPT Search, AI Overviews, Copilot) rely on to quote a site.

/** Absolute URL for canonical/OG/sitemap entries (APP_URL is per-environment). */
export function absoluteUrl(path: string): string {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isIndexable(): boolean {
  return process.env.ALLOW_INDEXING !== "false";
}

/* ── Titles & descriptions ─────────────────────────────────────────────── */

const TITLE_MAX = 60;
const DESC_MAX = 158;

export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,;:.\-]+$/, "")}…`;
}

export interface SeoEquipmentLike {
  manufacturer: string;
  model: string;
  partNumber?: string | null;
  category?: string | null;
  description: string;
  conditionKey: string;
  quantity: number;
  location: string;
  priceType: string;
  price?: string | null;
  currency?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isSample: boolean;
}

/**
 * Listing page title: the admin's override when present, otherwise a
 * generated form of "Manufacturer Model — condition, location".
 */
export function equipmentSeoTitle(item: SeoEquipmentLike): string {
  if (item.seoTitle) return clampText(item.seoTitle, TITLE_MAX + 10);
  const base = `${item.manufacturer} ${item.model}`;
  const tail = [conditionLabel(item.conditionKey), item.location].filter(Boolean).join(", ");
  return clampText(tail ? `${base} — ${tail}` : base, TITLE_MAX + 10);
}

/** Listing meta description: override, or a description-derived summary. */
export function equipmentSeoDescription(item: SeoEquipmentLike): string {
  if (item.seoDescription) return clampText(item.seoDescription, DESC_MAX + 20);
  const head = item.description.replace(/\s+/g, " ").trim();
  const qty = item.quantity > 1 ? `${item.quantity} units. ` : "";
  return clampText(`${qty}${head}`, DESC_MAX + 20);
}

/* ── JSON-LD builders ──────────────────────────────────────────────────── */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: absoluteUrl("/"),
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.zip,
      addressCountry: "US",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: SITE.name,
    description: SITE.description,
    url: absoluteUrl("/"),
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
  };
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(entries: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/**
 * Product + Offer for one equipment listing. Only real, confirmable facts
 * are stated: price and currency appear when the listing has them, and
 * availability is "InStock" only while the listing is published.
 */
export function productJsonLd(
  item: SeoEquipmentLike & { slug: string; reference: string; image?: string | null; lastVerifiedAt?: Date | null }
) {
  const hasPrice = item.priceType !== "QUOTE" && !!item.price;
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${item.manufacturer} ${item.model}`,
    sku: item.reference,
    description: equipmentSeoDescription(item),
    category: item.category ?? undefined,
    brand: { "@type": "Brand", name: item.manufacturer },
  };
  if (item.partNumber) product.mpn = item.partNumber;
  if (item.image) product.image = absoluteUrl(item.image);

  product.offers = {
    "@type": "Offer",
    url: absoluteUrl(`/equipment/${item.slug}`),
    priceCurrency: item.currency || "USD",
    availability: "https://schema.org/InStock",
    itemCondition: conditionSchemaUri(item.conditionKey),
    seller: { "@id": `${absoluteUrl("/")}#organization` },
    ...(hasPrice
      ? {
          price: Number(item.price),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: Number(item.price),
            priceCurrency: item.currency || "USD",
            ...(item.priceType === "UNIT"
              ? { referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "C62" } }
              : {}),
          },
        }
      : {}),
  };
  return product;
}

function conditionSchemaUri(key: string): string {
  switch (key) {
    case "NEW":
      return "https://schema.org/NewCondition";
    case "REFURBISHED":
      return "https://schema.org/RefurbishedCondition";
    case "FOR_PARTS":
      return "https://schema.org/DamagedCondition";
    case "AS_IS":
      return "https://schema.org/UsedCondition";
    default:
      return "https://schema.org/UsedCondition";
  }
}

/** ItemList for the paginated catalog. */
export function itemListJsonLd(
  items: { slug: string; manufacturer: string; model: string }[],
  page: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(page > 1 ? { name: `Equipment catalog — page ${page}` } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/equipment/${item.slug}`),
      name: `${item.manufacturer} ${item.model}`,
    })),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqJsonLd(faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Render helper: <script type="application/ld+json"> with safe JSON. */
export function jsonLdScript(data: unknown) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  };
}
