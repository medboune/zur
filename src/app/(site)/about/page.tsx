import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Clock, Landmark, Mail, MapPin, Phone, Receipt, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_DISCLAIMER, BUYER_ASSURANCES, SITE, SITE_ADDRESS_ONE_LINE, SECTORS } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Zuronix — US Supplier of Data Center, Semiconductor & Industrial Equipment",
  description:
    "Zuronix is a US supplier of data center hardware, semiconductor equipment and industrial machinery based in Vancouver, Washington: one quote, one contract, one invoice — verified units, shipped worldwide.",
  alternates: { canonical: "/about" },
};

const WORK_STEPS = [
  {
    verb: "We source.",
    body: "From our available inventory, or to order through our supply network of data center operators, manufacturers, dealers and decommissioning projects — for the exact configuration you specified, not the nearest match.",
  },
  {
    verb: "We verify.",
    body: "Model, configuration, condition and availability are checked before we price a unit. What was tested — and what wasn't — is stated in writing.",
  },
  {
    verb: "We quote.",
    body: "One firm quote from Zuronix: price, condition grade, warranty cover, lead time and shipping. If anything changes before you commit, you hear it from us first.",
  },
  {
    verb: "We deliver.",
    body: "Packing, freight and export paperwork are arranged by us, and the same team stays on your order until it arrives.",
  },
];

const ASSURANCE_ICONS = {
  seller: Receipt,
  verified: BadgeCheck,
  documented: Camera,
  cover: ShieldCheck,
  logistics: Truck,
  payment: Landmark,
} as const;

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
        A supplier you can hold accountable
      </h1>

      <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
        <p>
          Zuronix is a US supplier of data center hardware, semiconductor equipment and
          industrial machinery, based in Vancouver, Washington. We supply GPUs and servers,
          networking and memory, wafer test and probe tools, CNC machines, robots and power
          equipment — new, refurbished and tested.
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
          Our customers are procurement teams, AI and IT infrastructure teams, fab and test
          engineers, and plant managers who need a specific configuration — often one that is
          end-of-life or on a long factory lead time — delivered with the paperwork right.
        </p>
        <p>
          When you buy from Zuronix, you buy from Zuronix: one quote, one contract, one
          invoice, and one team that stays accountable after delivery. We are not a
          marketplace and we do not hand you over to a third party.
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
          Every order is documented: our quote and invoice, the condition and test record,
          and the warranty cover that applies. Payment is by wire to our US business account;
          we confirm bank details by phone and never change them by email.
        </p>
      </section>

      <section aria-labelledby="commit-heading" className="mt-12">
        <h2 id="commit-heading" className="text-2xl font-semibold tracking-tight">
          What every buyer can count on
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {BUYER_ASSURANCES.map((a) => {
            const Icon = ASSURANCE_ICONS[a.key];
            return (
              <li key={a.key} className="flex min-w-0 gap-3.5 rounded-xl border border-border bg-card p-5 shadow-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{BRAND_DISCLAIMER}</p>
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
            Request a quote
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/equipment">Browse inventory</Link>
        </Button>
      </div>
    </div>
  );
}
