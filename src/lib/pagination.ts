// Shared server-side pagination helpers.
//
// Page sizes are fixed by design (10/20/50/100, default 20) so the values
// can never be used to force a full-table dump through a crafted URL.

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];
export const DEFAULT_PAGE_SIZE: PageSize = 20;

export interface ParsedPagination {
  page: number;
  size: PageSize;
}

export function parsePagination(params: Record<string, string | string[] | undefined>): ParsedPagination {
  const rawSize = Array.isArray(params.size) ? params.size[0] : params.size;
  const sizeNum = Number(rawSize);
  const size = (PAGE_SIZES as readonly number[]).includes(sizeNum) ? (sizeNum as PageSize) : DEFAULT_PAGE_SIZE;

  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const pageNum = Number(rawPage);
  const page = Number.isInteger(pageNum) && pageNum >= 1 ? Math.floor(pageNum) : 1;

  return { page, size };
}

export interface PageWindow {
  skip: number;
  take: number;
}

export function pageWindow(page: number, size: number): PageWindow {
  return { skip: (page - 1) * size, take: size };
}

/** Total number of pages for `total` items at `size` per page (>= 1). */
export function totalPages(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

/**
 * Page numbers to render as links, with ellipsis markers (0) for gaps:
 * 1 … 4 5 6 … 12. Always includes the first and last page.
 */
export function pageWindowLinks(current: number, last: number): (number | 0)[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out: (number | 0)[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push(0); // gap
    out.push(p);
    prev = p;
  }
  return out;
}

/**
 * Build a same-path URL with pagination/filter params patched. Values that
 * are empty/undefined are dropped; `page` resets to 1 unless explicitly set.
 */
export function buildPageHref(
  basePath: string,
  current: Record<string, string | undefined>,
  patch: Record<string, string | undefined>
): string {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v) merged[k] = v;
  }
  if (!merged.page) merged.page = "1";
  if (merged.page === "1") delete merged.page;
  const qs = new URLSearchParams(merged).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
