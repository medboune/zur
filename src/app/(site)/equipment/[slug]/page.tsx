import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ClipboardCheck,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  ShieldQuestion,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConditionBadge } from "@/components/site/condition-badge";
import { VerifiedDate } from "@/components/site/equipment-card";
import { BUYER_ASSURANCES, SITE, getSector } from "@/lib/site";
import { getEquipmentBySlug, parseSpecs } from "@/lib/equipment";
import {
  breadcrumbJsonLd,
  equipmentSeoDescription,
  equipmentSeoTitle,
  jsonLdScript,
  productJsonLd,
} from "@/lib/seo";

// Always render on request: the database (D1 in production) must not be
// queried during the Cloudflare Workers build.
export const dynamic = "force-dynamic";

type EquipmentItem = NonNullable<Awaited<ReturnType<typeof getEquipmentBySlug>>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getEquipmentBySlug(slug);
  if (!item) return {};
  const title = equipmentSeoTitle(item);
  const description = equipmentSeoDescription(item);
  return {
    title,
    description,
    alternates: { canonical: `/equipment/${item.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(item.image ? { images: [{ url: item.image, alt: `${item.manufacturer} ${item.model}` }] } : {}),
    },
    twitter: {
      card: item.image ? "summary_large_image" : "summary",
      title,
      description,
      ...(item.image ? { images: [item.image] } : {}),
    },
  };
}

function priceDisplay(
  item: NonNullable<Awaited<ReturnType<typeof getEquipmentBySlug>>>
): string | null {
  if (item.priceType === "QUOTE" || !item.price) return null;
  const num = Number(item.price);
  const amount = Number.isFinite(num)
    ? num.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : item.price;
  const cur = item.currency === "USD" ? "$" : `${item.currency ?? ""} `;
  return item.priceType === "UNIT"
    ? `${cur}${amount} per unit`
    : `${cur}${amount} for the lot${item.quantity > 1 ? ` (${item.quantity} units)` : ""}`;
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getEquipmentBySlug(slug);
  if (!item) notFound();

  const sector = getSector(item.sector);
  const specs = parseSpecs(item.specs);
  const price = priceDisplay(item);
  const requestHref = `/request-equipment?ref=${encodeURIComponent(item.reference)}&model=${encodeURIComponent(
    `${item.manufacturer} ${item.model}`
  )}${item.quantity > 1 ? `&qty=${item.quantity}` : ""}`;
  const testReportHref = `/request-equipment?ref=${encodeURIComponent(item.reference)}&model=${encodeURIComponent(
    `${item.manufacturer} ${item.model}`
  )}&note=${encodeURIComponent("Please send the test report and full configuration details.")}`;

  const breadcrumbEntries = [
    { name: "Home", path: "/" },
    { name: "Equipment", path: "/equipment" },
    ...(sector ? [{ name: sector.name, path: `/sectors/${sector.slug}` }] : []),
    { name: `${item.manufacturer} ${item.model}`, path: `/equipment/${item.slug}` },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <script {...jsonLdScript(productJsonLd(item))} />
      <script {...jsonLdScript(breadcrumbJsonLd(breadcrumbEntries))} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/equipment" className="hover:text-foreground hover:underline">
              Equipment
            </Link>
          </li>
          {sector && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/sectors/${sector.slug}`}
                  className="hover:text-foreground hover:underline"
                >
                  {sector.shortName}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground/80">
            {item.manufacturer} {item.model}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Main column */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ConditionBadge conditionKey={item.conditionKey} />
            {item.isSample && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                Demo listing — sample record
              </span>
            )}
            <span className="text-sm text-muted-foreground">{item.category}</span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {item.manufacturer} <span className="text-part font-medium">{item.model}</span>
          </h1>
          {item.partNumber && (
            <p className="mt-2 text-sm text-muted-foreground">
              Part number: <span className="text-part text-foreground/80">{item.partNumber}</span>
            </p>
          )}

          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[4/3] w-full bg-muted">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.imageCaption || `${item.manufacturer} ${item.model}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
            </div>
            {item.imageCaption && (
              <p className="border-t border-border bg-secondary/40 px-4 py-2.5 text-xs text-muted-foreground">
                {item.imageCaption}
              </p>
            )}
          </div>

          <section aria-labelledby="description-heading" className="mt-10">
            <h2 id="description-heading" className="text-xl font-semibold">
              About this equipment
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{item.description}</p>
          </section>

          <section aria-labelledby="condition-heading" className="mt-8">
            <h2 id="condition-heading" className="text-xl font-semibold">
              Condition &amp; testing
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldQuestion className="size-4 text-primary" aria-hidden="true" />
                  Condition
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <ConditionBadge conditionKey={item.conditionKey} className="mb-2" />
                  {item.conditionNote ?? "Condition verified by Zuronix before quoting. Ask for photos of this unit."}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardCheck className="size-4 text-primary" aria-hidden="true" />
                  Testing
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.testSummary ?? "Not tested — ask us what is known about this asset and we will find out."}
                </p>
                {item.testSummary && (
                  <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-primary">
                    <Link href={testReportHref}>Request the test report</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>

          {specs.length > 0 && (
            <section aria-labelledby="specs-heading" className="mt-8">
              <h2 id="specs-heading" className="text-xl font-semibold">
                Specifications
              </h2>
              <dl className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
                {specs.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={`grid grid-cols-[minmax(120px,35%)_1fr] gap-3 px-5 py-3.5 text-sm ${
                      i % 2 === 0 ? "bg-secondary/30" : ""
                    }`}
                  >
                    <dt className="font-medium text-foreground/70">{spec.label}</dt>
                    <dd className="text-foreground">{spec.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-xs text-muted-foreground">
                Specifications verified by Zuronix. Ask for the full configuration sheet and
                serial numbers before you commit.
              </p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reference
            </p>
            <p className="text-part mt-1 text-lg font-semibold">{item.reference}</p>
            <Separator className="my-4" />
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Condition</dt>
                <dd className="text-right font-medium">
                  <ConditionBadge conditionKey={item.conditionKey} />
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Quantity</dt>
                <dd className="text-right font-medium">
                  {item.quantity > 1 ? `${item.quantity} units` : "1 unit"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="flex items-center gap-1.5 text-right font-medium">
                  <MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  {item.location}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="text-right font-medium">
                  <VerifiedDate date={item.lastVerifiedAt} />
                  {!item.lastVerifiedAt && <span>Confirm on request</span>}
                </dd>
              </div>
              <Separator className="my-1" />
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="text-right font-medium">
                  {price ?? "By quote"}
                  {price && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {item.includesShipping ? "Includes shipping" : "Excludes shipping"}
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <Button asChild size="lg" className="mt-6 w-full">
              <Link href={requestHref}>
                Request a quote
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            {item.testSummary && (
              <Button asChild variant="outline" size="lg" className="mt-3 w-full">
                <Link href={testReportHref}>
                  <FileText className="size-4" aria-hidden="true" />
                  Request test report
                </Link>
              </Button>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Your quote is a firm offer from Zuronix with condition, warranty cover and
              shipping stated. Nothing is charged online.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-5">
            <p className="text-sm font-semibold">Questions first?</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                <a href={`tel:${SITE.phoneHref}`} className="text-part hover:text-foreground">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
                  {SITE.email}
                </a>
              </li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Mon–Fri, Pacific Time. Reference <span className="text-part">{item.reference}</span>{" "}
              gets you straight to the file.
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Buying from Zuronix</p>
            <ul className="mt-3 space-y-3">
              {BUYER_ASSURANCES.map((a) => {
                const Icon = ASSURANCE_ICONS[a.key];
                return (
                  <li key={a.key} className="flex gap-2.5">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-sm leading-snug">
                      <span className="font-medium">{a.title}.</span>{" "}
                      <span className="text-muted-foreground">{a.short}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

const ASSURANCE_ICONS = {
  seller: Receipt,
  verified: BadgeCheck,
  documented: Camera,
  cover: ShieldCheck,
  logistics: Truck,
  payment: Landmark,
} as const;
