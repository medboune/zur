import { Fragment } from "react";
import { BRAND_DISCLAIMER, BRAND_GROUPS } from "@/lib/site";

const ROWS = [BRAND_GROUPS.slice(0, 2), BRAND_GROUPS.slice(2)];

/**
 * Two slow marquee rows of manufacturer names, moving in opposite
 * directions, grouped by field. Names are set in one neutral typeface on
 * purpose — no logos and no "partner" wording: Zuronix is an independent
 * supplier. The moving rows are decorative (aria-hidden); the same names
 * are listed accessibly for screen readers and search engines.
 */
export function BrandMarquee() {
  return (
    <section aria-labelledby="brands-heading" className="border-b border-border bg-card py-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-2 px-5 sm:px-6">
        <h2 id="brands-heading" className="eyebrow">
          Manufacturers we supply
        </h2>
        <p className="text-xs text-muted-foreground">
          Data center · Semiconductor · Machine tools · Robotics · Power · Test &amp; measurement
        </p>
      </div>

      <div className="mt-6 space-y-3 sm:space-y-4" aria-hidden="true">
        {ROWS.map((groups, r) => (
          <div key={r} className="ticker overflow-hidden">
            <div className={`ticker-track ticker-slow flex w-max items-center py-1.5 ${r === 1 ? "ticker-reverse" : ""}`}>
              {[0, 1].map((copy) =>
                groups.map((g) => (
                  <Fragment key={`${copy}-${g.field}`}>
                    <span className="mx-4 shrink-0 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary sm:mx-5">
                      {g.field}
                    </span>
                    {g.brands.map((b) => (
                      <span
                        key={b}
                        className="font-display mx-4 shrink-0 whitespace-nowrap text-lg font-semibold tracking-tight text-foreground/40 transition-colors duration-300 hover:text-foreground sm:mx-5 sm:text-xl"
                      >
                        {b}
                      </span>
                    ))}
                  </Fragment>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <ul className="sr-only">
        {BRAND_GROUPS.map((g) => (
          <li key={g.field}>
            {g.field}: {g.brands.join(", ")}
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-6 w-full max-w-6xl px-5 text-[11px] leading-relaxed text-muted-foreground sm:px-6">
        {BRAND_DISCLAIMER}
      </p>
    </section>
  );
}
