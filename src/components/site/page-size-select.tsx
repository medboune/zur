"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PAGE_SIZES } from "@/lib/pagination";

/**
 * Per-page item count selector (10/20/50/100). Navigates to the same path
 * with `size` patched and `page` reset to 1, preserving every other filter.
 */
export function PageSizeSelect({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span className="whitespace-nowrap">Per page</span>
      <select
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("size", e.target.value);
          params.delete("page"); // changing the size restarts from page 1
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname);
        }}
        className="h-9 rounded-md border border-input bg-card px-2 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        aria-label="Listings per page"
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}
