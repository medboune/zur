import type { Metadata } from "next";
import Link from "next/link";
import { SurplusListForm } from "@/components/site/form/surplus-list-form";

export const metadata: Metadata = {
  title: "Upload a Surplus Inventory List (CSV / Excel)",
  description:
    "Send your whole surplus inventory in one file — CSV or Excel, any layout. Our team reviews it with you and agrees what can be marketed. No per-item forms, no account.",
  alternates: { canonical: "/sell/list" },
};

export default function SellListPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/sell" className="hover:text-foreground hover:underline">
              Sell surplus
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground/80">
            Inventory list
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Upload an inventory list
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Attach the file your team already maintains — CSV or Excel, any column layout.
        Manufacturer, model, quantity, and condition are enough to start; we&apos;ll fill the
        gaps together. One machine instead?{" "}
        <Link href="/sell/single" className="link-quiet font-medium text-primary">
          Submit a single item
        </Link>
        .
      </p>

      <div className="mt-10">
        <SurplusListForm />
      </div>
    </div>
  );
}
