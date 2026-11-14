import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarCheck, MapPin } from "lucide-react";
import { ConditionBadge } from "@/components/site/condition-badge";
import type { Equipment } from "@prisma/client";

function priceParts(item: Equipment): { amount: string; unit: string } | null {
  if (item.priceType === "QUOTE" || !item.price) return null;
  const num = Number(item.price);
  const amount = Number.isFinite(num)
    ? num.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : item.price;
  const cur = item.currency === "USD" ? "$" : `${item.currency ?? ""} `;
  return {
    amount: `${cur}${amount}`,
    unit: item.priceType === "UNIT" ? "/unit" : "/lot",
  };
}

export function VerifiedDate({ date }: { date: Date | null }) {
  if (!date) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <CalendarCheck className="size-3.5 text-primary/70" aria-hidden="true" />
      Availability checked{" "}
      {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
    </span>
  );
}

export function EquipmentCard({ item }: { item: Equipment }) {
  const price = priceParts(item);
  const requestHref = `/request-equipment?ref=${encodeURIComponent(item.reference)}&model=${encodeURIComponent(
    `${item.manufacturer} ${item.model}`
  )}`;

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <Link
        href={`/equipment/${item.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-muted"
        aria-label={`${item.manufacturer} ${item.model} — view details`}
      >
        {item.image && (
          <Image
            src={item.image}
            alt={item.imageCaption || `${item.manufacturer} ${item.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}
        {/* Price badge — first thing the eye lands on */}
        {price ? (
          <span className="absolute left-3 top-3 rounded-md bg-foreground/90 px-2.5 py-1 font-mono text-[13px] font-semibold text-background backdrop-blur-sm">
            {price.amount}
            <span className="text-[11px] font-medium opacity-70">{price.unit}</span>
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-md border border-foreground/15 bg-background/90 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-foreground/80 backdrop-blur-sm">
            By quote
          </span>
        )}
        {item.isSample && (
          <span className="absolute right-3 top-3 rounded bg-amber-100/95 px-2 py-0.5 text-[11px] font-semibold text-amber-900 shadow-sm">
            Demo
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ConditionBadge conditionKey={item.conditionKey} />
          <span className="text-xs text-muted-foreground">{item.category}</span>
        </div>
        <h3 className="text-[15px] font-semibold leading-snug">
          <Link href={`/equipment/${item.slug}`} className="text-foreground hover:text-primary">
            {item.manufacturer}{" "}
            <span className="text-part font-medium">{item.model}</span>
          </Link>
        </h3>
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate" title={item.location}>
            {item.location}
          </span>
          <span aria-hidden="true" className="shrink-0">
            ·
          </span>
          <span className="shrink-0">{item.quantity > 1 ? `${item.quantity} units` : "1 unit"}</span>
        </p>
        <VerifiedDate date={item.lastVerifiedAt} />
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="text-sm font-semibold text-foreground">
            {price ? (
              <>
                {price.amount}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  {item.priceType === "UNIT" ? "per unit" : "for the lot"}
                  {item.includesShipping === false && " · excl. shipping"}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">Request a quote</span>
            )}
          </span>
          <Link
            href={requestHref}
            className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Make offer
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
