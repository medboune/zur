import Link from "next/link";
import { FileText, Inbox, Search, ShoppingCart, Tags } from "lucide-react";
import { db } from "@/lib/db";
import { REQUEST_STATUS_LABELS, REQUEST_TYPE_LABELS } from "@/lib/site";
import { PaginationControls } from "@/components/site/pagination-controls";
import { PageSizeSelect } from "@/components/site/page-size-select";
import { buildPageHref, pageWindow, parsePagination, totalPages } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  NEW: "border-primary/30 bg-primary/10 text-primary",
  IN_REVIEW: "border-sky-700/30 bg-sky-50 text-sky-800",
  QUOTED: "border-violet-700/30 bg-violet-50 text-violet-800",
  WON: "border-green-700/30 bg-green-50 text-green-800",
  CLOSED: "border-border bg-muted text-muted-foreground",
};

const TYPE_TONE: Record<string, string> = {
  SOURCING: "border-primary/30 bg-primary/5 text-primary",
  SURPLUS_SINGLE: "border-amber-700/30 bg-amber-50 text-amber-800",
  SURPLUS_LIST: "border-amber-700/40 bg-amber-100/70 text-amber-900",
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; q?: string; page?: string; size?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = sp.type && ["SOURCING", "SURPLUS_SINGLE", "SURPLUS_LIST"].includes(sp.type) ? sp.type : "";
  const status = sp.status && ["NEW", "IN_REVIEW", "QUOTED", "WON", "CLOSED"].includes(sp.status) ? sp.status : "";
  const { page, size } = parsePagination(sp);

  const where = {
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q.toUpperCase() } },
            { company: { contains: q } },
            { email: { contains: q } },
            { model: { contains: q } },
            { manufacturer: { contains: q } },
          ],
        }
      : {}),
  };

  const { skip, take } = pageWindow(page, size);
  const [leads, total, filteredTotal, byType, newCount] = await Promise.all([
    db.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    db.lead.count(),
    db.lead.count({ where }),
    db.lead.groupBy({ by: ["type"], _count: { _all: true } }),
    db.lead.count({ where: { status: "NEW" } }),
  ]);

  const typeCounts = Object.fromEntries(byType.map((t) => [t.type, t._count._all]));
  const last = totalPages(filteredTotal, size);
  const from = filteredTotal === 0 ? 0 : skip + 1;
  const to = Math.min(skip + take, filteredTotal);

  const currentParams = {
    type: type || undefined,
    status: status || undefined,
    q: q || undefined,
    size: String(size),
  };
  const hrefFor = (p: number) => buildPageHref("/admin", currentParams, { page: String(p) });

  const buildHref = (patch: Record<string, string>) => {
    const merged = { type, status, q, ...patch };
    const params = new URLSearchParams();
    if (merged.type) params.set("type", merged.type);
    if (merged.status) params.set("status", merged.status);
    if (merged.q) params.set("q", merged.q);
    if (String(size) !== "20") params.set("size", String(size));
    const s = params.toString();
    return s ? `/admin?${s}` : "/admin";
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every form submission from the website lands here immediately — sourcing requests
            and sell submissions, with attachments.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">New</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{newCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <ShoppingCart className="size-3.5" aria-hidden="true" /> Sourcing
          </p>
          <p className="mt-1 text-2xl font-semibold">{typeCounts.SOURCING ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Tags className="size-3.5" aria-hidden="true" /> Sell
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {(typeCounts.SURPLUS_SINGLE ?? 0) + (typeCounts.SURPLUS_LIST ?? 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="get" action="/admin" className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="admin-q" className="sr-only">
            Search requests
          </label>
          <input
            id="admin-q"
            name="q"
            defaultValue={q}
            placeholder="Reference, company, email, model…"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>
        {type && <input type="hidden" name="type" value={type} />}
        {status && <input type="hidden" name="status" value={status} />}
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Filters">
        <Link
          href={buildHref({ type: "", status: "" })}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !type && !status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </Link>
        <Link
          href={buildHref({ type: "SOURCING", status: "" })}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            type === "SOURCING" && !status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Sourcing requests
        </Link>
        <Link
          href={buildHref({ type: "SURPLUS_SINGLE", status: "" })}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            type === "SURPLUS_SINGLE" && !status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Sell — items
        </Link>
        <Link
          href={buildHref({ type: "SURPLUS_LIST", status: "" })}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            type === "SURPLUS_LIST" && !status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          Sell — lists
        </Link>
        <span aria-hidden="true" className="mx-1 w-px self-stretch bg-border" />
        {["NEW", "IN_REVIEW", "QUOTED", "WON", "CLOSED"].map((s) => (
          <Link
            key={s}
            href={buildHref({ status: s, type: "" })}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              status === s && !type ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {REQUEST_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          {filteredTotal} request{filteredTotal === 1 ? "" : "s"} match
          {last > 1 && (
            <span className="text-muted-foreground/80">
              {" "}· Showing {from}–{to} · Page {page} of {last}
            </span>
          )}
        </p>
        <PageSizeSelect value={size} />
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {leads.length === 0 ? (
          <div className="p-10 text-center">
            <Inbox className="mx-auto size-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="mt-3 font-medium">No requests match</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {total === 0
                ? "Requests from the website will appear here the moment they are submitted."
                : "Try clearing the filters or searching a different term."}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">Ref</th>
                <th scope="col" className="px-4 py-3 font-medium">Type</th>
                <th scope="col" className="px-4 py-3 font-medium">Company / contact</th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Equipment</th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Received</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/requests/${lead.id}`}
                      className="text-part font-semibold text-primary hover:underline"
                    >
                      {lead.reference}
                    </Link>
                    {lead.attachmentName && (
                      <FileText className="ml-1.5 inline size-3.5 text-muted-foreground" aria-label="Has attachment" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TYPE_TONE[lead.type]}`}>
                      {REQUEST_TYPE_LABELS[lead.type]?.replace("Sell — ", "")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.contactName} · {lead.email}
                    </p>
                  </td>
                  <td className="hidden max-w-64 px-4 py-3 md:table-cell">
                    <p className="truncate">
                      {lead.type === "SOURCING"
                        ? lead.equipment || [lead.manufacturer, lead.model].filter(Boolean).join(" ") || "—"
                        : lead.type === "SURPLUS_SINGLE"
                          ? [lead.manufacturer, lead.model].filter(Boolean).join(" ") || "—"
                          : lead.listSummary || "Inventory list"}
                    </p>
                    {lead.quantity && lead.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">Qty {lead.quantity}</p>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground lg:table-cell">
                    {lead.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                    {lead.createdAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_TONE[lead.status]}`}>
                      {REQUEST_STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PaginationControls page={page} totalPages={last} hrefFor={hrefFor} className="mt-6 justify-center" />
    </div>
  );
}
