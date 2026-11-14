import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageSearch, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/site/search-box";
import { EquipmentCard } from "@/components/site/equipment-card";
import { PaginationControls } from "@/components/site/pagination-controls";
import { PageSizeSelect } from "@/components/site/page-size-select";
import { SECTORS } from "@/lib/site";
import { listEquipmentPaged } from "@/lib/equipment";
import { buildPageHref, pageWindow, parsePagination, totalPages } from "@/lib/pagination";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";

// Always render on request: the database (D1 in production) must not be
// queried during the Cloudflare Workers build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Equipment Inventory — GPUs, Servers, Semiconductor & Industrial Equipment",
  description:
    "Browse Zuronix inventory: NVIDIA GPUs, servers, networking and memory, wafer probers, ATE and dicing saws, CNC machines, robots and power equipment. Condition, quantity, location and the last availability check on every listing.",
  alternates: { canonical: "/equipment" },
};

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; page?: string; size?: string }>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const cat = (sp.cat ?? "").trim().slice(0, 80);
  const categories = SECTORS.flatMap((s) => s.supply);
  const activeCategory = cat
    ? categories.find((c) => new URL(c.href, "https://zuronix.com").searchParams.get("cat") === cat)
    : undefined;
  const { page, size } = parsePagination(sp);

  const { skip, take } = pageWindow(page, size);
  const { items, total } = await listEquipmentPaged({ query, category: cat, skip, take });

  // Out-of-range page (stale link after listings were removed): go to the
  // last real page rather than showing an empty catalog.
  const last = totalPages(total, size);
  if (total > 0 && page > last) {
    const target = buildPageHref("/equipment", { q: query || undefined, cat: cat || undefined, size: String(size) }, { page: String(last) });
    redirect(target);
  }

  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);
  const currentParams = { q: query || undefined, cat: cat || undefined, size: String(size) };
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
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {activeCategory ? activeCategory.label : "Equipment inventory"}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {total > 0
              ? "Every listing states condition, quantity, location and the date availability was last confirmed. Anything without a price is quoted within one business day."
              : "Nothing listed here right now — tell us what you need. Much of what we supply is sourced to order before it is ever listed."}
          </p>
        </div>
      </div>

      <div className="mt-6 max-w-2xl">
        <SearchBox defaultValue={query} />
      </div>

      {/* Category shortcuts — swipe row on phones */}
      <nav aria-label="Categories" className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          <li>
            <Link
              href={query ? `/equipment?q=${encodeURIComponent(query)}` : "/equipment"}
              className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
                !cat ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/50"
              }`}
            >
              All
            </Link>
          </li>
          {categories.map((c) => {
            const active = activeCategory?.href === c.href;
            return (
              <li key={c.href}>
                <Link
                  href={c.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-8 items-center whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/50"
                  }`}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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
                  ? "Tell us the exact model, configuration or part number — we source it, verify it and quote it within one business day."
                  : "Much of what we supply is sourced to order, before it reaches any catalog. Send the model or part number and we will start sourcing."}
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
                <>{activeCategory ? activeCategory.label : "Available inventory"}</>
              )}
              {last > 1 && (
                <span className="text-muted-foreground/80">
                  {" "}· Showing {from}–{to} · Page {page} of {last}
                </span>
              )}
            </p>
            <PageSizeSelect value={size} />
          </div>

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
                We source to order every day. Send the model or part number — we verify
                specs and availability and reply with a quote within one business day.
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
              <h2 className="mt-4 text-lg font-semibold">
                {cat ? "Nothing listed in this category right now" : "No equipment listed right now"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Inventory moves quickly and much of what we supply is sourced to order. Send
                the model or part number and we will quote it within one business day.
              </p>
              <Button asChild className="mt-6">
                <Link href="/request-equipment">
                  Request a quote
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
