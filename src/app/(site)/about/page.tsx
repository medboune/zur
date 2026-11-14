import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, SITE_ADDRESS_ONE_LINE, SECTORS } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Zuronix — Sourcing & Sales",
  description:
    "Zuronix is an industrial equipment sourcing and sales company based in Vancouver, Washington, serving semiconductor, data center, and industrial equipment buyers and sellers.",
  alternates: { canonical: "/about" },
};

const WORK_STEPS = [
  {
    verb: "We search.",
    body: "Across our network of asset owners, dealers, and decommissioning projects — for the exact configuration you specified, not the nearest match.",
  },
  {
    verb: "We verify.",
    body: "Specifications, availability, and condition are confirmed with the asset owner. What was tested and what wasn't gets stated in writing.",
  },
  {
    verb: "We offer.",
    body: "One quote with price, condition, location, and terms. If something changes before you commit, you hear it from us first.",
  },
  {
    verb: "We coordinate.",
    body: "Inspection, logistics, and the commercial steps — carried out per the agreement approved for each deal, with the parties identified in it.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground/80">
            About
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Equipment sourcing, done on the facts
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          Zuronix is an industrial equipment sourcing and sales company based in
          Vancouver, Washington. We work two sides of the same problem: helping companies buy
          the equipment they need, and helping them sell the equipment they no longer use.
        </p>
        <p>
          We serve three sectors —{" "}
          {SECTORS.map((s, i) => (
            <span key={s.slug}>
              <Link href={`/sectors/${s.slug}`} className="link-quiet font-medium text-primary">
                {s.name.toLowerCase()}
              </Link>
              {i < SECTORS.length - 1 ? ", " : "."}
            </span>
          ))}{" "}
          Our clients are procurement managers who know a part number by heart, plant
          managers with twenty idle machines and no time to list them, and engineers who need
          to be sure a specific configuration fits their line before it ships.
        </p>
        <p>
          We are deliberately not a self-service marketplace. Deals in used equipment live
          or die on verified facts — so every request we take goes through people who check
          them.
        </p>
      </div>

      <section aria-labelledby="how-heading" className="mt-12">
        <h2 id="how-heading" className="text-2xl font-semibold tracking-tight">
          How we work
        </h2>
        <ol className="mt-6 space-y-5">
          {WORK_STEPS.map((step, i) => (
            <li key={step.verb} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/5 text-sm font-semibold text-primary"
              >
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{step.verb}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 rounded-lg border border-border bg-secondary/40 px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
          Each transaction is governed by its own approved agreement, which identifies the
          asset owner and the contracting seller, the price, any commission or fee where it
          applies, and the terms of inspection, delivery, and payment.
        </p>
      </section>

      <section aria-labelledby="where-heading" className="mt-12">
        <h2 id="where-heading" className="text-2xl font-semibold tracking-tight">
          Company &amp; contact
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Headquarters</h3>
            <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {SITE.legalName} — {SITE_ADDRESS_ONE_LINE}, USA.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Reach us</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <a href={`tel:${SITE.phoneHref}`} className="inline-flex items-center gap-2 hover:text-foreground">
                  <Phone className="size-4 text-primary" aria-hidden="true" />
                  <span className="text-part">{SITE.phone}</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-primary" aria-hidden="true" />
                {SITE.hours}
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 hover:text-foreground">
                  <Mail className="size-4 text-primary" aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/request-equipment">
            Request equipment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/sell">List your equipment</Link>
        </Button>
      </div>
    </div>
  );
}
