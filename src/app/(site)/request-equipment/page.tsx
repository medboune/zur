import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "@/components/site/form/request-form";

export const metadata: Metadata = {
  title: "Request a Quote — GPUs, Servers, Semiconductor & Industrial Equipment",
  description:
    "Send the model or part number, quantity, configuration and timeline. Zuronix verifies specs and availability and replies with one firm quote — usually within one business day.",
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
            Request a quote
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Request a quote</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Tell us what you need. We verify specifications and availability, then send one
        firm quote from Zuronix — price, condition grade, warranty cover, lead time and
        shipping — within one business day. Not in the inventory yet? That&apos;s normal: much
        of what we supply is sourced to order.
      </p>

      <div className="mt-10">
        <RequestForm prefill={prefill} />
      </div>
    </div>
  );
}
