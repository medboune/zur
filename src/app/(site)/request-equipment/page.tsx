import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "@/components/site/form/request-form";

export const metadata: Metadata = {
  title: "Request Equipment — Get a Sourced Quote",
  description:
    "Tell us the equipment you need — model or part number, quantity, configuration, and timeline. We confirm specs and availability with the asset owner and reply with one clear offer.",
  alternates: { canonical: "/request-equipment" },
};

export default async function RequestEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; ref?: string; qty?: string; note?: string }>;
}) {
  const sp = await searchParams;
  const prefill = {
    model: sp.model?.slice(0, 160),
    ref: sp.ref?.slice(0, 40),
    qty: sp.qty?.slice(0, 6),
    note: sp.note?.slice(0, 500),
  };

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
          <li aria-current="page" className="text-foreground/80">
            Request equipment
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Request equipment</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Tell us what you need. We confirm specifications and availability with the asset
        owner, then send you one offer with price, condition, and location. Most equipment we
        sell is sourced this way — if it isn&apos;t in the catalog yet, that&apos;s normal.
      </p>

      <div className="mt-10">
        <RequestForm prefill={prefill} />
      </div>
    </div>
  );
}
