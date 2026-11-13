import type { Metadata } from "next";
import Link from "next/link";
import { SurplusSingleForm } from "@/components/site/form/surplus-single-form";

export const metadata: Metadata = {
  title: "Submit One Item for Sale",
  description:
    "Submit a single piece of equipment for review — manufacturer, model, quantity, condition, and location. No account needed.",
  alternates: { canonical: "/sell/single" },
};

export default function SellSinglePage() {
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
              List equipment
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground/80">
            One item
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Submit one item
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Tell us about the equipment and be as honest as you can about condition — untested is
        fine, we just need to know what we&apos;re working with. Have a whole list instead?{" "}
        <Link href="/sell/list" className="link-quiet font-medium text-primary">
          Upload the list
        </Link>
        .
      </p>

      <div className="mt-10">
        <SurplusSingleForm />
      </div>
    </div>
  );
}
