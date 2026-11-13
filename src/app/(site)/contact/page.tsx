import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, SITE_ADDRESS_ONE_LINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Zuronix",
  description:
    "Contact Zuronix in Vancouver, Washington — phone, email, and address. The fastest route is a request: tell us what you need to buy or what you want to sell.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
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
            Contact
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Contact us</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        The fastest way to reach the team is a request — it creates a tracked thread with a
        reference number, and the right person picks it up the same day.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="font-semibold">Buying equipment</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Send the model or part number, quantity, and your timeline. We confirm specs and
            availability with the asset owner and reply with an offer.
          </p>
          <Button asChild className="mt-4">
            <Link href="/request-equipment">
              Request equipment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Selling equipment</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            One item or a full inventory file — our team reviews it with you and agrees what
            can be marketed.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/sell">
              List your equipment
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <section aria-labelledby="direct-heading" className="mt-10">
        <h2 id="direct-heading" className="text-xl font-semibold">
          Or reach us directly
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="size-4 text-primary" aria-hidden="true" /> Phone
            </p>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="text-part mt-2 block text-sm hover:text-primary"
            >
              {SITE.phone}
            </a>
            <p className="mt-1 text-xs text-muted-foreground">Mon–Fri, Pacific Time</p>
          </li>
          <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="size-4 text-primary" aria-hidden="true" /> Email
            </p>
            <a href={`mailto:${SITE.email}`} className="mt-2 block text-sm hover:text-primary">
              {SITE.email}
            </a>
            <p className="mt-1 text-xs text-muted-foreground">Attach specs or lists directly</p>
          </li>
          <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-primary" aria-hidden="true" /> Address
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {SITE_ADDRESS_ONE_LINE}
            </p>
          </li>
        </ul>
      </section>

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        {SITE.legalName} is registered in Washington State, USA.
      </p>
    </div>
  );
}
