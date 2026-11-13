import Link from "next/link";
import Image from "next/image";
import { CalendarCheck, MapPin } from "lucide-react";
import { ConditionBadge } from "@/components/site/condition-badge";
import type { Equipment } from "@prisma/client";

function formatPrice(item: Equipment): string | null {
  if (item.priceType === "QUOTE" || !item.price) return null;
  const num = Number(item.price);
  const amount = Number.isFinite(num)
    ? num.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : item.price;
  const cur = item.currency === "USD" ? "$" : `${item.currency ?? ""} `;
  if (item.priceType === "UNIT") return `${cur}${amount} per unit`;
  return `${cur}${amount} for the lot`;
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
  const price = formatPrice(item);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/equipment/${item.slug}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`${item.manufacturer} ${item.model} — view details`}
      />
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.imageCaption || `${item.manufacturer} ${item.model}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : null}
        {item.isSample && (
          <span className="absolute right-2 top-2 rounded bg-amber-100/95 px-2 py-0.5 text-[11px] font-semibold text-amber-900 shadow-sm">
            Demo listing
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ConditionBadge conditionKey={item.conditionKey} />
          <span className="text-xs text-muted-foreground">{item.category}</span>
        </div>
        <h3 className="text-[15px] font-semibold leading-snug">
          <span className="text-foreground">{item.manufacturer}</span>{" "}
          <span className="text-part font-medium">{item.model}</span>
        </h3>
        <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {item.location}
            <span aria-hidden="true">·</span>
            <span>
              {item.quantity > 1 ? `${item.quantity} units` : "1 unit"}
            </span>
          </p>
          <VerifiedDate date={item.lastVerifiedAt} />
          <p className="pt-0.5 text-sm font-medium text-foreground">
            {price ?? "Request a quote"}
            {price && item.includesShipping === false && (
              <span className="font-normal text-muted-foreground"> · excludes shipping</span>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
