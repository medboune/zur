import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Camera,
  Globe,
  Landmark,
  Mail,
  Phone,
  Receipt,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/site/search-box";
import { EquipmentCard } from "@/components/site/equipment-card";
import { CategoryTicker } from "@/components/site/category-ticker";
import {
  BRAND_DISCLAIMER,
  BRANDS,
  BUYER_ASSURANCES,
  SECTORS,
  SITE,
  SITE_ADDRESS_ONE_LINE,
} from "@/lib/site";
import { featuredEquipment } from "@/lib/equipment";
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

// Always render on request: the database (D1 in production) must not be
// queried during the Cloudflare Workers build.
export const dynamic = "force-dynamic";

const HERO_NOTES = ["Quotes within one business day", "Units verified before quoting", "Ships worldwide"];

const TRUST_POINTS = [
  { icon: Building2, title: "US supplier", body: `${SITE.address.city}, Washington` },
  { icon: Receipt, title: "One invoice", body: "Zuronix is the seller" },
  { icon: BadgeCheck, title: "Verified units", body: "Photos, serials, test results" },
  { icon: Globe, title: "Worldwide shipping", body: "Freight & export handled" },
];

const ASSURANCE_ICONS = {
  seller: Receipt,
  verified: BadgeCheck,
  documented: Camera,
  cover: ShieldCheck,
  logistics: Truck,
  payment: Landmark,
} as const;

const BUY_STEPS = [
  {
    title: "Tell us what you need",
    body: "Part number, quantity, configuration and delivery date — or pick a unit from the inventory.",
  },
  {
    title: "Get a firm quote",
    body: "Within one business day: price, condition grade, warranty cover, lead time and shipping.",
  },
  {
    title: "Approve the actual unit",
    body: "Photos, serial numbers and test results of the unit you are buying, before you pay.",
  },
  {
    title: "Pay and receive",
    body: "Bank wire to Zuronix. We pack, ship and track it to your dock, with the paperwork done.",
  },
];

const CONDITION_GRADES = [
  {
    grade: "New / unused",
    body: "Factory-sealed or never deployed. Packaging and labels as described in the quote.",
  },
  {
    grade: "Tested working",
    body: "Powered up and function-tested before sale. The test summary is on the listing — ask for the report.",
  },
  {
    grade: "Refurbished",
    body: "Restored or repaired to a stated standard. The refurbishment scope is documented in the quote.",
  },
  {
    grade: "As-is / for parts",
    body: "Sold in its current state with no operational warranty. Known history is noted where available.",
  },
];

const SELLER_POINTS = [
  "One list or one unit — CSV, Excel or a short form. No account needed.",
  "Serial numbers and asset lists stay private; nothing is published without your written approval.",
  "We handle buyers, payment and logistics. You are paid under a written agreement.",
];

export default async function HomePage() {
  const featured = await featuredEquipment(6);
  const heroListings = featured.slice(0, 3);

  return (
    <>
      <script {...jsonLdScript(organizationJsonLd())} />
      <script {...jsonLdScript(websiteJsonLd())} />

      {/* ── Hero — dark industrial photo, listings panel ─────────────────── */}
      <section className="relative overflow-hidden bg-brand-ink text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-60"
          />
          {/* Legibility: darken left→right and bottom */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/80 to-brand-ink/40"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-brand-ink via-transparent to-brand-ink/30"
            aria-hidden="true"
          />
          <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-5 pb-12 pt-10 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:py-24">
          <div className="min-w-0">
            <p className="eyebrow !text-[10px] !tracking-[0.12em] !text-white/60 sm:!text-[11px] sm:!tracking-[0.18em]">Data center · Semiconductor · Industrial</p>
            <h1 className="font-display mt-4 text-[2.35rem] font-extrabold leading-[1.04] tracking-tight sm:mt-5 sm:text-5xl lg:text-[3.4rem]">
              Equipment for data centers, fabs and factories.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 sm:mt-5 sm:text-lg">
              Zuronix supplies GPUs, servers, networking, semiconductor tools and industrial
              machinery — from available inventory or sourced to your exact part number. One
              quote, one contract, one invoice from a US supplier.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:flex sm:flex-row">
              <Button asChild size="lg" className="h-12 text-[15px] sm:h-10">
                <Link href="/equipment">
                  Browse inventory
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-white/5 text-[15px] text-white hover:bg-white/10 hover:text-white sm:h-10"
              >
                <Link href="/request-equipment">Request a quote</Link>
              </Button>
            </div>

            <div className="mt-6 max-w-xl sm:mt-8">
              <SearchBox />
            </div>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 sm:mt-6 sm:gap-x-6">
              {HERO_NOTES.map((note) => (
                <li
                  key={note}
                  className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-white/75 sm:text-xs"
                >
                  <span className="size-1 rounded-full bg-primary" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-white/60">
              Selling surplus equipment?{" "}
              <Link href="/sell" className="font-medium text-white underline-offset-4 hover:underline">
                Sell it through Zuronix →
              </Link>
            </p>
          </div>

          {/* Live listings panel — equipment for sale, with prices, right in the hero */}
          <aside
            aria-labelledby="hero-listings-heading"
            className="min-w-0 rounded-xl border border-white/15 bg-brand-ink/70 p-4 shadow-2xl backdrop-blur-md sm:p-6"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <h2 id="hero-listings-heading" className="text-sm font-semibold tracking-tight">
                <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-emerald-400 align-middle" aria-hidden="true" />
                Available now
              </h2>
              <Link
                href="/equipment"
                className="font-mono text-[11px] uppercase tracking-wider text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                All equipment
              </Link>
            </div>
            {heroListings.length > 0 ? (
              <ul className="divide-y divide-white/10">
                {heroListings.map((item) => {
                  const num = Number(item.price);
                  const priceLabel =
                    item.priceType === "QUOTE" || !item.price
                      ? "By quote"
                      : `${item.currency === "USD" ? "$" : (item.currency ?? "")}${Number.isFinite(num) ? num.toLocaleString("en-US") : item.price}${item.priceType === "UNIT" ? "/u" : "/lot"}`;
                  return (
                    <li key={item.id} className="group/li flex items-center gap-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {item.manufacturer} <span className="text-part font-medium">{item.model}</span>
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wider text-white/50">
                          {item.quantity > 1 ? `${item.quantity} units · ` : ""}
                          {item.location}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-semibold text-emerald-300">
                        {priceLabel}
                      </span>
                      <Link
                        href={`/request-equipment?ref=${encodeURIComponent(item.reference)}&model=${encodeURIComponent(`${item.manufacturer} ${item.model}`)}`}
                        className="shrink-0 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary"
                        aria-label={`Make an offer on ${item.manufacturer} ${item.model}`}
                      >
                        Offer
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm leading-relaxed text-white/60">
                Inventory moves fast and much of what we supply is sourced to order.
                <Link href="/request-equipment" className="mt-3 block font-semibold text-white underline-offset-4 hover:underline">
                  Request any model →
                </Link>
              </p>
            )}
            <p className="border-t border-white/10 pt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/40">
              Availability re-checked and dated on every listing
            </p>
          </aside>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────────────── */}
      <section aria-label="Why buyers work with Zuronix" className="border-b border-border bg-card">
        <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-5 px-5 py-6 sm:px-6 lg:grid-cols-4 lg:py-7">
          {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{title}</span>
                <span className="block text-xs leading-snug text-muted-foreground">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <CategoryTicker items={BRANDS} />

      {/* ── Inventory — full cards with price + offer ─────────────────────── */}
      {featured.length > 0 && (
        <section aria-labelledby="listings-heading" className="border-b border-border bg-secondary/30">
          <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14 lg:py-18">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">01 / Available now</p>
                <h2 id="listings-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Inventory ready to quote
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Condition, quantity, location and the date availability was last confirmed —
                  on every listing. Make an offer, or ask for photos and test results first.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/equipment">
                  View all inventory
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div
              className="no-scrollbar -mx-5 mt-7 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-1 sm:mx-0 sm:mt-8 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
              aria-label="Featured equipment"
            >
              {featured.map((item) => (
                <div key={item.id} className="w-[80%] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                  <EquipmentCard item={item} />
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground sm:hidden" aria-hidden="true">
              Swipe for more <ArrowRight className="size-3" />
            </p>
          </div>
        </section>
      )}

      {/* ── What we supply — sectors with category shortcuts ──────────────── */}
      <section aria-labelledby="supply-heading" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14 lg:py-18">
          <p className="eyebrow">02 / What we supply</p>
          <h2 id="supply-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Three sectors. One accountable supplier.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            From a single GPU to a production line: current and end-of-life equipment,
            new, refurbished and tested — supplied and invoiced by Zuronix.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
            {SECTORS.map((s, i) => (
              <article
                key={s.slug}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <Link
                  href={`/sectors/${s.slug}`}
                  className="relative block aspect-[2/1] overflow-hidden border-b border-border md:aspect-[16/10]"
                >
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span
                    className="absolute left-3 top-3 rounded bg-foreground/80 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-background backdrop-blur-sm"
                    aria-hidden="true"
                  >
                    0{i + 1}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold">
                    <Link href={`/sectors/${s.slug}`} className="hover:text-primary">
                      {s.title}
                    </Link>
                  </h3>
                  <ul className="mt-3 divide-y divide-border border-y border-border">
                    {s.supply.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="flex items-center justify-between gap-3 py-2.5 text-sm text-foreground/85 transition-colors hover:text-primary"
                        >
                          {c.label}
                          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/sectors/${s.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    All {s.shortName.toLowerCase()} equipment
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">{BRAND_DISCLAIMER}</p>
        </div>
      </section>

      {/* ── Why buy from Zuronix ─────────────────────────────────────────── */}
      <section aria-labelledby="why-heading" className="border-b border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14 lg:py-18">
          <p className="eyebrow">03 / Why Zuronix</p>
          <h2 id="why-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Buy used equipment like it&apos;s new procurement
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The same accountability you expect from a distributor — applied to tested,
            refurbished and hard-to-find equipment.
          </p>
          <ul className="mt-7 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {BUYER_ASSURANCES.map((a) => {
              const Icon = ASSURANCE_ICONS[a.key];
              return (
                <li key={a.key} className="flex min-w-0 gap-3.5 rounded-xl border border-border bg-card p-4 shadow-sm sm:gap-4 sm:p-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{a.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── How buying works ─────────────────────────────────────────────── */}
      <section aria-labelledby="how-heading" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14 lg:py-18">
          <p className="eyebrow">04 / How buying works</p>
          <h2 id="how-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            From part number to delivery in four steps
          </h2>
          <ol className="mt-7 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {BUY_STEPS.map((step, i) => (
              <li key={step.title} className="relative min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
                <span className="font-mono text-xs font-semibold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:flex">
            <Button asChild size="lg" className="h-12 sm:h-10">
              <Link href="/request-equipment">
                Request a quote
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 sm:h-10">
              <Link href="/track">Track an existing request</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Condition standards ──────────────────────────────────────────── */}
      <section aria-labelledby="condition-heading" className="border-b border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14 lg:py-18">
          <p className="eyebrow">05 / Condition grades</p>
          <h2 id="condition-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Condition stated plainly
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One letter in a model number or a different spindle size can decide whether a
            unit fits your line. Every listing and quote uses the same grades.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-5 lg:grid-cols-4">
            {CONDITION_GRADES.map((g) => (
              <div
                key={g.grade}
                className="min-w-0 rounded-xl border border-border border-t-2 border-t-primary bg-card p-4 shadow-sm sm:p-5"
              >
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px] sm:tracking-[0.18em]">
                  Grade
                </p>
                <h3 className="mt-2 font-semibold">{g.grade}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">{g.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl rounded-r-lg border-l-2 border-primary bg-primary/5 py-3 pl-4 text-sm leading-relaxed text-muted-foreground">
            We verify condition while preparing your quote, and every quote records what was
            confirmed, how, and on what date — together with the warranty cover that applies.
          </p>
        </div>
      </section>

      {/* ── For sellers — dark, warehouse ────────────────────────────────── */}
      <section aria-labelledby="sell-heading" className="relative overflow-hidden bg-brand-ink text-white">
        <div className="absolute inset-0">
          <Image src="/images/surplus-bg.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-ink via-brand-ink/70 to-brand-ink" aria-hidden="true" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:py-20">
          <p className="eyebrow !text-white/60">06 / Selling surplus</p>
          <h2 id="sell-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Decommissioning? Turn idle equipment into cash.
          </h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Retired GPU servers, idle machines, end-of-line tools. Send one list — our buyers
            are already looking for the same equipment you want to move.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-7">
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-5 text-emerald-300" aria-hidden="true" />
                How selling works
              </h3>
              <ul className="mt-4 space-y-3">
                {SELLER_POINTS.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-white/75">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-300" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Link
                href="/sell/single"
                className="group flex flex-col rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-primary/60 hover:bg-white/10"
              >
                <span className="font-semibold">Sell a single unit</span>
                <span className="mt-2 text-sm leading-relaxed text-white/65">
                  Manufacturer, model, quantity, condition, location. Photos and inspection
                  reports welcome.
                </span>
                <span className="mt-4 font-mono text-xs uppercase tracking-wider">
                  <span className="font-semibold text-white underline-offset-4 group-hover:underline">Open the form</span>{" "}
                  <span className="text-emerald-300" aria-hidden="true">→</span>
                </span>
              </Link>
              <Link
                href="/sell/list"
                className="group flex flex-col rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-primary/60 hover:bg-white/10"
              >
                <span className="font-semibold">Upload an inventory list</span>
                <span className="mt-2 text-sm leading-relaxed text-white/65">
                  One CSV or Excel file, any common layout. We confirm the row count with you
                  and take it from there.
                </span>
                <span className="mt-4 font-mono text-xs uppercase tracking-wider">
                  <span className="font-semibold text-white underline-offset-4 group-hover:underline">Upload CSV / Excel</span>{" "}
                  <span className="text-emerald-300" aria-hidden="true">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <section aria-labelledby="cta-heading" className="bg-secondary/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-5 py-12 sm:px-6 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:py-18">
          <div>
            <h2 id="cta-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Need it this quarter? Get a quote today.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Send a part number, a bill of materials or a single model. A real person
              replies within one business day, Pacific Time.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="h-12 sm:h-10">
              <Link href="/request-equipment">Request a quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 sm:h-10">
              <Link href="/equipment">Browse inventory</Link>
            </Button>
          </div>
          <ul className="w-full space-y-1.5 text-sm text-muted-foreground lg:w-auto">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <a href={`tel:${SITE.phoneHref}`} className="text-part hover:text-foreground">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
                {SITE.email}
              </a>
            </li>
            <li className="text-xs text-muted-foreground/70">{SITE_ADDRESS_ONE_LINE}</li>
          </ul>
        </div>
      </section>
    </>
  );
}
