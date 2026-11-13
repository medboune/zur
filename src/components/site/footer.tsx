import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { SECTORS, SITE, SITE_ADDRESS_ONE_LINE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-ink text-brand-ink-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo inverted withTagline />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-ink-foreground/70">
              {SITE.tagline}. We help manufacturers and IT teams source the equipment they
              need — and find buyers for the equipment they no longer use.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink-foreground/50" aria-hidden="true" />
                <span className="text-brand-ink-foreground/80">{SITE_ADDRESS_ONE_LINE}</span>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="inline-flex items-center gap-2.5 text-brand-ink-foreground/80 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                >
                  <Phone className="size-4 shrink-0 text-brand-ink-foreground/50" aria-hidden="true" />
                  <span className="text-part">{SITE.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2.5 text-brand-ink-foreground/80 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                >
                  <Mail className="size-4 shrink-0 text-brand-ink-foreground/50" aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Sectors" className="md:col-span-2">
            <h2 className="text-sm font-semibold">Sectors</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SECTORS.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/sectors/${s.slug}`}
                    className="text-brand-ink-foreground/70 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                  >
                    {s.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Equipment and services" className="md:col-span-3">
            <h2 className="text-sm font-semibold">Equipment &amp; services</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/equipment"
                  className="text-brand-ink-foreground/70 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                >
                  Equipment catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/request-equipment"
                  className="text-brand-ink-foreground/70 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                >
                  Request equipment
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="text-brand-ink-foreground/70 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                >
                  List your equipment
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company" className="md:col-span-2">
            <h2 className="text-sm font-semibold">Company</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-brand-ink-foreground/70 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                >
                  About Zuronix
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-brand-ink-foreground/70 underline-offset-4 hover:text-brand-ink-foreground hover:underline"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-brand-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. {SITE.registration}.
          </p>
          <p>
            {SITE.address.city}, {SITE.address.state} · {SITE.address.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
