import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageSearch, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/site/search-box";
import { EquipmentCard } from "@/components/site/equipment-card";
import { PaginationControls } from "@/components/site/pagination-controls";
import { PageSizeSelect } from "@/components/site/page-size-select";
import { SECTORS, showSampleListings } from "@/lib/site";
import { listEquipmentPaged } from "@/lib/equipment";
import { buildPageHref, pageWindow, parsePagination, totalPages } from "@/lib/pagination";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";

// Always render on request: the database (D1 in production) must not be
// queried during the Cloudflare Workers build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Equipment Catalog — Request a Quote",
  description:
    "Browse sourced semiconductor, data center, and industrial equipment. Every listing states condition, quantity, location, and when availability was last verified. No price listed means the offer comes by quote.",
  alternates: { canonical: "/equipment" },
};

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; size?: string }>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const { page, size } = parsePagination(sp);

  const { skip, take } = pageWindow(page, size);
  const { items, total } = await listEquipmentPaged({ query, skip, take });

  // Out-of-range page (stale link after listings were removed): go to the
  // last real page rather than showing an empty catalog.
  const last = totalPages(total, size);
  if (total > 0 && page > last) {
    const target = buildPageHref("/equipment", { q: query || undefined, size: String(size) }, { page: String(last) });
    redirect(target);
  }

  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);
  const currentParams = { q: query || undefined, size: String(size) };
  const hrefFor = (p: number) => buildPageHref("/equipment", currentParams, { page: String(p) });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <script {...jsonLdScript(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Equipment", path: "/equipment" }]))} />
      <script {...jsonLdScript(itemListJsonLd(items, page))} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground/80">
            Equipment
          </li>
        </ol>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Equipment catalog</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {total > 0
              ? "Condition, quantity, location, and the last availability check are stated on every listing. Anything without a price is offered by quote."
              : "The catalog is being built. In the meantime, tell us what you need — most equipment we sell is sourced on request before it is ever listed."}
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <SearchBox defaultValue={query} />
      </div>

      {/* Sourcing fallback: the most important conversion path */}
      {query && (
        <section
          aria-labelledby="request-model-heading"
          className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <h2 id="request-model-heading" className="font-semibold">
                {total > 0
                  ? "Not the exact configuration you need?"
                  : "No listing matches — that's normal."}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {total > 0
                  ? "Tell us the exact model, configuration, or part number and we will source it and confirm availability with the asset owner."
                  : "Most of what we sell is sourced on request, before it reaches any catalog. Send the model or part number and we will start looking."}
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href={`/request-equipment?model=${encodeURIComponent(query)}`}>
                Request <span className="text-part font-semibold normal-case">&ldquo;{query}&rdquo;</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {total > 0 ? (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" role="status">
              {query ? (
                <>
                  {total} {total === 1 ? "listing" : "listings"} matching{" "}
                  <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                <>{total} {total === 1 ? "listing" : "listings"} in the catalog</>
              )}
              {last > 1 && (
                <span className="text-muted-foreground/80">
                  {" "}· Showing {from}–{to} · Page {page} of {last}
                </span>
              )}
            </p>
            <PageSizeSelect value={size} />
          </div>

          {showSampleListings() && !query && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
              Preview note: listings marked <strong>Demo</strong> are sample records that show
              how equipment pages work — they are not live inventory. Request any item and we
              will confirm what is actually available.
            </p>
          )}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>

          <PaginationControls page={page} totalPages={last} hrefFor={hrefFor} className="mt-10 justify-center" />
        </>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          {query ? (
            <>
              <SearchX className="mx-auto size-10 text-muted-foreground/50" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">
                Nothing in the catalog matches &ldquo;{query}&rdquo; yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                We source on request every day. Send the model or part number — we will
                confirm specs and availability with the asset owner and reply with an offer.
              </p>
              <Button asChild className="mt-6">
                <Link href={`/request-equipment?model=${encodeURIComponent(query)}`}>
                  Request this model
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <PackageSearch className="mx-auto size-10 text-muted-foreground/50" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">No equipment published yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                We publish equipment once the owner approves the listing. Until then, the
                fastest way to equipment is a sourcing request.
              </p>
              <Button asChild className="mt-6">
                <Link href="/request-equipment">
                  Request equipment
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
        </div>
      )}

      {/* Sector cross-links for indexability */}
      <section aria-labelledby="browse-heading" className="mt-14 border-t border-border pt-8">
        <h2 id="browse-heading" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Browse by sector
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/sectors/${s.slug}`}
                className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground/80 hover:border-primary/40 hover:text-foreground"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
