import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTORS, getSectorBySlug } from "@/lib/site";

export function generateStaticParams() {
  return SECTORS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) return {};
  return {
    title: sector.metaTitle,
    description: sector.metaDescription,
    alternates: { canonical: `/sectors/${sector.slug}` },
  };
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = getSectorBySlug(slug);
  if (!sector) notFound();

  return (
    <>
      <section className="border-b border-border bg-secondary/30">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-foreground hover:underline">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground/80">
                  {sector.title}
                </li>
              </ol>
            </nav>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {sector.title}
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              {sector.intro[0]}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/request-equipment">
                  Request a quote
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={sector.supply[0]?.href ?? "/equipment"}>Browse {sector.shortName.toLowerCase()} inventory</Link>
              </Button>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${sector.shortName} categories`}>
              {sector.supply.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={sector.image}
                alt={sector.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="types-heading" className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 id="types-heading" className="text-2xl font-semibold tracking-tight">
            What we supply
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Typical categories and manufacturers. If your requirement sits between categories,
            describe it in the request — we quote from your specification, not our menu.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sector.types.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">{t.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t.examples}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 rounded-xl border border-border bg-secondary/40 p-6 sm:p-8 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                How sourcing works here
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {sector.intro[1]}
              </p>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                Selling this kind of equipment
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {sector.intro[2]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-ink text-brand-ink-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center">
          <h2 className="max-w-xl text-xl font-semibold tracking-tight sm:text-2xl">
            Need {sector.shortName.toLowerCase()} equipment? Get a firm quote within one business day.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/request-equipment">Request a quote</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-brand-ink-foreground hover:bg-white/10 hover:text-white"
            >
              <Link href={`/sell?sector=${sector.slug}`}>Sell surplus</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
