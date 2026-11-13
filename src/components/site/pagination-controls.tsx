import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageWindowLinks } from "@/lib/pagination";

/**
 * Server-rendered pagination controls (plain <a> links — crawlable,
 * works without JavaScript). `hrefFor(page)` builds the target URL with
 * every current filter preserved.
 */
export function PaginationControls({
  page,
  totalPages,
  hrefFor,
  className = "",
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const linkCls = (active: boolean) =>
    `inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-foreground"
    }`;

  const pages = pageWindowLinks(page, totalPages);

  return (
    <nav aria-label="Pagination" className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={`${linkCls(false)} gap-1 px-3`}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className="inline-flex h-9 items-center gap-1 rounded-md border border-border/60 bg-card px-3 text-sm font-medium text-muted-foreground/50">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </span>
      )}

      {pages.map((p, i) =>
        p === 0 ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted-foreground">
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={linkCls(true)}>
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={linkCls(false)}>
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={`${linkCls(false)} gap-1 px-3`}>
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-disabled="true" className="inline-flex h-9 items-center gap-1 rounded-md border border-border/60 bg-card px-3 text-sm font-medium text-muted-foreground/50">
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
