import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardList, FileSpreadsheet, Mail, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/site/search-box";
import { EquipmentCard } from "@/components/site/equipment-card";
import { CategoryTicker } from "@/components/site/category-ticker";
import { SECTORS, SITE, SITE_ADDRESS_ONE_LINE, showSampleListings } from "@/lib/site";
import { featuredEquipment } from "@/lib/equipment";

// Always render on request: the database (D1 in production) must not be
// queried during the Cloudflare Workers build.
export const dynamic = "force-dynamic";

const HERO_NOTES = [
  "No account needed",
  "Condition verified with the owner",
  "CSV / Excel lists accepted",
];

const BUY_STEPS = [
  {
    title: "Send your requirement",
    body: "Model or part number, quantity, configuration, and your timeline. Two minutes — a spec sheet helps but is not required.",
  },
  {
    title: "We confirm the facts at the source",
    body: "Specifications, availability, and condition history are verified with the asset owner before anything is offered to you.",
  },
  {
    title: "One clear, complete quote",
    body: "Price and currency, unit or lot, what was tested, location, and lead time — with the confirmation date stated.",
  },
  {
    title: "Close on approved terms",
    body: "Inspection, payment, and delivery follow the documents agreed for the deal. The same team stays on it end to end.",
  },
];

const SELL_STEPS = [
  {
    title: "Send a list or a single unit",
    body: "Upload a CSV or Excel inventory once, or fill in one short form. No account, no per-item listings to create.",
  },
  {
    title: "We review it with you",
    body: "Availability, condition, and what may be marketed — agreed together, in writing, before anything goes further.",
  },
  {
    title: "We match it to live demand",
    body: "Your equipment reaches qualified buyers through our network. Nothing is published without your sign-off.",
  },
  {
    title: "Settle per the agreement",
    body: "Owner proceeds are settled according to collected payments and the approved agreement. We never float deals.",
  },
];

const CONDITION_GRADES = [
  {
    grade: "Used",
    body: "In working condition as last operated. Operating history confirmed with the owner before quoting.",
  },
  {
    grade: "Tested working",
    body: "Powered up and function-tested before sale. Test report provided where one exists — ask for it.",
  },
  {
    grade: "Refurbished",
    body: "Restored or repaired to a stated standard. The refurbishment scope is documented in the offer.",
  },
  {
    grade: "As-is / for parts",
    body: "Sold in current state with no operational warranty. Known history noted where available.",
  },
];

const SELLER_PRIVACY = [
  "Your file reaches our sourcing desk only — serial numbers and original asset lists are never public.",
  "Receiving your file does not create a public listing.",
  "We confirm availability, details, and your approval before anything is shared with a buyer.",
];

export default async function HomePage() {
  const featured = await featuredEquipment(6);
  const heroListings = featured.slice(0, 3);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    description: SITE.description,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

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

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:py-24">
          <div>
            <p className="eyebrow !text-white/60">
              Industrial equipment sourcing &amp; surplus sales
            </p>
            <h1 className="font-display mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
              Source equipment.
              <br />
              <span className="text-white/90">Sell your surplus.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              Semiconductor tools, data center hardware, industrial machinery — send
              the model you need, or the list you want to sell. We confirm the facts
              with the owner, then quote.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-[15px]">
                <Link href="/request-equipment">
                  Request equipment
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-[15px] text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/sell">Sell surplus equipment</Link>
              </Button>
            </div>

            <div className="mt-8 max-w-xl">
              <SearchBox />
            </div>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {HERO_NOTES.map((note) => (
                <li
                  key={note}
                  className="flex items-center gap-2 font-mono text-xs tracking-wide text-white/75"
                >
                  <span className="size-1 rounded-full bg-primary" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* Live listings panel — equipment for sale, with prices, right in the hero */}
          <aside
            aria-labelledby="hero-listings-heading"
            className="rounded-xl border border-white/15 bg-brand-ink/70 p-5 shadow-2xl backdrop-blur-md sm:p-6"
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
                We run a request-driven desk — most equipment is matched from owner
                networks, not listed.
                <Link href="/request-equipment" className="mt-3 block font-semibold text-white underline-offset-4 hover:underline">
                  Request any model →
                </Link>
              </p>
            )}
            <p className="border-t border-white/10 pt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/40">
              Condition &amp; availability verified with the owner
            </p>
          </aside>
        </div>
      </section>

      <CategoryTicker />

      {/* ── Current listings — full cards with price + offer ─────────────── */}
      {featured.length > 0 && (
        <section aria-labelledby="listings-heading" className="border-b border-border bg-secondary/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">01 / Available now</p>
                <h2 id="listings-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Equipment for sale
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Every listing states condition, quantity, location, and the date
                  availability was last confirmed. See something close? Send an offer —
                  we confirm the rest with the owner.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/equipment">
                  View all equipment
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            {showSampleListings() && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
                Preview note: listings marked <strong>Demo</strong> illustrate our equipment
                page format. They are sample records, not live inventory — request any of them
                and we will confirm what is actually available.
              </p>
            )}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <EquipmentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sectors ───────────────────────────────────────────────────────── */}
      <section aria-labelledby="sectors-heading" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
          <p className="eyebrow">02 / Where we work</p>
          <h2 id="sectors-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Three sectors. One standard of work.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            If it is on a fab floor, in a rack, or keeping a plant running — send us
            the model. We take it from there.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SECTORS.map((s, i) => (
              <article
                key={s.slug}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <Link
                  href={`/sectors/${s.slug}`}
                  className="relative block aspect-[16/10] overflow-hidden border-b border-border"
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
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {s.types.slice(0, 4).map((t) => (
                      <li
                        key={t.name}
                        className="rounded border border-border bg-secondary/60 px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground"
                      >
                        {t.name}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/sectors/${s.slug}`}
                    className="mt-4 inline-flex items-center gap-1 pt-1 text-sm font-medium text-primary hover:underline"
                  >
                    Explore {s.shortName.toLowerCase()}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section aria-labelledby="how-heading" className="border-b border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
          <p className="eyebrow">03 / Process</p>
          <h2 id="how-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            What happens on each side
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            No auctions, no instant-pricing games. We verify, we quote, and each deal
            runs on its own approved documents.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">Buying equipment</h3>
                  <p className="text-sm text-muted-foreground">For procurement teams &amp; engineers</p>
                </div>
              </div>
              <ol className="mt-6 space-y-4">
                {BUY_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded border border-primary/30 bg-primary/5 font-mono text-[11px] font-semibold text-primary"
                    >
                      B{i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-7">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/request-equipment">
                    Start a request
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-foreground/5 text-foreground">
                  <FileSpreadsheet className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">Selling surplus</h3>
                  <p className="text-sm text-muted-foreground">For asset &amp; plant managers</p>
                </div>
              </div>
              <ol className="mt-6 space-y-4">
                {SELL_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded border border-border bg-secondary font-mono text-[11px] font-semibold text-muted-foreground"
                    >
                      S{i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-7">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/sell">
                    Start selling
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Condition standards ──────────────────────────────────────────── */}
      <section aria-labelledby="condition-heading" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
          <p className="eyebrow">04 / Transparency</p>
          <h2 id="condition-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            How we state condition
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            One letter in a model number or a different spindle size can change whether
            a machine fits your line. That is why our condition language is standardized
            and sourced.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONDITION_GRADES.map((g) => (
              <div
                key={g.grade}
                className="rounded-xl border border-border border-t-2 border-t-primary bg-card p-5 shadow-sm"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Standard grade
                </p>
                <h3 className="mt-2 font-semibold">{g.grade}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl rounded-r-lg border-l-2 border-primary bg-primary/5 py-3 pl-4 text-sm leading-relaxed text-muted-foreground">
            Condition statements come from the asset owner. We verify them while preparing
            your quote, and every offer records what was confirmed — and on what date.
          </p>
        </div>
      </section>

      {/* ── Sell surplus band — dark, warehouse ──────────────────────────── */}
      <section aria-labelledby="sell-heading" className="relative overflow-hidden bg-brand-ink text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/surplus-bg.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-ink via-brand-ink/70 to-brand-ink" aria-hidden="true" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="eyebrow !text-white/60">05 / For sellers</p>
          <h2 id="sell-heading" className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Turn idle assets into qualified offers
          </h2>
          <p className="mt-3 max-w-2xl text-white/70">
            Twenty machines in a spreadsheet? One tester in a corner of the lab?
            Both take about two minutes to hand over.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm sm:p-7">
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                Your data stays private until you say otherwise
              </h3>
              <ul className="mt-4 space-y-3">
                {SELLER_PRIVACY.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-white/75">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
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
                <span className="font-semibold">Sell a single asset</span>
                <span className="mt-2 text-sm leading-relaxed text-white/65">
                  Manufacturer, model, quantity, condition, location. Photos and
                  inspection reports welcome.
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
                <span className="font-semibold">Upload a surplus list</span>
                <span className="mt-2 text-sm leading-relaxed text-white/65">
                  One CSV or Excel file, any common layout. We parse it, confirm the
                  row count with you, and take it from there.
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
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-18">
          <div>
            <h2 id="cta-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Tell us what you need.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Send a requirement or a surplus list today — we will confirm the next
              step with you by email. Prefer to talk it through first? Call or write.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/request-equipment">Request equipment</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sell">Sell surplus equipment</Link>
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
