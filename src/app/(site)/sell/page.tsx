import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSpreadsheet, Package, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTORS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sell Surplus Equipment — One Unit or a Full Inventory",
  description:
    "Sell surplus data center, semiconductor or industrial equipment through Zuronix. Send a single unit or a whole CSV/Excel inventory list — no account, no per-item listings. Nothing is published without your approval.",
  alternates: { canonical: "/sell" },
};

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector } = await searchParams;
  const activeSector = SECTORS.find((s) => s.slug === sector);

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
            Sell surplus
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Sell surplus equipment
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Decommissioning a cluster, closing a line, or clearing idle machines? Send one unit
        or a full site list. We review it with you, agree the terms in writing, and handle
        buyers, payment and logistics.{" "}
        {activeSector
          ? `Mention your ${activeSector.shortName.toLowerCase()} equipment in either path.`
          : "Pick whichever path fits what you have."}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm sm:p-7">
          <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Send a single item</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One machine, one tool, one lot. Manufacturer, model, quantity, condition, and
            location — with photos or an inspection report if you have them.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Takes about 3 minutes. You get a reference number immediately.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sell/single">
              Submit one item
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col rounded-xl border border-primary/30 bg-primary/5 p-6 shadow-sm sm:p-7">
          <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
            <FileSpreadsheet className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Upload an inventory list</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Twenty machines in a spreadsheet? Send the spreadsheet. CSV or Excel, any layout —
            you never re-type rows into per-item forms.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Best for line decommissions, cluster refreshes, and plant closures.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sell/list">
              Upload a list
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-secondary/40 p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
          What happens after you send
        </h2>
        <ol className="mt-4 grid gap-3 text-sm leading-relaxed text-muted-foreground sm:grid-cols-3">
          <li>
            <span className="font-medium text-foreground">1. Review.</span> Our team checks
            your submission — the same day whenever possible — and comes back with questions
            only you can answer.
          </li>
          <li>
            <span className="font-medium text-foreground">2. Agreement.</span> Together we
            confirm availability, condition, and what may be marketed, under what terms — in
            writing.
          </li>
          <li>
            <span className="font-medium text-foreground">3. Marketing &amp; sale.</span> We
            approach qualified buyers from our network. Every deal closes with your approval,
            and settlement follows the agreed terms.
          </li>
        </ol>
        <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          Your contact details, full serial numbers, and original asset lists stay private.
          Uploading a file to our team never makes it a public listing.
        </p>
      </div>
    </div>
  );
}
