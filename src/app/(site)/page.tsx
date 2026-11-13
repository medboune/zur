import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardList, FileSpreadsheet, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/site/search-box";
import { EquipmentCard } from "@/components/site/equipment-card";
import { SECTORS, SITE, SITE_ADDRESS_ONE_LINE, showSampleListings } from "@/lib/site";
import { featuredEquipment } from "@/lib/equipment";

// Always render on request: the database (D1 in production) must not be
// queried during the Cloudflare Workers build.
export const dynamic = "force-dynamic";

const BUY_STEPS = [
  {
    title: "Send your requirement",
    body: "Model or part number, quantity, configuration, and your timeline. A spec sheet helps; it is not required.",
  },
  {
    title: "We confirm the facts",
    body: "Specifications, availability, and condition are verified with the asset owner before anything is offered to you.",
  },
  {
    title: "One clear offer",
    body: "Price, condition, location, and terms in a single quote — so you can compare and decide.",
  },
];

const SELL_STEPS = [
  {
    title: "Send a list or a single unit",
    body: "Upload a CSV or Excel inventory, or fill in one short form. No account, no per-item listings to create.",
  },
  {
    title: "We review it with you",
    body: "Availability, condition, and what may be marketed — agreed together, in writing, before anything goes further.",
  },
  {
    title: "We match it to buyers",
    body: "Your equipment reaches qualified buyers through our network. You approve the deal before it closes.",
  },
];

const PROMISES = [
  {
    title: "Facts before offers.",
    body: "Every quote follows a spec and availability check with the asset owner. Condition and test status are stated on the listing — not implied.",
  },
  {
    title: "Your data stays yours.",
    body: "Contact details, serial numbers, and asset lists stay private. Nothing is published without your approval.",
  },
  {
    title: "No account needed.",
    body: "Request a quote or send a surplus list without signing up. Your reference number keeps the thread traceable.",
  },
  {
    title: "One team, end to end.",
    body: "The same team that takes your request confirms the specs, prepares the offer, and coordinates the sale.",
  },
];

export default async function HomePage() {
  const featured = await featuredEquipment(3);

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

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <ul className="flex flex-wrap gap-2" aria-label="Sectors we serve">
              {SECTORS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/sectors/${s.slug}`}
                    className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s.shortName}
                  </Link>
                </li>
              ))}
            </ul>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              Source equipment.
              <br />
              Sell your surplus.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Looking for semiconductor equipment, data center hardware, or industrial
              machinery? Send us the specifications you need — or share a list of equipment
              your company wants to sell.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-[15px]">
                <Link href="/request-equipment">Request equipment</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-[15px]">
                <Link href="/sell">Sell surplus equipment</Link>
              </Button>
            </div>

            <div className="mt-8 max-w-xl">
              <SearchBox />
              <p className="mt-2 text-xs text-muted-foreground">
                Don&apos;t see what you need in the catalog? Search anyway — every search can
                become a sourcing request in one click.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src="/images/hero.jpg"
                  alt="Technician in a cleanroom suit walking through an aisle of semiconductor manufacturing equipment"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Sourcing and surplus sales across fab, data center, and plant floor.
            </p>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section aria-labelledby="paths-heading" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
          <h2 id="paths-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Two ways to work with us
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Our business is built on purchase requests and negotiated quotes. Tell us which
            side you are on — the rest happens with a person, not a portal.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">Buying equipment</h3>
                  <p className="text-sm text-muted-foreground">You need a specific tool, tested and deliverable.</p>
                </div>
              </div>
              <ol className="mt-6 space-y-4">
                {BUY_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary"
                    >
                      {i + 1}
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
                    Request equipment
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileSpreadsheet className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">Selling surplus</h3>
                  <p className="text-sm text-muted-foreground">You have idle equipment that should be earning.</p>
                </div>
              </div>
              <ol className="mt-6 space-y-4">
                {SELL_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary"
                    >
                      {i + 1}
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
                    Sell surplus equipment
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section aria-labelledby="sectors-heading" className="border-b border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
          <h2 id="sectors-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Three sectors. One standard of work.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SECTORS.map((s) => (
              <article
                key={s.slug}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <Link href={`/sectors/${s.slug}`} className="relative block aspect-[16/10] overflow-hidden border-b border-border">
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold">
                    <Link href={`/sectors/${s.slug}`} className="hover:text-primary">
                      {s.title}
                    </Link>
                  </h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {s.types.slice(0, 3).map((t) => (
                      <li key={t.name} className="flex gap-2">
                        <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-primary/50" />
                        {t.name}
                      </li>
                    ))}
                    <li className="text-sm text-muted-foreground/70">and more</li>
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

      {/* Current listings */}
      {featured.length > 0 && (
        <section aria-labelledby="listings-heading" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="listings-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Current listings
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Every listing states condition, quantity, location, and the date availability
                  was last confirmed. No price on a listing means the offer comes by quote.
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

      {/* Promises */}
      <section aria-labelledby="promise-heading" className="border-b border-border bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
          <h2 id="promise-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What you can count on
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {PROMISES.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section aria-labelledby="cta-heading" className="bg-brand-ink text-brand-ink-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-18">
          <div>
            <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tell us what you need.
            </h2>
            <p className="mt-3 max-w-xl text-brand-ink-foreground/70">
              Send a requirement or a surplus list today — we will confirm the next step with
              you by email. Prefer to talk it through first? Call or write.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/request-equipment">Request equipment</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-brand-ink-foreground hover:bg-white/10 hover:text-white"
            >
              <Link href="/sell">Sell surplus equipment</Link>
            </Button>
          </div>
          <ul className="w-full space-y-1.5 text-sm text-brand-ink-foreground/70 lg:w-auto">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <a href={`tel:${SITE.phoneHref}`} className="text-part hover:text-white">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="text-xs text-brand-ink-foreground/50">{SITE_ADDRESS_ONE_LINE}</li>
          </ul>
        </div>
      </section>
    </>
  );
}
