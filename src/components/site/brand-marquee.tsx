import { FEATURED_BRANDS } from "@/lib/site";

/**
 * Slim single-row strip of well-known manufacturers we supply.
 * Names in one neutral typeface (no logos until partner agreements allow
 * them). The moving row is decorative; an accessible list follows it.
 */
export function BrandMarquee() {
  const row = [...FEATURED_BRANDS, ...FEATURED_BRANDS];
  return (
    <section aria-labelledby="brands-heading" className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 sm:gap-6 sm:px-6">
        <h2
          id="brands-heading"
          className="shrink-0 border-r border-border py-3.5 pr-4 font-mono text-[10px] font-semibold uppercase leading-tight tracking-[0.16em] text-primary sm:pr-6 sm:text-[10.5px]"
        >
          Brands
          <br className="sm:hidden" /> we supply
        </h2>
        <div className="ticker min-w-0 flex-1 overflow-hidden" aria-hidden="true">
          <div className="ticker-track flex w-max items-center">
            {row.map((b, i) => (
              <span
                key={`${b}-${i}`}
                className="font-display flex items-center whitespace-nowrap py-3.5 text-[15px] font-semibold tracking-tight text-foreground/45 transition-colors duration-300 hover:text-foreground"
              >
                {b}
                <span className="px-4 text-primary/40 sm:px-5" aria-hidden="true">
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <ul className="sr-only">
        {FEATURED_BRANDS.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </section>
  );
}
