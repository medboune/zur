import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { toggleEquipmentPublished } from "@/app/admin/actions";
import { EquipmentDeleteButton } from "@/components/admin/equipment-delete-button";
import { PaginationControls } from "@/components/site/pagination-controls";
import { PageSizeSelect } from "@/components/site/page-size-select";
import { CONDITIONS } from "@/lib/site";
import { buildSearchKey } from "@/lib/equipment";
import { buildPageHref, pageWindow, parsePagination, totalPages } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const SECTOR_LABELS: Record<string, string> = {
  SEMICONDUCTOR: "Semiconductor",
  DATACENTER: "Data center",
  INDUSTRIAL: "Industrial",
};

function priceLabel(item: { priceType: string; price: string | null; currency: string | null }) {
  if (item.priceType === "QUOTE" || !item.price) return "By quote";
  const cur = item.currency === "USD" ? "$" : `${item.currency ?? ""} `;
  return `${cur}${Number(item.price).toLocaleString("en-US")}${item.priceType === "UNIT" ? "/unit" : "/lot"}`;
}

export default async function AdminEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sector?: string; status?: string; page?: string; size?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sector =
    sp.sector && ["SEMICONDUCTOR", "DATACENTER", "INDUSTRIAL"].includes(sp.sector) ? sp.sector : "";
  const status =
    sp.status && ["PUBLISHED", "HIDDEN", "DEMO"].includes(sp.status) ? sp.status : "";
  const { page, size } = parsePagination(sp);

  const where: Prisma.EquipmentWhereInput = {
    ...(sector ? { sector } : {}),
    ...(status === "PUBLISHED" ? { isPublished: true } : {}),
    ...(status === "HIDDEN" ? { isPublished: false } : {}),
    ...(status === "DEMO" ? { isSample: true } : {}),
    ...(q ? { searchKey: { contains: buildSearchKey(q) } } : {}),
  };

  const { skip, take } = pageWindow(page, size);
  const [items, total] = await Promise.all([
    db.equipment.findMany({ where, orderBy: { id: "asc" }, skip, take }),
    db.equipment.count({ where }),
  ]);

  const last = totalPages(total, size);
  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, total);
  const currentParams = {
    q: q || undefined,
    sector: sector || undefined,
    status: status || undefined,
    size: String(size),
  };
  const hrefFor = (p: number) => buildPageHref("/admin/equipment", currentParams, { page: String(p) });
  const filterHref = (patch: Record<string, string | undefined>) =>
    buildPageHref("/admin/equipment", currentParams, patch);

  const chipCls = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipment listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage the public catalog. Published listings appear on the site
            immediately; demo listings are hidden when the site runs in launch mode.
          </p>
        </div>
        <Link
          href="/admin/equipment/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" aria-hidden="true" />
          New listing
        </Link>
      </div>

      {/* Search + filters */}
      <form method="get" action="/admin/equipment" className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="equipment-q" className="sr-only">
            Search listings
          </label>
          <input
            id="equipment-q"
            name="q"
            defaultValue={q}
            placeholder="Manufacturer, model, reference…"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
        <select
          name="sector"
          defaultValue={sector}
          aria-label="Filter by sector"
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus:border-ring focus:outline-none"
        >
          <option value="">All sectors</option>
          {Object.entries(SECTOR_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status}
          aria-label="Filter by status"
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus:border-ring focus:outline-none"
        >
          <option value="">Any status</option>
          <option value="PUBLISHED">Published</option>
          <option value="HIDDEN">Hidden</option>
          <option value="DEMO">Demo</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Quick filters">
          <Link href={filterHref({ sector: undefined, status: undefined })} className={chipCls(!sector && !status)}>
            All
          </Link>
          <Link href={filterHref({ sector: "SEMICONDUCTOR" })} className={chipCls(sector === "SEMICONDUCTOR")}>
            Semiconductor
          </Link>
          <Link href={filterHref({ sector: "DATACENTER" })} className={chipCls(sector === "DATACENTER")}>
            Data center
          </Link>
          <Link href={filterHref({ sector: "INDUSTRIAL" })} className={chipCls(sector === "INDUSTRIAL")}>
            Industrial
          </Link>
          <span aria-hidden="true" className="mx-1 w-px self-stretch bg-border" />
          <Link href={filterHref({ status: "PUBLISHED" })} className={chipCls(status === "PUBLISHED")}>
            Published
          </Link>
          <Link href={filterHref({ status: "HIDDEN" })} className={chipCls(status === "HIDDEN")}>
            Hidden
          </Link>
          <Link href={filterHref({ status: "DEMO" })} className={chipCls(status === "DEMO")}>
            Demo
          </Link>
        </div>
        <p className="text-sm text-muted-foreground" role="status">
          {total} listing{total === 1 ? "" : "s"}
          {last > 1 && (
            <span className="text-muted-foreground/80">
              {" "}· Showing {from}–{to} · Page {page} of {last}
            </span>
          )}
        </p>
        <PageSizeSelect value={size} />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">No listings match</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {total === 0
                ? "Create the first listing — it will appear in the catalog the moment you publish it."
                : "Try clearing the filters or searching a different term."}
            </p>
            {total === 0 && (
              <Link
                href="/admin/equipment/new"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" aria-hidden="true" />
                Create listing
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">Item</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Sector</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative block size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        {item.image && (
                          <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium">
                          {item.manufacturer} <span className="text-part">{item.model}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-part">{item.reference}</span>
                          {item.quantity > 1 ? ` · ${item.quantity} units` : ""}
                          {` · ${CONDITIONS[item.conditionKey]?.label ?? item.conditionKey}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    <p>{SECTOR_LABELS[item.sector] ?? item.sector}</p>
                    <p className="text-xs text-muted-foreground/70">{item.category}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">{priceLabel(item)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          item.isPublished
                            ? "border-green-700/30 bg-green-50 text-green-800"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Hidden"}
                      </span>
                      {item.isSample && (
                        <span className="rounded-full border border-amber-700/30 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                          Demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <form action={toggleEquipmentPublished}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                        >
                          {item.isPublished ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <Link
                        href={`/admin/equipment/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
                        aria-label={`Edit ${item.manufacturer} ${item.model}`}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                        Edit
                      </Link>
                      <EquipmentDeleteButton
                        equipmentId={item.id}
                        name={`${item.manufacturer} ${item.model}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PaginationControls page={page} totalPages={last} hrefFor={hrefFor} className="mt-6 justify-center" />

      <p className="mt-3 text-xs text-muted-foreground">
        {total} listing{total === 1 ? "" : "s"} in the catalog. Deleting a
        listing cannot be undone — unpublish instead if it may return.
      </p>
    </div>
  );
}
