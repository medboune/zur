import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteEquipment, toggleEquipmentPublished } from "@/app/admin/actions";
import { CONDITIONS } from "@/lib/site";

export const dynamic = "force-dynamic";

function priceLabel(item: { priceType: string; price: string | null; currency: string | null }) {
  if (item.priceType === "QUOTE" || !item.price) return "By quote";
  const cur = item.currency === "USD" ? "$" : `${item.currency ?? ""} `;
  return `${cur}${Number(item.price).toLocaleString("en-US")}${item.priceType === "UNIT" ? "/unit" : "/lot"}`;
}

export default async function AdminEquipmentPage() {
  const items = await db.equipment.findMany({ orderBy: { id: "asc" } });

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

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">No listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create the first listing — it will appear in the catalog the moment you publish it.
            </p>
            <Link
              href="/admin/equipment/new"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              Create listing
            </Link>
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
                    <p>{item.sector === "SEMICONDUCTOR" ? "Semiconductor" : item.sector === "DATACENTER" ? "Data center" : "Industrial"}</p>
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
                      <form action={deleteEquipment}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-background px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                          aria-label={`Delete ${item.manufacturer} ${item.model}`}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {items.length} listing{items.length === 1 ? "" : "s"} in the catalog. Deleting a
        listing cannot be undone — unpublish instead if it may return.
      </p>
    </div>
  );
}
